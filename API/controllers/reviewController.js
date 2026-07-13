const reviewService = require('../services/reviewService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

exports.getCourseReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { rows, total } = await reviewService.getReviewsByCourse(req.params.courseId, +page, +limit);
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) { return errorResponse(res, err.message, err.statusCode || 500); }
};

exports.createReview = async (req, res) => {
  try {
    const { courseId, mentorId, rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5)
      return errorResponse(res, 'Rating must be between 1 and 5', 400);
    const result = await reviewService.createReview(req.user.id, { courseId, mentorId, rating, comment });
    return successResponse(res, result, 'Review submitted', 201);
  } catch (err) { return errorResponse(res, err.message, err.statusCode || 500); }
};

exports.deleteReview = async (req, res) => {
  try {
    await reviewService.deleteReview(req.params.id);
    return successResponse(res, null, 'Review deleted');
  } catch (err) { return errorResponse(res, err.message, 500); }
};