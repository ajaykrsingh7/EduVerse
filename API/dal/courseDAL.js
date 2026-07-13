const {
  query,
  queryOne,
  insert,
  update,
  remove,
  paginate,
} = require("./dbHelper");

const courseSelect = `
  SELECT c.*, u.full_name AS mentor_name, u.avatar AS mentor_avatar,
    m.id AS mentor_profile_id, m.rating AS mentor_rating,
    m.title AS mentor_title, m.experience AS mentor_experience
  FROM courses c
  JOIN mentors m ON m.id = c.mentor_id
  JOIN users   u ON u.id = m.user_id
`;

// ── Listings ──────────────────────────────────────────────────────────────────
const getCourses = ({
  category,
  standard,
  search,
  mentorId,
  page = 1,
  limit = 12,
} = {}) => {
  let sql = courseSelect + ` WHERE c.is_published = 1`;
  const params = [];
  if (category) {
    sql += ` AND c.category = ?`;
    params.push(category);
  }
  if (standard) {
    sql += ` AND c.standard = ?`;
    params.push(standard);
  }
  if (search) {
    sql += ` AND c.title LIKE ?`;
    params.push(`%${search}%`);
  }
  if (mentorId) {
  sql += ` AND m.id = ?`;
  params.push(mentorId);
}
  sql += ` ORDER BY c.created_at DESC`;
  return paginate(sql, params, page, limit);
};

const getCourseById = (id) => queryOne(courseSelect + ` WHERE c.id = ?`, [id]);

// const getSimilarCourses = (category, excludeId, limit = 4) =>
//   query(
//     `${courseSelect} WHERE c.category = ? AND c.id != ? AND c.is_published = 1 LIMIT ?`,
//     [category, excludeId, limit],
//   );

const getSimilarCourses = (category, excludeId, limit = 4) =>
  query(
    `${courseSelect} 
     WHERE c.category = ? 
     AND c.id != ? 
     AND c.is_published = 1 
     LIMIT ${parseInt(limit)}`,
    [category, excludeId],
  );

// ── Playlist (video items for paid courses) ───────────────────────────────────
const getPlaylist = (courseId) =>
  query(
    `SELECT * FROM course_playlist WHERE course_id = ? ORDER BY sort_order`,
    [courseId],
  );

const addPlaylistItem = (data) => insert("course_playlist", data);

const updatePlaylistItem = (id, data) =>
  update("course_playlist", data, { id });

const deletePlaylistItem = (id) => remove("course_playlist", { id });

const replacePlaylist = async (courseId, items) => {
  const { pool } = require("../config/dbConnection");
  await pool.execute(`DELETE FROM course_playlist WHERE course_id = ?`, [
    courseId,
  ]);
  for (let i = 0; i < items.length; i++) {
    await insert("course_playlist", {
      course_id: courseId,
      ...items[i],
      sort_order: i + 1,
    });
  }
};

// ── What you'll learn bullets ─────────────────────────────────────────────────
const getLearnings = (courseId) =>
  query(`SELECT * FROM course_learnings WHERE course_id = ? ORDER BY id`, [
    courseId,
  ]);

const addLearning = (courseId, point) =>
  insert("course_learnings", { course_id: courseId, point });

const deleteLearning = (id) => remove("course_learnings", { id });

const replaceLearnings = async (courseId, points) => {
  const { pool } = require("../config/dbConnection");
  await pool.execute(`DELETE FROM course_learnings WHERE course_id = ?`, [
    courseId,
  ]);
  for (const point of points) {
    await insert("course_learnings", { course_id: courseId, point });
  }
};

// ── CRUD ──────────────────────────────────────────────────────────────────────
const createCourse = (data) => insert("courses", data);
const updateCourse = (id, data) => update("courses", data, { id });
const deleteCourse = (id) => remove("courses", { id });

module.exports = {
  getCourses,
  getCourseById,
  getSimilarCourses,
  getPlaylist,
  addPlaylistItem,
  updatePlaylistItem,
  deletePlaylistItem,
  replacePlaylist,
  getLearnings,
  addLearning,
  deleteLearning,
  replaceLearnings,
  createCourse,
  updateCourse,
  deleteCourse,
};
