const { insert, query, queryOne } = require('./dbHelper');
const { pool } = require('../config/dbConnection');

const createOrder = async (userId, items, total) => {
  const orderId = await insert('orders', {
    user_id: userId,
    total_amount: total,
    status: 'pending',
  });

  for (const item of items) {
    await insert('order_items', {
      order_id:  orderId,
      item_type: item.type,
      item_id:   item.id,
      title:     item.title,
      price:     item.price,
    });
  }
  return orderId;
};

const markPaid = (orderId, paymentRef) =>
  require('./dbHelper').update('orders', {
    status: 'paid',
    payment_ref: paymentRef,
    paid_at: new Date(),
  }, { id: orderId });

const getOrderById = (id) =>
  queryOne(`SELECT * FROM orders WHERE id = ?`, [id]);

const getOrderItems = (orderId) =>
  query(`SELECT * FROM order_items WHERE order_id = ?`, [orderId]);

const getUserOrders = (userId) =>
  query(`
    SELECT o.*, COUNT(oi.id) AS item_count
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ?
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [userId]);

const getAllOrdersForUser = (userId) =>
  require('../config/dbConnection').pool.execute(`
    SELECT o.id, o.total_amount, o.status, o.payment_ref,
           o.paid_at, o.created_at,
           COUNT(oi.id) AS item_count,
           GROUP_CONCAT(oi.title SEPARATOR ', ') AS items_summary
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = ? AND o.status = 'paid'
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `, [userId]);


module.exports = { createOrder, markPaid, getOrderById, getOrderItems, getUserOrders, getAllOrdersForUser };