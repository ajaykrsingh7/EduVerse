const mentorDAL = require("../dal/mentorDAL");
const miscDAL = require("../dal/miscDAL");

const getMentors = ({ category, page, limit }) =>
  mentorDAL.getMentors(category, page, limit);

const getMentorById = async (id) => {
  const mentor = await mentorDAL.getMentorById(id);
  if (!mentor)
    throw Object.assign(new Error("Mentor not found"), { statusCode: 404 });
  return mentor;
};

// const applyAsMentor = async (userId) => {
//   const existing = await miscDAL.getApplication(userId);
//   if (existing && existing.status === "pending")
//     throw Object.assign(new Error("Application already pending"), {
//       statusCode: 409,
//     });
//   return miscDAL.applyAsInstructor(userId);
// };

const applyAsMentor = async (userId, formData) => {
  const existing = await miscDAL.getApplication(userId);
  if (existing && existing.status === 'pending')
    throw Object.assign(new Error('You already have a pending application'), { statusCode: 409 });

  return miscDAL.applyAsInstructor(userId, {
    profession:       formData.profession,
    experience_years: formData.experienceYears,
    education:        formData.education,
    specialization:   formData.specialization,
    bio:              formData.bio,
    website:          formData.website || null,
    linkedin:         formData.linkedin || null,
    youtube:          formData.youtube || null,
    teach_categories: formData.teachCategories,
    course_ideas:     formData.courseIdeas,
    hours_per_week:   formData.hoursPerWeek,
    languages:        formData.languages,
    agreed_terms:     formData.agreedTerms ? 1 : 0,
  });
};

const approveMentor = async (userId) => {
  const existing = await mentorDAL.getMentorByUserId(userId);
  if (!existing) {
    const mentorId = await mentorDAL.createMentor({
      user_id: userId,
      is_approved: 1,
    });
    return mentorId;
  }
  return mentorDAL.updateMentor(existing.id, { is_approved: 1 });
};

module.exports = { getMentors, getMentorById, applyAsMentor, approveMentor };
