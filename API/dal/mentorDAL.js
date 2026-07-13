const { query, queryOne, insert, update, paginate } = require("./dbHelper");

const mentorSelectSQL = `
  SELECT m.*,
         u.full_name,
         u.email,
         u.avatar,
         GROUP_CONCAT(
           DISTINCT ml.language
           SEPARATOR ', '
         ) AS mentor_languages,
         ms.facebook,
         ms.instagram,
         ms.twitter,
         ms.linkedin
  FROM mentors m
  JOIN users u ON u.id = m.user_id
  LEFT JOIN mentor_languages ml ON ml.mentor_id = m.id
  LEFT JOIN mentor_socials ms ON ms.mentor_id = m.id
`;
const getMentors = async (category = null, page = 1, limit = 12) => {
  let sql = mentorSelectSQL + ` WHERE m.is_approved = 1`;
  const params = [];

  if (category && category.trim() !== "" && category !== "All") {
    sql += ` AND m.category = ?`;
    params.push(category);
  }

  sql += `
    GROUP BY 
      m.id,
      m.user_id,
      m.category,
      m.is_approved,
      u.full_name,
      u.email,
      u.avatar,
      ms.facebook,
      ms.instagram,
      ms.twitter,
      ms.linkedin
  `;

  return paginate(sql, params, page, limit);
};

const getMentorById = (id) =>
  queryOne(
    mentorSelectSQL +
      `
      WHERE m.id = ?
      GROUP BY 
        m.id,
        m.user_id,
        m.category,
        m.is_approved,
        u.full_name,
        u.email,
        u.avatar,
        ms.facebook,
        ms.instagram,
        ms.twitter,
        ms.linkedin
    `,
    [id],
  );
const getMentorByUserId = (userId) =>
  queryOne(mentorSelectSQL + ` WHERE m.user_id = ?`, [userId]);

const createMentor = (data) => insert("mentors", data);

const updateMentor = (id, data) => {
  const { update } = require("./dbHelper");
  return update("mentors", data, { id });
};

const addLanguage = (mentorId, language) =>
  insert("mentor_languages", { mentor_id: mentorId, language });
const upsertSocials = async (mentorId, socials) => {
  const { pool } = require("../config/dbConnection");
  await pool.execute(
    `
    INSERT INTO mentor_socials (mentor_id, facebook, instagram, twitter, linkedin)
    VALUES (?,?,?,?,?)
    ON DUPLICATE KEY UPDATE facebook=VALUES(facebook), instagram=VALUES(instagram),
                            twitter=VALUES(twitter),   linkedin=VALUES(linkedin)
  `,
    [
      mentorId,
      socials.facebook || null,
      socials.instagram || null,
      socials.twitter || null,
      socials.linkedin || null,
    ],
  );
};

module.exports = {
  getMentors,
  getMentorById,
  getMentorByUserId,
  createMentor,
  updateMentor,
  addLanguage,
  upsertSocials,
};
