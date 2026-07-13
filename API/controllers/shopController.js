const shopService = require("../services/shopService");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");

exports.getBooks = async (req, res) => {
  try {
    const { category, search, sort, page = 1, limit = 12 } = req.query;
    const { rows, total } = await shopService.getBooks({
      category,
      search,
      sort,
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.getShopData = async (req, res) => {
  try {
    const data = await shopService.getShopData();
    return successResponse(res, data);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await shopService.getBookById(req.params.id);
    return successResponse(res, book);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.getPlans = async (req, res) => {
  try {
    const [plans] = await shopService.getPlans();
    return successResponse(res, plans);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.getPlanDetail = async (req, res) => {
  try {
    const plan = await shopService.getPlanDetail(req.params.id);
    return successResponse(res, plan);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return errorResponse(res, "Email is required", 400);
    const result = await shopService.subscribeNewsletter(email);
    return successResponse(res, result, "Subscribed successfully", 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};
