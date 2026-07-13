const svc = require('../services/mentorReviewService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const { rows, total } = await svc.getReviews(req.params.mentorId, +page, +limit);
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) { return errorResponse(res, err.message, err.statusCode || 500); }
};

exports.createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const result = await svc.createReview(req.user.id, req.params.mentorId, { rating, comment });
    return successResponse(res, result, 'Review submitted', 201);
  } catch (err) { return errorResponse(res, err.message, err.statusCode || 500); }
};