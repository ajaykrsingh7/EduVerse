const adminDAL = require("../dal/adminDAL");
const mentorDAL = require("../dal/mentorDAL");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");

// Dashboard
exports.getStats = async (req, res) => {
  try {
    const [
      stats,
      [recentEnrollments],
      [recentUsers],
      [monthly],
      [monthlyEnroll],
    ] = await Promise.all([
      adminDAL.getStats(),
      adminDAL.getRecentEnrollments(8),
      adminDAL.getRecentUsers(8),
      adminDAL.getMonthlyStats(),
      adminDAL.getMonthlyEnrollments(),
    ]);
    return successResponse(res, {
      stats,
      recentEnrollments,
      recentUsers,
      monthly,
      monthlyEnroll,
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Users ────────────────────────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 15 } = req.query;
    const { rows, total } = await adminDAL.getAllUsers({
      search,
      role,
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// exports.updateUser = async (req, res) => {
//   try {
//     await adminDAL.updateUserRole(req.params.id, req.body.role);
//     return successResponse(res, null, "User updated");
//   } catch (err) {
//     return errorResponse(res, err.message, 500);
//   }
// };

exports.updateUser = async (req, res) => {
  try {
    const allowed = {};
    if (req.body.role) allowed.role = req.body.role;
    if (req.body.full_name) allowed.full_name = req.body.full_name;
    await adminDAL.updateUserRole(req.params.id, allowed.role || undefined);
    if (allowed.full_name) {
      const { update } = require("../dal/dbHelper");
      await update(
        "users",
        { full_name: allowed.full_name },
        { id: req.params.id },
      );
    }
    return successResponse(res, null, "User updated");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await adminDAL.deleteUser(req.params.id);
    return successResponse(res, null, "User deleted");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Courses ──────────────────────────────────────────────────────────────────
exports.getCourses = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 15 } = req.query;
    const { rows, total } = await adminDAL.getAllCourses({
      search,
      category,
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.createCourse = async (req, res) => {
  try {
    const id = await adminDAL.createCourse(req.body);
    return successResponse(res, { id }, "Course created", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.updateCourse = async (req, res) => {
  try {
    await adminDAL.updateCourse(req.params.id, req.body);
    return successResponse(res, null, "Course updated");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.togglePublish = async (req, res) => {
  try {
    await adminDAL.toggleCoursePublish(req.params.id);
    return successResponse(res, null, "Course publish status toggled");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await adminDAL.deleteCourse(req.params.id);
    return successResponse(res, null, "Course deleted");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Mentors ──────────────────────────────────────────────────────────────────
exports.getMentors = async (req, res) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const { rows, total } = await adminDAL.getAllMentors({
      search,
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.toggleMentorApproval = async (req, res) => {
  try {
    await adminDAL.toggleMentorApproval(req.params.id);
    return successResponse(res, null, "Mentor approval toggled");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.deleteMentor = async (req, res) => {
  try {
    await adminDAL.deleteMentor(req.params.id);
    return successResponse(res, null, "Mentor deleted");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Books ────────────────────────────────────────────────────────────────────
exports.getBooks = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 15 } = req.query;
    const { rows, total } = await adminDAL.getAllBooks({
      search,
      category,
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.createBook = async (req, res) => {
  try {
    const id = await adminDAL.createBook(req.body);
    return successResponse(res, { id }, "Book created", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.updateBook = async (req, res) => {
  try {
    await adminDAL.updateBook(req.params.id, req.body);
    return successResponse(res, null, "Book updated");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await adminDAL.deleteBook(req.params.id);
    return successResponse(res, null, "Book deleted");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Applications ─────────────────────────────────────────────────────────────
exports.getApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const { rows, total } = await adminDAL.getApplications({
      status,
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.reviewApplication = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const { pool } = require("../config/dbConnection");

    // Get application with all submitted form data
    const [[app]] = await pool.execute(
      `
      SELECT ia.*, u.full_name, u.email, u.avatar
      FROM instructor_applications ia
      JOIN users u ON u.id = ia.user_id
      WHERE ia.id = ?
    `,
      [req.params.id],
    );

    if (!app) return errorResponse(res, "Application not found", 404);

    // Update application status + notes
    await pool.execute(
      `UPDATE instructor_applications
       SET status = ?, reviewed_at = NOW(), admin_notes = ?
       WHERE id = ?`,
      [status, adminNotes || null, req.params.id],
    );

    if (status === "approved") {
      // 1. Update user role to mentor
      await pool.execute(`UPDATE users SET role = 'mentor' WHERE id = ?`, [
        app.user_id,
      ]);

      // 2. Upsert mentor profile with ALL application data
      const [[existingMentor]] = await pool.execute(
        `SELECT id FROM mentors WHERE user_id = ?`,
        [app.user_id],
      );

      let mentorId;
      if (existingMentor) {
        mentorId = existingMentor.id;
        await pool.execute(
          `
          UPDATE mentors
          SET title       = ?,
              bio         = ?,
              experience  = ?,
              category    = ?,
              languages   = ?,
              is_approved = 1
          WHERE id = ?
        `,
          [
            app.profession || "Instructor",
            app.bio || "",
            app.experience_years || 0,
            app.teach_categories || "All",
            app.languages || "English",
            mentorId,
          ],
        );
      } else {
        const [result] = await pool.execute(
          `
          INSERT INTO mentors
            (user_id, title, bio, experience, category, languages, is_approved,
             rating, total_reviews, total_courses)
          VALUES (?, ?, ?, ?, ?, ?, 1, 0, 0, 0)
        `,
          [
            app.user_id,
            app.profession || "Instructor",
            app.bio || "",
            app.experience_years || 0,
            app.teach_categories || "All",
            app.languages || "English",
          ],
        );
        mentorId = result.insertId;
      }

      // 3. Upsert mentor_languages (one row per language)
      await pool.execute(`DELETE FROM mentor_languages WHERE mentor_id = ?`, [
        mentorId,
      ]);
      const langs = (app.languages || "English")
        .split(",")
        .map((l) => l.trim())
        .filter(Boolean);
      for (const lang of langs) {
        await pool.execute(
          `INSERT INTO mentor_languages (mentor_id, language) VALUES (?, ?)`,
          [mentorId, lang],
        );
      }

      // 4. Upsert mentor_socials (only facebook/instagram/twitter/linkedin)
      await pool.execute(
        `
        INSERT INTO mentor_socials (mentor_id, facebook, instagram, twitter, linkedin)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          facebook  = VALUES(facebook),
          instagram = VALUES(instagram),
          twitter   = VALUES(twitter),
          linkedin  = VALUES(linkedin)
      `,
        [
          mentorId,
          app.linkedin || null, // linkedin came from application
          null, // instagram — not in application form
          null, // twitter   — not in application form
          app.linkedin || null,
        ],
      );
    }

    return successResponse(res, null, `Application ${status}`);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
// ── Newsletter ────────────────────────────────────────────────────────────────
exports.getNewsletter = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const { rows, total } = await adminDAL.getNewsletter({
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// ── Enrollments ───────────────────────────────────────────────────────────────
exports.getEnrollments = async (req, res) => {
  try {
    const { search, page = 1, limit = 15 } = req.query;
    const { rows, total } = await adminDAL.getEnrollments({
      search,
      page: Number(page),
      limit: Number(limit),
    });
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

//  Reviews
exports.getReviews = async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const reviewDAL = require("../dal/reviewDAL");
    const { rows, total } = await reviewDAL.getAllReviews(+page, +limit);
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const reviewDAL = require("../dal/reviewDAL");
    await reviewDAL.deleteReview(req.params.id);
    return successResponse(res, null, "Review deleted");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Pricing
exports.updatePlan = async (req, res) => {
  try {
    const { update } = require("../dal/dbHelper");
    await update("pricing_plans", req.body, { id: req.params.id });
    return successResponse(res, null, "Plan updated");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};
