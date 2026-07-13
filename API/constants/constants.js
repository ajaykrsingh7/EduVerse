module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "Eduverse_secret_key_2024",
  JWT_EXPIRE: "30d",
  PAGINATION_LIMIT: 12,
  ROLES: {
    STUDENT: "student",
    MENTOR: "mentor",
    ADMIN: "admin",
  },
  COURSE_CATEGORIES: [
    "Kindergarten",
    "High School",
    "College",
    "Computer",
    "Science",
    "Engineering",
  ],
  PACK_TYPES: ["basic", "standard", "premium"],
};
