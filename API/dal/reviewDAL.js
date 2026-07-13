const { query, queryOne, insert, remove, paginate } = require('./dbHelper');
const { pool } = require('../config/dbConnection');

// Public reads 
const getReviewsByCourse = (courseId, page = 1, limit = 10) =>
  paginate(`
    SELECT r.*, u.full_name AS reviewer, u.avatar AS reviewer_avatar
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.course_id = ?
    ORDER BY r.created_at DESC
  `, [courseId], page, limit);

const getReviewsByMentor = (mentorId, page = 1, limit = 10) =>
  paginate(`
    SELECT r.*, u.full_name AS reviewer, u.avatar AS reviewer_avatar
    FROM reviews r
    JOIN users u ON u.id = r.user_id
    WHERE r.mentor_id = ?
    ORDER BY r.created_at DESC
  `, [mentorId], page, limit);

// Write 
const createReview = (data) => insert('reviews', data);

const hasReviewed = (userId, courseId) =>
  queryOne(`SELECT id FROM reviews WHERE user_id = ? AND course_id = ?`, [userId, courseId]);

const deleteReview = (id) => remove('reviews', { id });

// Recalculate + persist avg rating on course 
const refreshCourseRating = async (courseId) => {
  const [[row]] = await pool.execute(
    `SELECT COUNT(*) AS cnt, COALESCE(AVG(rating), 0) AS avg
     FROM reviews WHERE course_id = ?`, [courseId]
  );
  await pool.execute(
    `UPDATE courses SET rating = ?, total_reviews = ? WHERE id = ?`,
    [parseFloat(row.avg).toFixed(2), row.cnt, courseId]
  );
};

// Admin reads 
const getAllReviews = (page = 1, limit = 15) =>
  paginate(`
    SELECT
      r.id,
      r.rating,
      r.comment,
      r.created_at,
      u.full_name  AS reviewer,
      u.email      AS user_email,
      u.avatar     AS reviewer_avatar,
      c.title      AS course_title,
      c.id         AS course_id,
      m.id         AS mentor_id,
      u2.full_name AS mentor_name
    FROM reviews r
    JOIN users u        ON u.id  = r.user_id
    LEFT JOIN courses c ON c.id  = r.course_id
    LEFT JOIN mentors m ON m.id  = r.mentor_id
    LEFT JOIN users u2  ON u2.id = m.user_id
    ORDER BY r.created_at DESC
  `, [], page, limit);

module.exports = {
  getReviewsByCourse, getReviewsByMentor,
  createReview, hasReviewed, deleteReview,
  refreshCourseRating, getAllReviews,
};