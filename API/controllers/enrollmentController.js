const enrollmentService = require('../services/enrollmentService');
const { successResponse, errorResponse } = require('../utils/response');

exports.getMyDashboard = async (req, res) => {
  try {
    if (!req.user?.id) return errorResponse(res, 'Unauthorized', 401);

    const enrollmentService = require('../services/enrollmentService');
    const orderDAL          = require('../dal/orderDAL');

    const [dashData, [orders]] = await Promise.all([
      enrollmentService.getMyDashboard(req.user.id),
      orderDAL.getAllOrdersForUser(req.user.id),
    ]);

    return successResponse(res, { ...dashData, orderHistory: orders || [] });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};