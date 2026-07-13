const { pool } = require("../config/dbConnection");

/**
 * Execute a parameterised query and return [rows, fields].
 */
const query = async (sql, params = []) => {
  const [rows, fields] = await pool.execute(sql, params);
  return [rows, fields];
};

/**
 * Return the first row or null.
 */
const queryOne = async (sql, params = []) => {
  const [rows] = await pool.execute(sql, params);
  return rows[0] || null;
};

/**
 * Insert a row and return the insertId.
 */
const insert = async (table, data) => {
  const keys = Object.keys(data).join(", ");
  const placeholders = Object.keys(data)
    .map(() => "?")
    .join(", ");
  const values = Object.values(data);
  const [result] = await pool.execute(
    `INSERT INTO ${table} (${keys}) VALUES (${placeholders})`,
    values,
  );
  return result.insertId;
};

const update = async (table, data, whereData) => {
  const setClause = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(", ");
  const whereClause = Object.keys(whereData)
    .map((k) => `${k} = ?`)
    .join(" AND ");
  const values = [...Object.values(data), ...Object.values(whereData)];
  const [result] = await pool.execute(
    `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`,
    values,
  );
  return result.affectedRows;
};

/**
 * Delete rows matching a WHERE clause.
 */
const remove = async (table, whereData) => {
  const whereClause = Object.keys(whereData)
    .map((k) => `${k} = ?`)
    .join(" AND ");
  const values = Object.values(whereData);
  const [result] = await pool.execute(
    `DELETE FROM ${table} WHERE ${whereClause}`,
    values,
  );
  return result.affectedRows;
};

const paginate = async (sql, params = [], page = 1, limit = 12) => {
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 12;
  const offset = (pageNum - 1) * limitNum;

  const countSql = `SELECT COUNT(*) as total FROM (${sql.replace(/ORDER BY[\s\S]*$/i, "")}) as sub`;

  console.log("COUNT SQL:", countSql);

  try {
    const [[{ total }]] = await pool.execute(countSql, params);

    // const finalSql = `${sql} LIMIT ${limitNum} OFFSET ${offset}`;
    const finalSql = `${sql} LIMIT ${parseInt(limitNum)} OFFSET ${parseInt(offset)}`;
    console.log("FINAL SQL:", finalSql);

    const [rows] = await pool.execute(finalSql, params);

    return { rows, total };
  } catch (err) {
    console.error("Pagination SQL Error:", err);
    throw err;
  }
};


// const paginate = async (sql, params = [], page = 1, limit = 12) => {
//   const pageNum = Number(page) || 1;
//   const limitNum = Number(limit) || 12;
//   const offset = (pageNum - 1) * limitNum;

//   // only remove final top-level ORDER BY, not GROUP_CONCAT ORDER BY
//   const cleanSql = sql.replace(/\)\s+ORDER BY[\s\S]*$/i, ")");

//   const countSql = `
//     SELECT COUNT(*) as total
//     FROM (${cleanSql}) AS sub
//   `;


//   try {
//     const [[{ total }]] = await pool.execute(countSql, params);

//     const finalSql = `
//       ${sql}
//       LIMIT ${parseInt(limitNum)}
//       OFFSET ${parseInt(offset)}
//     `;


//     const [rows] = await pool.execute(finalSql, params);

//     return { rows, total };
//   } catch (err) {
//     console.error("Pagination SQL Error:", err);
//     throw err;
//   }
// };

module.exports = { query, queryOne, insert, update, remove, paginate };
