const miscDAL = require('../dal/miscDAL');
const { pool } = require('../config/dbConnection');

/**
 * Get everything for a student's "My Enrollments" page:
 *  - Active subscription plan
 *  - All enrolled courses with progress
 *  - Subscription history
 */
const getMyDashboard = async (userId) => {
  // 1. Active subscription
  const subscription = await miscDAL.getSubscriptionWithEnrollments(userId);

  // 2. All course enrollments with lesson progress
  const [enrollments] = await miscDAL.getEnrollments(userId);

  // 3. Attach total lesson count to each enrollment for % calculation
  for (const enr of enrollments) {
    const [[{ total }]] = await pool.execute(`
      SELECT COUNT(*) AS total
      FROM chapter_lessons cl
      JOIN course_chapters cc ON cc.id = cl.chapter_id
      WHERE cc.course_id = ?
    `, [enr.course_id]);

    enr.total_lessons   = total || enr.lessons || 0;
    enr.progress_percent = enr.total_lessons > 0
      ? Math.round((enr.lessons_completed / enr.total_lessons) * 100)
      : 0;
  }

  // 4. Subscription history
  const [subHistory] = await pool.execute(`
    SELECT s.*, p.name AS plan_name, p.price
    FROM subscriptions s
    JOIN pricing_plans p ON p.id = s.plan_id
    WHERE s.user_id = ?
    ORDER BY s.starts_at DESC
  `, [userId]);

  return { subscription, enrollments, subHistory };
};

module.exports = { getMyDashboard };