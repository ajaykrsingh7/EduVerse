const { query, queryOne, update, remove, paginate } = require("./dbHelper");

// ── Overview stats ────────────────────────────────────────────────────────────
const getStats = async () => {
  const pool = require("../config/dbConnection").pool;

  const [[users]] = await pool.execute(`SELECT COUNT(*) AS total FROM users`);
  const [[students]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM users WHERE role='student'`,
  );
  const [[mentors]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM mentors WHERE is_approved=1`,
  );
  const [[courses]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM courses WHERE is_published=1`,
  );
  const [[books]] = await pool.execute(`SELECT COUNT(*) AS total FROM books`);
  const [[enrollments]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM enrollments`,
  );
  const [[newsletter]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM newsletter`,
  );
  const [[pending]] = await pool.execute(
    `SELECT COUNT(*) AS total FROM instructor_applications WHERE status='pending'`,
  );

  return {
    totalUsers: users.total,
    totalStudents: students.total,
    totalMentors: mentors.total,
    totalCourses: courses.total,
    totalBooks: books.total,
    totalEnrollments: enrollments.total,
    newsletterSubscribers: newsletter.total,
    pendingApplications: pending.total,
  };
};

// ── Recent activity ───────────────────────────────────────────────────────────
const getRecentEnrollments = (limit = 8) =>
  query(`
    SELECT e.enrolled_at, u.full_name AS student, u.email, c.title AS course, c.price
    FROM enrollments e
    JOIN users u   ON u.id = e.user_id
    JOIN courses c ON c.id = e.course_id
    ORDER BY e.enrolled_at DESC 
    LIMIT ${parseInt(limit)}
  `);

const getRecentUsers = (limit = 8) =>
  query(`
    SELECT id, full_name, email, role, avatar, created_at
    FROM users 
    ORDER BY created_at DESC 
    LIMIT ${parseInt(limit)}
  `);

// ── Users management ──────────────────────────────────────────────────────────
const getAllUsers = ({ search, role, page = 1, limit = 15 }) => {
  let sql = `SELECT id, full_name, email, role, avatar, created_at FROM users WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ` AND (full_name LIKE ? OR email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (role) {
    sql += ` AND role = ?`;
    params.push(role);
  }

  sql += ` ORDER BY created_at DESC`;
  return paginate(sql, params, page, limit);
};

const updateUserRole = (id, role) => update("users", { role }, { id });
const deleteUser = (id) => remove("users", { id });

// ── Courses management ────────────────────────────────────────────────────────
const getAllCourses = ({ search, category, page = 1, limit = 15 }) => {
  let sql = `
    SELECT c.*, u.full_name AS mentor_name
    FROM courses c
    JOIN mentors m ON m.id = c.mentor_id
    JOIN users   u ON u.id = m.user_id
    WHERE 1=1`;

  const params = [];

  if (search) {
    sql += ` AND c.title LIKE ?`;
    params.push(`%${search}%`);
  }

  if (category) {
    sql += ` AND c.category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY c.created_at DESC`;
  return paginate(sql, params, page, limit);
};

const toggleCoursePublish = async (id) => {
  const course = await queryOne(`SELECT is_published FROM courses WHERE id=?`, [
    id,
  ]);
  if (!course) throw new Error("Course not found");

  return update(
    "courses",
    { is_published: course.is_published ? 0 : 1 },
    { id },
  );
};

const deleteCourse = (id) => remove("courses", { id });
const createCourse = (data) => require("./dbHelper").insert("courses", data);
const updateCourse = (id, data) => update("courses", data, { id });

// ── Mentors management ────────────────────────────────────────────────────────
const getAllMentors = ({ search, page = 1, limit = 15 }) => {
  let sql = `
    SELECT m.*, u.full_name, u.email, u.avatar
    FROM mentors m 
    JOIN users u ON u.id = m.user_id 
    WHERE 1=1`;

  const params = [];

  if (search) {
    sql += ` AND (u.full_name LIKE ? OR u.email LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY m.created_at DESC`;
  return paginate(sql, params, page, limit);
};

const toggleMentorApproval = async (id) => {
  const m = await queryOne(`SELECT is_approved FROM mentors WHERE id=?`, [id]);
  if (!m) throw new Error("Mentor not found");

  return update("mentors", { is_approved: m.is_approved ? 0 : 1 }, { id });
};

const deleteMentor = (id) => remove("mentors", { id });

// ── Books management ──────────────────────────────────────────────────────────
const getAllBooks = ({ search, category, page = 1, limit = 15 }) => {
  let sql = `SELECT * FROM books WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ` AND title LIKE ?`;
    params.push(`%${search}%`);
  }

  if (category) {
    sql += ` AND category = ?`;
    params.push(category);
  }

  sql += ` ORDER BY created_at DESC`;
  return paginate(sql, params, page, limit);
};

const createBook = (data) => require("./dbHelper").insert("books", data);
const updateBook = (id, data) => update("books", data, { id });
const deleteBook = (id) => remove("books", { id });

// ── Instructor applications ───────────────────────────────────────────────────
const getApplications = ({ status, page = 1, limit = 15 }) => {
  let sql = `
    SELECT ia.*, u.full_name, u.email, u.avatar
    FROM instructor_applications ia
    JOIN users u ON u.id = ia.user_id 
    WHERE 1=1`;

  const params = [];

  if (status) {
    sql += ` AND ia.status = ?`;
    params.push(status);
  }

  sql += ` ORDER BY ia.applied_at DESC`;
  return paginate(sql, params, page, limit);
};

const updateApplication = (id, status) =>
  update(
    "instructor_applications",
    { status, reviewed_at: new Date() },
    { id },
  );

// ── Newsletter ────────────────────────────────────────────────────────────────
const getNewsletter = ({ page = 1, limit = 15 }) =>
  paginate(
    `SELECT * FROM newsletter ORDER BY created_at DESC`,
    [],
    page,
    limit,
  );

// ── Enrollments ───────────────────────────────────────────────────────────────
const getEnrollments = ({ search, page = 1, limit = 15 }) => {
  let sql = `
    SELECT e.*, u.full_name AS student, u.email, c.title AS course, c.price
    FROM enrollments e
    JOIN users u   ON u.id = e.user_id
    JOIN courses c ON c.id = e.course_id 
    WHERE 1=1`;

  const params = [];

  if (search) {
    sql += ` AND (u.full_name LIKE ? OR c.title LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY e.enrolled_at DESC`;
  return paginate(sql, params, page, limit);
};

// ── Monthly stats ─────────────────────────────────────────────────────────────
const getMonthlyStats = () =>
  query(`
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS users
    FROM users
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY month ORDER BY month ASC
  `);

const getMonthlyEnrollments = () =>
  query(`
    SELECT DATE_FORMAT(enrolled_at, '%Y-%m') AS month, COUNT(*) AS enrollments
    FROM enrollments
    WHERE enrolled_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
    GROUP BY month ORDER BY month ASC
  `);

module.exports = {
  getStats,
  getRecentEnrollments,
  getRecentUsers,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllCourses,
  toggleCoursePublish,
  deleteCourse,
  createCourse,
  updateCourse,
  getAllMentors,
  toggleMentorApproval,
  deleteMentor,
  getAllBooks,
  createBook,
  updateBook,
  deleteBook,
  getApplications,
  updateApplication,
  getNewsletter,
  getEnrollments,
  getMonthlyStats,
  getMonthlyEnrollments,
};
