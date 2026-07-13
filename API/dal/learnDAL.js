const { query, queryOne, insert, update, remove } = require('./dbHelper');
const { pool } = require('../config/dbConnection');

// ── Chapters ──────────────────────────────────────────────────────────────────
const getChaptersByCourse = (courseId) =>
  query(`SELECT * FROM course_chapters WHERE course_id = ? ORDER BY sort_order ASC`, [courseId]);

const getChapterById = (id) =>
  queryOne(`SELECT * FROM course_chapters WHERE id = ?`, [id]);

const createChapter = (data) => insert('course_chapters', data);
const updateChapter = (id, data) => update('course_chapters', data, { id });
const deleteChapter = (id) => remove('course_chapters', { id });

// ── Lessons ───────────────────────────────────────────────────────────────────
const getLessonsByChapter = (chapterId) =>
  query(`SELECT * FROM chapter_lessons WHERE chapter_id = ? ORDER BY sort_order ASC`, [chapterId]);

const getLessonById = (id) =>
  queryOne(`
    SELECT cl.*, cc.course_id, cc.title AS chapter_title, cc.id AS chapter_id
    FROM chapter_lessons cl
    JOIN course_chapters cc ON cc.id = cl.chapter_id
    WHERE cl.id = ?
  `, [id]);

const createLesson = (data) => insert('chapter_lessons', data);
const updateLesson = (id, data) => update('chapter_lessons', data, { id });
const deleteLesson = (id) => remove('chapter_lessons', { id });

// ── Quizzes ───────────────────────────────────────────────────────────────────
const getQuizzesByChapter = (chapterId) =>
  query(`SELECT * FROM chapter_quizzes WHERE chapter_id = ?`, [chapterId]);

const createQuiz = (data) => insert('chapter_quizzes', data);
const updateQuiz = (id, data) => update('chapter_quizzes', data, { id });
const deleteQuiz = (id) => remove('chapter_quizzes', { id });

// ── Progress ──────────────────────────────────────────────────────────────────
const markLessonComplete = (userId, lessonId) =>
  pool.execute(`
    INSERT INTO lesson_progress (user_id, lesson_id)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE completed_at = NOW()
  `, [userId, lessonId]);

const getCompletedLessons = (userId, courseId) =>
  query(`
    SELECT lp.lesson_id
    FROM lesson_progress lp
    JOIN chapter_lessons cl ON cl.id = lp.lesson_id
    JOIN course_chapters cc ON cc.id = cl.chapter_id
    WHERE lp.user_id = ? AND cc.course_id = ?
  `, [userId, courseId]);

const getCourseProgress = async (userId, courseId) => {
  const [[{ total }]] = await pool.execute(`
    SELECT COUNT(*) AS total
    FROM chapter_lessons cl
    JOIN course_chapters cc ON cc.id = cl.chapter_id
    WHERE cc.course_id = ?
  `, [courseId]);

  const [[{ done }]] = await pool.execute(`
    SELECT COUNT(*) AS done
    FROM lesson_progress lp
    JOIN chapter_lessons cl ON cl.id = lp.lesson_id
    JOIN course_chapters cc ON cc.id = cl.chapter_id
    WHERE lp.user_id = ? AND cc.course_id = ?
  `, [userId, courseId]);

  return { total, done, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
};

// ── Full course content tree ───────────────────────────────────────────────────
const getCourseContentTree = async (courseId) => {
  const [chapters] = await getChaptersByCourse(courseId);
  for (const ch of chapters) {
    const [lessons] = await getLessonsByChapter(ch.id);
    const [quizzes] = await getQuizzesByChapter(ch.id);
    ch.lessons = lessons;
    ch.quizzes = quizzes;
  }
  return chapters;
};

// ── Prev/next navigation ──────────────────────────────────────────────────────
const getPrevNextLesson = async (lessonId, courseId) => {
  const [all] = await query(`
    SELECT cl.id, cl.title, cl.sort_order, cc.sort_order AS chap_order
    FROM chapter_lessons cl
    JOIN course_chapters cc ON cc.id = cl.chapter_id
    WHERE cc.course_id = ?
    ORDER BY cc.sort_order ASC, cl.sort_order ASC
  `, [courseId]);

  const idx = all.findIndex(l => l.id === Number(lessonId));
  return {
    prev:    idx > 0              ? all[idx - 1] : null,
    next:    idx < all.length - 1 ? all[idx + 1] : null,
    total:   all.length,
    current: idx + 1,
  };
};

module.exports = {
  getChaptersByCourse, getChapterById, createChapter, updateChapter, deleteChapter,
  getLessonsByChapter, getLessonById, createLesson, updateLesson, deleteLesson,
  getQuizzesByChapter, createQuiz, updateQuiz, deleteQuiz,
  markLessonComplete, getCompletedLessons, getCourseProgress,
  getCourseContentTree, getPrevNextLesson,
};