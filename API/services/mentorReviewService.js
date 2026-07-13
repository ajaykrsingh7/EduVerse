const mentorReviewDAL = require('../dal/mentorReviewDAL');

const getReviews = (mentorId, page, limit) =>
  mentorReviewDAL.getReviewsByMentor(mentorId, page, limit);

const createReview = async (userId, mentorId, { rating, comment }) => {
  if (!rating || rating < 1 || rating > 5)
    throw Object.assign(new Error('Rating must be between 1 and 5'), { statusCode: 400 });

  const existing = await mentorReviewDAL.hasReviewedMentor(userId, mentorId);
  if (existing)
    throw Object.assign(new Error('You have already reviewed this mentor'), { statusCode: 409 });

  await mentorReviewDAL.createMentorReview({
    user_id:   userId,
    mentor_id: Number(mentorId),
    course_id: null,
    rating,
    comment:   comment || null,
  });

  await mentorReviewDAL.refreshMentorRating(mentorId);
  return { success: true };
};

module.exports = { getReviews, createReview };