const subService = require('../services/subscriptionService');
const { successResponse, errorResponse } = require('../utils/response');

exports.getMySubscription = async (req, res) => {
  try {
    const sub = await subService.getMySubscription(req.user.id);
    return successResponse(res, sub || null);
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.getMyHistory = async (req, res) => {
  try {
    const [history] = await subService.getMyHistory(req.user.id);
    return successResponse(res, history);
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    if (!planId) return errorResponse(res, 'planId is required', 400);

    const { pool } = require('../config/dbConnection');

    // Get plan details
    const [[plan]] = await pool.execute(
      `SELECT * FROM pricing_plans WHERE id = ?`, [planId]
    );
    if (!plan) return errorResponse(res, 'Plan not found', 404);

    // Deactivate previous subscriptions
    await pool.execute(
      `UPDATE subscriptions SET is_active = 0 WHERE user_id = ?`, [req.user.id]
    );

    // Calculate expiry (30 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create new subscription
    const [result] = await pool.execute(`
      INSERT INTO subscriptions (user_id, plan_id, starts_at, expires_at, is_active)
      VALUES (?, ?, NOW(), ?, 1)
    `, [req.user.id, planId, expiresAt]);

    return successResponse(res, {
      subscriptionId: result.insertId,
      planName:       plan.name,
      expiresAt,
    }, `${plan.name.charAt(0).toUpperCase() + plan.name.slice(1)} plan activated!`, 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};