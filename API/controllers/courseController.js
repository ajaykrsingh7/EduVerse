const courseService = require("../services/courseService");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");

exports.getCourses = async (req, res) => {
  try {
    const { category, standard, search, mentorId, page = 1, limit = 12 } = req.query;
    const { rows, total } = await courseService.getCourses({
      category,
      standard,
      search,
      mentorId,
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseDetail(req.params.id);
    return successResponse(res, course);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.enrollCourse = async (req, res) => {
  try {
    const result = await courseService.enrollInCourse(
      req.user.id,
      req.params.id,
    );
    return successResponse(res, result, "Enrolled successfully", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    if (!req.user?.id) return errorResponse(res, 'Unauthorized', 401);
    const [rows] = await courseService.getUserEnrollments(req.user.id);
    return successResponse(res, rows || []);
  } catch (err) { return errorResponse(res, err.message, err.statusCode || 500); }
};
