const db = require("./dbHelper");

//Pricing
const getAllPlans = () =>
  db.query(`SELECT * FROM pricing_plans ORDER BY price ASC`);
const getPlanById = (id) =>
  db.queryOne(`SELECT * FROM pricing_plans WHERE id = ?`, [id]);
const getPlanByName = (name) =>
  db.queryOne(`SELECT * FROM pricing_plans WHERE name = ?`, [name]);

//Enrollments
const enroll = (userId, courseId) =>
  db.insert("enrollments", { user_id: userId, course_id: courseId });

const getEnrollments = (userId) =>
  db.query(
    `
    SELECT
      e.id AS enrollment_id,
      e.enrolled_at,
      c.id AS course_id,
      c.title,
      c.thumbnail,
      c.price,
      c.category,
      c.lessons,
      c.rating,
      c.language,
      c.is_free,
      u.full_name AS mentor_name,
      u.avatar    AS mentor_avatar,
      (SELECT COUNT(*) FROM lesson_progress lp
        JOIN chapter_lessons cl ON cl.id = lp.lesson_id
        JOIN course_chapters  cc ON cc.id = cl.chapter_id
        WHERE lp.user_id = e.user_id AND cc.course_id = c.id
      ) AS lessons_completed
    FROM enrollments e
    JOIN courses c  ON c.id  = e.course_id
    JOIN mentors m  ON m.id  = c.mentor_id
    JOIN users   u  ON u.id  = m.user_id
    WHERE e.user_id = ?
    ORDER BY e.enrolled_at DESC
  `,
    [userId],
  );

const isEnrolled = (userId, courseId) =>
  db.queryOne(
    `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?`,
    [userId, courseId],
  );

//Newsletter
const subscribe = (email) => db.insert("newsletter", { email });
const isSubscribed = (email) =>
  db.queryOne(`SELECT id FROM newsletter WHERE email = ?`, [email]);

//Instructor Applications
const applyAsInstructor = (userId, data) =>
  db.insert("instructor_applications", { user_id: userId, ...data });

const getApplication = (userId) =>
  db.queryOne(
    `SELECT * FROM instructor_applications WHERE user_id = ? ORDER BY applied_at DESC LIMIT 1`,
    [userId],
  );

const updateApplication = (id, data) =>
  db.update("instructor_applications", data, { id });

const getPendingApplications = () =>
  db.query(`
    SELECT ia.*, u.full_name, u.email
    FROM instructor_applications ia
    JOIN users u ON u.id = ia.user_id
    WHERE ia.status = 'pending'
    ORDER BY ia.applied_at DESC
  `);

const getSubscriptionWithEnrollments = (userId) =>
  db.queryOne(`
    SELECT s.*, p.name AS plan_name, p.price AS plan_price,
           p.hd_lessons, p.official_exams, p.practice_questions,
           p.free_books, p.has_quizzes, p.has_explanations, p.has_instructor
    FROM subscriptions s
    JOIN pricing_plans p ON p.id = s.plan_id
    WHERE s.user_id = ? AND s.is_active = 1 AND s.expires_at > NOW()
    ORDER BY s.starts_at DESC LIMIT 1
  `, [userId]);

module.exports = {
  getAllPlans,
  getPlanById,
  getPlanByName,
  enroll,
  getEnrollments,
  isEnrolled,
  subscribe,
  isSubscribed,
  applyAsInstructor,
  getApplication,
  updateApplication,
  getPendingApplications,
  getSubscriptionWithEnrollments,
};
