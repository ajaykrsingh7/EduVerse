const orderDAL  = require('../dal/orderDAL');
const miscDAL   = require('../dal/miscDAL');
const { successResponse, errorResponse } = require('../utils/response');

// POST /api/v1/orders/checkout
exports.checkout = async (req, res) => {
  try {
    const { items, paymentDetails } = req.body;
    // items: [{ id, type, title, price }]

    if (!items?.length)
      return errorResponse(res, 'Cart is empty', 400);

    const total   = items.reduce((s, i) => s + Number(i.price), 0);
    const orderId = await orderDAL.createOrder(req.user.id, items, total);

    // ── Dummy payment processing ──────────────────────────────────────
    // Simulate 95% success rate; fail on card ending in 0000
    const cardNum = paymentDetails?.cardNumber?.replace(/\s/g, '') || '';
    const fail    = cardNum.endsWith('0000');

    if (fail) {
      return errorResponse(res, 'Payment declined. Please try a different card.', 402);
    }

    const paymentRef = `PAY-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    await orderDAL.markPaid(orderId, paymentRef);

    // After: await orderDAL.markPaid(orderId, paymentRef);

// Auto-enroll courses + activate plan subscriptions
for (const item of items) {
  if (item.type === 'course') {
    await miscDAL.enroll(req.user.id, item.id).catch(() => {});
  }
  if (item.type === 'plan') {
    // Deactivate old subscriptions
    const { pool } = require('../config/dbConnection');
    await pool.execute(
      `UPDATE subscriptions SET is_active = 0 WHERE user_id = ?`, [req.user.id]
    );
    // Create subscription (30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await pool.execute(`
      INSERT INTO subscriptions (user_id, plan_id, starts_at, expires_at, is_active)
      VALUES (?, ?, NOW(), ?, 1)
    `, [req.user.id, item.id, expiresAt]);
  }
}

    const order = await orderDAL.getOrderById(orderId);
    return successResponse(res, { order, paymentRef }, 'Payment successful', 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// GET /api/v1/orders/my-orders
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await orderDAL.getUserOrders(req.user.id);
    return successResponse(res, orders);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// GET /api/v1/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await orderDAL.getOrderById(req.params.id);
    if (!order) return errorResponse(res, 'Order not found', 404);
    if (order.user_id !== req.user.id && req.user.role !== 'admin')
      return errorResponse(res, 'Unauthorized', 403);
    const [items] = await orderDAL.getOrderItems(req.params.id);
    return successResponse(res, { ...order, items });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};