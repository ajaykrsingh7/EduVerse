const learnDAL  = require('../dal/learnDAL');
const courseDAL = require('../dal/courseDAL');
const { pool }  = require('../config/dbConnection');

const getFreeCourses = async () => {
  const [rows] = await pool.execute(`
    SELECT c.*, u.full_name AS mentor_name, u.avatar AS mentor_avatar,
      (SELECT COUNT(*) FROM course_chapters WHERE course_id = c.id) AS chapter_count,
      (SELECT COUNT(*) FROM chapter_lessons cl
        JOIN course_chapters cc ON cc.id = cl.chapter_id
        WHERE cc.course_id = c.id) AS lesson_count
    FROM courses c
    JOIN mentors m ON m.id = c.mentor_id
    JOIN users   u ON u.id = m.user_id
    WHERE c.is_free = 1 AND c.is_published = 1
    ORDER BY c.created_at DESC
  `);
  return rows;
};

const getCourseWithContent = async (courseId, userId = null) => {
  const course = await courseDAL.getCourseById(courseId);
  if (!course)         throw Object.assign(new Error('Course not found'), { statusCode: 404 });
  if (!course.is_free) throw Object.assign(new Error('This course is not a free course'), { statusCode: 403 });

  const chapters = await learnDAL.getCourseContentTree(courseId);
  let progress = null;
  if (userId) {
    progress = await learnDAL.getCourseProgress(userId, courseId);
  }
  return { course, chapters, progress };
};

const getLesson = async (courseId, lessonId, userId = null) => {
  const lesson = await learnDAL.getLessonById(lessonId);
  if (!lesson) throw Object.assign(new Error('Lesson not found'), { statusCode: 404 });

  const nav  = await learnDAL.getPrevNextLesson(lessonId, courseId);
  let completed = false;
  if (userId) {
    const [rows] = await learnDAL.getCompletedLessons(userId, courseId);
    completed = rows.some(r => r.lesson_id === Number(lessonId));
  }
  return { lesson, nav, completed };
};

const markComplete = async (userId, courseId, lessonId) => {
  await learnDAL.markLessonComplete(userId, lessonId);
  const progress = await learnDAL.getCourseProgress(userId, courseId);
  return { progress };
};

module.exports = { getFreeCourses, getCourseWithContent, getLesson, markComplete };