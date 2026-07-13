const { pool } = require("../config/dbConnection");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/response");
const courseDAL = require("../dal/courseDAL");
const adminDAL = require("../dal/adminDAL");

// Get mentor's own profile + stats
exports.getProfile = async (req, res) => {
  try {
    const [[mentor]] = await pool.execute(
      `
      SELECT m.*, u.full_name, u.email, u.avatar,
        GROUP_CONCAT(DISTINCT ml.language SEPARATOR ', ') AS languages,
        ms.facebook, ms.instagram, ms.twitter, ms.linkedin
      FROM mentors m
      JOIN users u ON u.id = m.user_id
      LEFT JOIN mentor_languages ml ON ml.mentor_id = m.id
      LEFT JOIN mentor_socials   ms ON ms.mentor_id  = m.id
      WHERE m.user_id = ?
      GROUP BY m.id
    `,
      [req.user.id],
    );

    if (!mentor) return errorResponse(res, "Mentor profile not found", 404);
    return successResponse(res, mentor);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Get mentor dashboard stats
exports.getStats = async (req, res) => {
  try {
    const [[mentorRow]] = await pool.execute(
      `SELECT id FROM mentors WHERE user_id = ?`,
      [req.user.id],
    );
    if (!mentorRow) return errorResponse(res, "Mentor not found", 404);
    const mentorId = mentorRow.id;

    const [[courses]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM courses WHERE mentor_id = ?`,
      [mentorId],
    );
    const [[published]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM courses WHERE mentor_id = ? AND is_published = 1`,
      [mentorId],
    );
    const [[enrollments]] = await pool.execute(
      `
      SELECT COUNT(*) AS total FROM enrollments e
      JOIN courses c ON c.id = e.course_id WHERE c.mentor_id = ?`,
      [mentorId],
    );
    const [[revenue]] = await pool.execute(
      `
      SELECT COALESCE(SUM(c.price), 0) AS total
      FROM enrollments e JOIN courses c ON c.id = e.course_id WHERE c.mentor_id = ?`,
      [mentorId],
    );
    const [[avgRating]] = await pool.execute(
      `
      SELECT COALESCE(AVG(r.rating), 0) AS avg FROM reviews r
      JOIN courses c ON c.id = r.course_id WHERE c.mentor_id = ?`,
      [mentorId],
    );

    return successResponse(res, {
      totalCourses: courses.total,
      publishedCourses: published.total,
      totalStudents: enrollments.total,
      totalRevenue: revenue.total,
      averageRating: parseFloat(avgRating.avg).toFixed(1),
    });
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Get mentor's courses
exports.getMyCourses = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const [[mentorRow]] = await pool.execute(
      `SELECT id FROM mentors WHERE user_id = ?`,
      [req.user.id],
    );
    if (!mentorRow) return errorResponse(res, "Mentor not found", 404);

    let sql = `
      SELECT c.*,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) AS student_count,
        (SELECT COUNT(*) FROM reviews WHERE course_id = c.id) AS review_count,
        (SELECT AVG(rating) FROM reviews WHERE course_id = c.id) AS avg_rating
      FROM courses c WHERE c.mentor_id = ?`;
    const params = [mentorRow.id];
    if (search) {
      sql += ` AND c.title LIKE ?`;
      params.push(`%${search}%`);
    }
    sql += ` ORDER BY c.created_at DESC`;

    const { paginate } = require("../dal/dbHelper");
    const { rows, total } = await paginate(sql, params, +page, +limit);
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Create course
exports.createCourse = async (req, res) => {
  try {
    const [[mentorRow]] = await pool.execute(
      `SELECT id FROM mentors WHERE user_id = ?`,
      [req.user.id],
    );
    if (!mentorRow) return errorResponse(res, "Mentor profile not found", 404);
    const { insert } = require("../dal/dbHelper");
    const id = await insert("courses", {
      ...req.body,
      mentor_id: mentorRow.id,
      is_published: 0,
    });
    return successResponse(res, { id }, "Course created", 201);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Update own course
exports.updateCourse = async (req, res) => {
  try {
    const [[mentorRow]] = await pool.execute(
      `SELECT id FROM mentors WHERE user_id = ?`,
      [req.user.id],
    );
    if (!mentorRow) return errorResponse(res, "Not a mentor", 404);
    const [[course]] = await pool.execute(
      `SELECT id FROM courses WHERE id = ? AND mentor_id = ?`,
      [req.params.id, mentorRow.id],
    );
    if (!course)
      return errorResponse(res, "Course not found or unauthorized", 403);
    const { update } = require("../dal/dbHelper");
    await update("courses", req.body, { id: req.params.id });
    return successResponse(res, null, "Course updated");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Toggle publish
exports.togglePublish = async (req, res) => {
  try {
    const [[course]] = await pool.execute(
      `SELECT is_published FROM courses WHERE id = ?`,
      [req.params.id],
    );
    if (!course) return errorResponse(res, "Course not found", 404);
    const { update } = require("../dal/dbHelper");
    await update(
      "courses",
      { is_published: course.is_published ? 0 : 1 },
      { id: req.params.id },
    );
    return successResponse(res, null, "Publish status toggled");
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Get students enrolled in mentor's courses
exports.getMyStudents = async (req, res) => {
  try {
    const [[mentorRow]] = await pool.execute(
      `SELECT id FROM mentors WHERE user_id = ?`,
      [req.user.id],
    );
    if (!mentorRow) return errorResponse(res, "Not a mentor", 404);
    const { page = 1, limit = 15 } = req.query;
    const { paginate } = require("../dal/dbHelper");
    const sql = `
      SELECT DISTINCT u.id, u.full_name, u.email, u.avatar, u.created_at,
        COUNT(e.id) AS enrolled_courses
      FROM enrollments e
      JOIN users u ON u.id = e.user_id
      JOIN courses c ON c.id = e.course_id
      WHERE c.mentor_id = ?
      GROUP BY u.id ORDER BY u.created_at DESC`;
    const { rows, total } = await paginate(sql, [mentorRow.id], +page, +limit);
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Get reviews on mentor's courses
exports.getMyReviews = async (req, res) => {
  try {
    const [[mentorRow]] = await pool.execute(
      `SELECT id FROM mentors WHERE user_id = ?`,
      [req.user.id],
    );
    if (!mentorRow) return errorResponse(res, "Not a mentor", 404);
    const { page = 1, limit = 15 } = req.query;
    const { paginate } = require("../dal/dbHelper");
    const sql = `
      SELECT r.*, u.full_name AS reviewer, u.avatar AS reviewer_avatar, c.title AS course_title
      FROM reviews r
      JOIN users u ON u.id = r.user_id
      JOIN courses c ON c.id = r.course_id
      WHERE c.mentor_id = ?
      ORDER BY r.created_at DESC`;
    const { rows, total } = await paginate(sql, [mentorRow.id], +page, +limit);
    return paginatedResponse(res, rows, total, page, limit);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Update mentor profile
exports.updateProfile = async (req, res) => {
  try {
    const { pool } = require('../config/dbConnection');
    const {
      fullName, title, bio, experience, category, languages,
      avatar,
      facebook, instagram, twitter, linkedin,
    } = req.body;

    // Get mentor record
    const [[mentorRow]] = await pool.execute(
      `SELECT id FROM mentors WHERE user_id = ?`, [req.user.id]
    );
    if (!mentorRow) return errorResponse(res, 'Mentor profile not found', 404);

    const mentorId = mentorRow.id;

    // 1. Update users table (full_name + avatar)
    const userUpdates = [];
    const userParams  = [];
    if (fullName) { userUpdates.push('full_name = ?'); userParams.push(fullName); }
    if (avatar)   { userUpdates.push('avatar = ?');    userParams.push(avatar); }
    if (userUpdates.length) {
      userParams.push(req.user.id);
      await pool.execute(
        `UPDATE users SET ${userUpdates.join(', ')} WHERE id = ?`,
        userParams
      );
    }

    // 2. Update mentors table
    await pool.execute(`
      UPDATE mentors
      SET title      = COALESCE(?, title),
          bio        = COALESCE(?, bio),
          experience = COALESCE(?, experience),
          category   = COALESCE(?, category),
          languages  = COALESCE(?, languages)
      WHERE id = ?
    `, [
      title      || null,
      bio        || null,
      experience != null ? experience : null,
      category   || null,
      languages  || null,
      mentorId,
    ]);

    // 3. Re-seed mentor_languages from the languages string
    if (languages) {
      await pool.execute(
        `DELETE FROM mentor_languages WHERE mentor_id = ?`, [mentorId]
      );
      const langs = languages.split(',').map(l => l.trim()).filter(Boolean);
      for (const lang of langs) {
        await pool.execute(
          `INSERT INTO mentor_languages (mentor_id, language) VALUES (?, ?)`,
          [mentorId, lang]
        );
      }
    }

    // 4. Upsert mentor_socials — only facebook/instagram/twitter/linkedin
    await pool.execute(`
      INSERT INTO mentor_socials (mentor_id, facebook, instagram, twitter, linkedin)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        facebook  = VALUES(facebook),
        instagram = VALUES(instagram),
        twitter   = VALUES(twitter),
        linkedin  = VALUES(linkedin)
    `, [
      mentorId,
      facebook  || null,
      instagram || null,
      twitter   || null,
      linkedin  || null,
    ]);

    return successResponse(res, null, 'Profile updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

// Monthly earnings chart
exports.getEarnings = async (req, res) => {
  try {
    const [[mentorRow]] = await pool.execute(
      `SELECT id FROM mentors WHERE user_id = ?`,
      [req.user.id],
    );
    if (!mentorRow) return errorResponse(res, "Not a mentor", 404);
    const [monthly] = await pool.execute(
      `
      SELECT DATE_FORMAT(e.enrolled_at, '%Y-%m') AS month,
             COUNT(*) AS enrollments,
             SUM(c.price) AS revenue
      FROM enrollments e JOIN courses c ON c.id = e.course_id
      WHERE c.mentor_id = ? AND e.enrolled_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
      GROUP BY month ORDER BY month ASC
    `,
      [mentorRow.id],
    );
    return successResponse(res, monthly);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};


// ── Curriculum: Chapters ──────────────────────────────────────────────────────
exports.getChapters = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    const { pool } = require('../config/dbConnection');

    // Verify the mentor owns this course
    const [[mentorRow]] = await pool.execute(
      `SELECT id FROM mentors WHERE user_id = ?`, [req.user.id]
    );
    if (!mentorRow) return errorResponse(res, 'Mentor not found', 404);

    const [[course]] = await pool.execute(
      `SELECT id FROM courses WHERE id = ? AND mentor_id = ?`,
      [req.params.courseId, mentorRow.id]
    );
    if (!course) return errorResponse(res, 'Course not found or unauthorized', 403);

    // Get full chapter + lesson + quiz tree
    const [chapters] = await learnDAL.getChaptersByCourse(req.params.courseId);

    for (const ch of chapters) {
      const [lessons] = await learnDAL.getLessonsByChapter(ch.id);
      const [quizzes] = await learnDAL.getQuizzesByChapter(ch.id);
      ch.lessons = lessons;
      ch.quizzes = quizzes;
    }

    return successResponse(res, chapters);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

exports.createChapter = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    const { title, sortOrder = 1 } = req.body;
    if (!title) return errorResponse(res, 'Chapter title is required', 400);
    const id = await learnDAL.createChapter({ course_id: req.params.courseId, title, sort_order: sortOrder });
    return successResponse(res, { id }, 'Chapter created', 201);
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.updateChapter = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    await learnDAL.updateChapter(req.params.chapterId, { title: req.body.title, sort_order: req.body.sortOrder });
    return successResponse(res, null, 'Chapter updated');
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.deleteChapter = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    await learnDAL.deleteChapter(req.params.chapterId);
    return successResponse(res, null, 'Chapter deleted');
  } catch (err) { return errorResponse(res, err.message, 500); }
};

// ── Curriculum: Lessons ───────────────────────────────────────────────────────
exports.createLesson = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    const { title, content, codeExample, codeLang, sortOrder = 1 } = req.body;
    if (!title) return errorResponse(res, 'Lesson title is required', 400);
    const id = await learnDAL.createLesson({
      chapter_id: req.params.chapterId,
      title, content, code_example: codeExample,
      code_lang: codeLang || 'text', sort_order: sortOrder,
    });
    return successResponse(res, { id }, 'Lesson created', 201);
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.updateLesson = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    const { title, content, codeExample, codeLang } = req.body;
    await learnDAL.updateLesson(req.params.lessonId, {
      title, content, code_example: codeExample, code_lang: codeLang,
    });
    return successResponse(res, null, 'Lesson updated');
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.deleteLesson = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    await learnDAL.deleteLesson(req.params.lessonId);
    return successResponse(res, null, 'Lesson deleted');
  } catch (err) { return errorResponse(res, err.message, 500); }
};

// ── Curriculum: Quizzes ───────────────────────────────────────────────────────
exports.createQuiz = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    const { question, optionA, optionB, optionC, optionD, correct, explanation } = req.body;
    if (!question || !optionA || !optionB || !correct)
      return errorResponse(res, 'question, optionA, optionB, and correct are required', 400);
    const id = await learnDAL.createQuiz({
      chapter_id: req.params.chapterId,
      question, option_a: optionA, option_b: optionB,
      option_c: optionC || null, option_d: optionD || null,
      correct, explanation: explanation || null,
    });
    return successResponse(res, { id }, 'Quiz created', 201);
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.updateQuiz = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    const { question, optionA, optionB, optionC, optionD, correct, explanation } = req.body;
    await learnDAL.updateQuiz(req.params.quizId, {
      question, option_a: optionA, option_b: optionB,
      option_c: optionC, option_d: optionD, correct, explanation,
    });
    return successResponse(res, null, 'Quiz updated');
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const learnDAL = require('../dal/learnDAL');
    await learnDAL.deleteQuiz(req.params.quizId);
    return successResponse(res, null, 'Quiz deleted');
  } catch (err) { return errorResponse(res, err.message, 500); }
};

// ── Playlist (video items) ────────────────────────────────────────────────────
exports.getPlaylist = async (req, res) => {
  try {
    const courseDAL = require('../dal/courseDAL');
    const [items] = await courseDAL.getPlaylist(req.params.courseId);
    return successResponse(res, items);
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.savePlaylist = async (req, res) => {
  try {
    const courseDAL = require('../dal/courseDAL');
    // req.body.items = [{ title, duration }, ...]
    await courseDAL.replacePlaylist(req.params.courseId, req.body.items || []);
    return successResponse(res, null, 'Playlist saved');
  } catch (err) { return errorResponse(res, err.message, 500); }
};

// ── What you'll learn ─────────────────────────────────────────────────────────
exports.getLearnings = async (req, res) => {
  try {
    const courseDAL = require('../dal/courseDAL');
    const [items] = await courseDAL.getLearnings(req.params.courseId);
    return successResponse(res, items);
  } catch (err) { return errorResponse(res, err.message, 500); }
};

exports.saveLearnings = async (req, res) => {
  try {
    const courseDAL = require('../dal/courseDAL');
    await courseDAL.replaceLearnings(req.params.courseId, req.body.points || []);
    return successResponse(res, null, 'Learning points saved');
  } catch (err) { return errorResponse(res, err.message, 500); }
};
