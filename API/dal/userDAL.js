const { query, queryOne, insert, update, remove } = require('./dbHelper');

const findByEmail = (email) =>
  queryOne(`SELECT * FROM users WHERE email = ?`, [email]);

const findById = (id) =>
  queryOne(`SELECT id, full_name, email, role, avatar, created_at FROM users WHERE id = ?`, [id]);

const createUser = (data) => insert('users', data);

const updateUser = (id, data) => update('users', data, { id });

const deleteUser = (id) => remove('users', { id });

const listUsers = (role = null) => {
  if (role) return query(`SELECT id, full_name, email, role, avatar, created_at FROM users WHERE role = ?`, [role]);
  return query(`SELECT id, full_name, email, role, avatar, created_at FROM users`);
};

module.exports = { findByEmail, findById, createUser, updateUser, deleteUser, listUsers };