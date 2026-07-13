const courseDAL = require("../dal/courseDAL");
const reviewDAL = require("../dal/reviewDAL");
const miscDAL = require("../dal/miscDAL");

const getCourses = (filters) => courseDAL.getCourses(filters);

const getCourseDetail = async (id) => {
  const course = await courseDAL.getCourseById(id);
  if (!course) throw Object.assign(new Error('Course not found'), { statusCode: 404 });

  const learnDAL = require('../dal/learnDAL');

  const [[playlist], [learnings], similar, { rows: reviews }, chapters] = await Promise.all([
    courseDAL.getPlaylist(id),
    courseDAL.getLearnings(id),
    courseDAL.getSimilarCourses(course.category, id),
    reviewDAL.getReviewsByCourse(id, 1, 5),
    learnDAL.getCourseContentTree(id),   // <-- ADD THIS
  ]);

  return { ...course, playlist, learnings, similar, reviews, chapters };
};

const enrollInCourse = async (userId, courseId) => {
  const course = await courseDAL.getCourseById(courseId);
  if (!course)
    throw Object.assign(new Error("Course not found"), { statusCode: 404 });

  const already = await miscDAL.isEnrolled(userId, courseId);
  if (already)
    throw Object.assign(new Error("Already enrolled"), { statusCode: 409 });

  await miscDAL.enroll(userId, courseId);
  return { enrolled: true };
};

const getUserEnrollments = (userId) => miscDAL.getEnrollments(userId);

module.exports = {
  getCourses,
  getCourseDetail,
  enrollInCourse,
  getUserEnrollments,
};
