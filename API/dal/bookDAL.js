const { queryOne, insert, update, remove, paginate, query } = require("./dbHelper");

const getBooks = async ({ category, search, sort, page = 1, limit = 12 } = {}) => {
  let sql = `SELECT * FROM books WHERE 1=1`;
  const params = [];

  if (category && category !== "All") {
    sql += ` AND category = ?`;
    params.push(category);
  }

  if (search) {
    sql += ` AND (title LIKE ? OR author LIKE ? OR category LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  switch (sort) {
    case "price_asc":
      sql += ` ORDER BY price ASC`;
      break;
    case "price_desc":
      sql += ` ORDER BY price DESC`;
      break;
    case "rating":
      sql += ` ORDER BY rating DESC`;
      break;
    default:
      sql += ` ORDER BY created_at DESC`;
      break;
  }

  return paginate(sql, params, Number(page), Number(limit));
};

const getPopularBooks = (limit = 6) => {
  const safeLimit = Number(limit) || 6;

  return query(
    `SELECT id, title, author, price, rating, category, cover_image, is_new
     FROM books
     ORDER BY rating DESC
     LIMIT ${safeLimit}`
  );
};

const getNewArrivals = (limit = 6) => {
  const safeLimit = Number(limit) || 6;

  return query(
    `SELECT id, title, author, price, rating, category, cover_image, is_new
     FROM books
     WHERE is_new = 1
     ORDER BY created_at DESC
     LIMIT ${safeLimit}`
  );
};

const getBookById = (id) => queryOne(`SELECT * FROM books WHERE id = ?`, [id]);
const createBook = (data) => insert("books", data);
const updateBook = (id, data) => update("books", data, { id });
const deleteBook = (id) => remove("books", { id });

module.exports = {
  getBooks,
  getPopularBooks,
  getNewArrivals,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
};