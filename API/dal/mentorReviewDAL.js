const { paginate, insert, queryOne } = require('./dbHelper');
const { pool } = require('../config/dbConnection');

// Get all reviews for a specific mentor
const getReviewsByMentor = (mentorId, page = 1, limit = 10) =>
  paginate(`
    SELECT r.*, u.full_name AS reviewer, u.avatar AS reviewer_avatar
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.mentor_id = ?
    ORDER BY r.created_at DESC
  `, [mentorId], page, limit);

// Check if user already reviewed this mentor
const hasReviewedMentor = (userId, mentorId) =>
  queryOne(
    `SELECT id FROM reviews WHERE user_id = ? AND mentor_id = ?`,
    [userId, mentorId]
  );

// Create a mentor review
const createMentorReview = (data) => insert('reviews', data);

// Recalculate and save avg rating on mentor
const refreshMentorRating = async (mentorId) => {
  const [[row]] = await pool.execute(
    `SELECT COUNT(*) AS cnt, COALESCE(AVG(rating), 0) AS avg
     FROM reviews WHERE mentor_id = ?`,
    [mentorId]
  );
  await pool.execute(
    `UPDATE mentors SET rating = ?, total_reviews = ? WHERE id = ?`,
    [parseFloat(row.avg).toFixed(2), row.cnt, mentorId]
  );
};

module.exports = {
  getReviewsByMentor,
  hasReviewedMentor,
  createMentorReview,
  refreshMentorRating,
};