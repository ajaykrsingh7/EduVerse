const mentorService = require("../services/mentorService");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");

exports.getMentors = async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.query;
    const { rows, total } = await mentorService.getMentors({
      category,
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.getMentorById = async (req, res) => {
  try {
    const mentor = await mentorService.getMentorById(req.params.id);
    return successResponse(res, mentor);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// exports.applyAsMentor = async (req, res) => {
//   try {
//     await mentorService.applyAsMentor(req.user.id);
//     return successResponse(
//       res,
//       null,
//       "Application submitted successfully",
//       201,
//     );
//   } catch (err) {
//     return errorResponse(res, err.message, err.statusCode || 500);
//   }
// };


// exports.applyAsMentor = async (req, res) => {
//   try {
//     if (!req.body.agreedTerms)
//       return errorResponse(res, 'You must agree to the terms and conditions', 400);
//     await mentorService.applyAsMentor(req.user.id, req.body);
//     return successResponse(res, null, 'Application submitted successfully. We will review it shortly.', 201);
//   } catch (err) {
//     return errorResponse(res, err.message, err.statusCode || 500);
//   }
// };

exports.applyAsMentor = async (req, res) => {
  try {
    if (!req.body.agreedTerms) {
      return errorResponse(res, 'You must agree to the terms and conditions', 400);
    }

    await mentorService.applyAsMentor(req.user.id, req.body);

    return successResponse(
      res,
      null,
      'Application submitted successfully.',
      201
    );
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};


