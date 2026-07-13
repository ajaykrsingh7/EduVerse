const learnService = require('../services/learnService');
const { successResponse, errorResponse } = require('../utils/response');

exports.getFreeCourses = async (req, res) => {
  try {
    const courses = await learnService.getFreeCourses();
    return successResponse(res, courses);
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.getCourseContent = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const result = await learnService.getCourseWithContent(req.params.courseId, userId);
    return successResponse(res, result);
  } catch (err) { return errorResponse(res, err.message, err.statusCode || 500); }
};

exports.getLesson = async (req, res) => {
  try {
    const userId = req.user?.id || null;
    const result = await learnService.getLesson(req.params.courseId, req.params.lessonId, userId);
    return successResponse(res, result);
  } catch (err) { return errorResponse(res, err.message, err.statusCode || 500); }
};

exports.markComplete = async (req, res) => {
  try {
    const result = await learnService.markComplete(req.user.id, req.params.courseId, req.params.lessonId);
    return successResponse(res, result, 'Lesson marked as complete');
  } catch (err) { return errorResponse(res, err.message, 500); }
};