const { query, queryOne, insert, update } = require('./dbHelper');
const { pool } = require('../config/dbConnection');

// Create a subscription when user purchases a plan
const createSubscription = (userId, planId, expiresAt) =>
  insert('subscriptions', {
    user_id:    userId,
    plan_id:    planId,
    starts_at:  new Date(),
    expires_at: expiresAt,
    is_active:  1,
  });

// Get user's active subscription with plan details
const getActiveSubscription = (userId) =>
  queryOne(`
    SELECT s.*, p.name AS plan_name, p.price,
           p.hd_lessons, p.official_exams, p.practice_questions,
           p.free_books, p.has_quizzes, p.has_explanations, p.has_instructor
    FROM subscriptions s
    JOIN pricing_plans p ON p.id = s.plan_id
    WHERE s.user_id = ? AND s.is_active = 1 AND s.expires_at > NOW()
    ORDER BY s.starts_at DESC LIMIT 1
  `, [userId]);

// Get full subscription history for a user
const getSubscriptionHistory = (userId) =>
  query(`
    SELECT s.*, p.name AS plan_name, p.price
    FROM subscriptions s
    JOIN pricing_plans p ON p.id = s.plan_id
    WHERE s.user_id = ?
    ORDER BY s.starts_at DESC
  `, [userId]);

// Deactivate old subscriptions when a new one is purchased
const deactivatePreviousSubscriptions = (userId) =>
  pool.execute(`UPDATE subscriptions SET is_active = 0 WHERE user_id = ?`, [userId]);

// Admin: all subscriptions
const getAllSubscriptions = () =>
  query(`
    SELECT s.*, u.full_name, u.email, p.name AS plan_name
    FROM subscriptions s
    JOIN users u ON u.id = s.user_id
    JOIN pricing_plans p ON p.id = s.plan_id
    ORDER BY s.starts_at DESC
  `);

module.exports = {
  createSubscription,
  getActiveSubscription,
  getSubscriptionHistory,
  deactivatePreviousSubscriptions,
  getAllSubscriptions,
};