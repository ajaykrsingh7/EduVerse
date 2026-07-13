const bookDAL  = require('../dal/bookDAL');
const miscDAL  = require('../dal/miscDAL');

// Books 
const getBooks = (filters) => bookDAL.getBooks(filters);

const getShopData = async () => {
  const [[popular], [newArrivals]] = await Promise.all([
    bookDAL.getPopularBooks(6),
    bookDAL.getNewArrivals(6),
  ]);
  return { popular, newArrivals };
};

const getBookById = async (id) => {
  const book = await bookDAL.getBookById(id);
  if (!book) throw Object.assign(new Error('Book not found'), { statusCode: 404 });
  return book;
};

//  Pricing 
const getPlans = () => miscDAL.getAllPlans();

const getPlanDetail = async (id) => {
  const plan = await miscDAL.getPlanById(id);
  if (!plan) throw Object.assign(new Error('Plan not found'), { statusCode: 404 });
  return plan;
};

//  Newsletter 
const subscribeNewsletter = async (email) => {
  const exists = await miscDAL.isSubscribed(email);
  if (exists) throw Object.assign(new Error('Already subscribed'), { statusCode: 409 });
  await miscDAL.subscribe(email);
  return { subscribed: true };
};

module.exports = {
  getBooks, getShopData, getBookById,
  getPlans, getPlanDetail,
  subscribeNewsletter,
};