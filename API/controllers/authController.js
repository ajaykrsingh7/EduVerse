const authService = require('../services/authService');
const { successResponse, errorResponse } = require('../utils/response');

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, result, 'Registration successful', 201);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return successResponse(res, user);
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};

// exports.updateProfile = async (req, res) => {
//   try {
//     const user = await authService.updateProfile(req.user.id, req.body);
//     return successResponse(res, user, 'Profile updated');
//   } catch (err) {
//     return errorResponse(res, err.message, err.statusCode || 500);
//   }
// };

exports.updateProfile = async (req, res) => {
  try {
    const { pool } = require('../config/dbConnection');
    const { fullName, avatar, password } = req.body;

    const updates = [];
    const params  = [];

    if (fullName) { updates.push('full_name = ?'); params.push(fullName); }
    if (avatar)   { updates.push('avatar = ?');    params.push(avatar); }
    if (password) {
      const bcrypt = require('bcryptjs');
      const hashed = await bcrypt.hash(password, 12);
      updates.push('password = ?');
      params.push(hashed);
    }

    if (updates.length) {
      params.push(req.user.id);
      await pool.execute(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );
    }

    // If user is a mentor and avatar updated, sync to mentors table
    // (mentors table doesn't store avatar — it's in users — but
    //  we still need to confirm the join returns fresh data)
    // Nothing extra needed — mentors JOIN users so avatar always fresh.

    // Return updated user (no password)
    const [[user]] = await pool.execute(
      `SELECT id, full_name, email, role, avatar, created_at FROM users WHERE id = ?`,
      [req.user.id]
    );

    return successResponse(res, user, 'Profile updated');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
};