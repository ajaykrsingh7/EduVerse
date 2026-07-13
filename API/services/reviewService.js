const reviewDAL = require('../dal/reviewDAL');
const miscDAL   = require('../dal/miscDAL');

const getReviewsByCourse = (courseId, page, limit) =>
  reviewDAL.getReviewsByCourse(courseId, page, limit);

const createReview = async (userId, { courseId, mentorId, rating, comment }) => {
  // Must be enrolled to review a course
  if (courseId) {
    const enrolled = await miscDAL.isEnrolled(userId, courseId);
    if (!enrolled)
      throw Object.assign(new Error('You must be enrolled to leave a review'), { statusCode: 403 });

    const existing = await reviewDAL.hasReviewed(userId, courseId);
    if (existing)
      throw Object.assign(new Error('You have already reviewed this course'), { statusCode: 409 });
  }

  await reviewDAL.createReview({
    user_id:   userId,
    course_id: courseId || null,
    mentor_id: mentorId || null,
    rating,
    comment:   comment || null,
  });

  // Refresh the cached avg rating on the course
  if (courseId) await reviewDAL.refreshCourseRating(courseId);

  return { success: true };
};

const deleteReview = (id) => reviewDAL.deleteReview(id);

module.exports = { getReviewsByCourse, createReview, deleteReview };