import api from "./api";

export const adminAPI = {
  // Dashboard
  getStats: () => api.get("/admin/stats"),

  // Users
  getUsers: (p) => api.get("/admin/users", { params: p }),
  updateUser: (id, d) => api.put(`/admin/users/${id}`, d),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  // Courses
  getCourses: (p) => api.get("/admin/courses", { params: p }),
  createCourse: (d) => api.post("/admin/courses", d),
  updateCourse: (id, d) => api.put(`/admin/courses/${id}`, d),
  togglePublish: (id) => api.patch(`/admin/courses/${id}/publish`),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),

  // Mentors
  getMentors: (p) => api.get("/admin/mentors", { params: p }),
  toggleApproval: (id) => api.patch(`/admin/mentors/${id}/approve`),
  deleteMentor: (id) => api.delete(`/admin/mentors/${id}`),

  // Books
  getBooks: (p) => api.get("/admin/books", { params: p }),
  createBook: (d) => api.post("/admin/books", d),
  updateBook: (id, d) => api.put(`/admin/books/${id}`, d),
  deleteBook: (id) => api.delete(`/admin/books/${id}`),

  // Applications
  getApplications: (p) => api.get("/admin/applications", { params: p }),
  reviewApplication: (id, status) =>
    api.patch(`/admin/applications/${id}/review`, { status }),

  // Newsletter & Enrollments
  getNewsletter: (p) => api.get("/admin/newsletter", { params: p }),
  getEnrollments: (p) => api.get("/admin/enrollments", { params: p }),

  // Reviews
  getReviews: (p) => api.get("/admin/reviews", { params: p }),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),

  // Pricing
updatePlan: (id, d) => api.put(`/admin/pricing/${id}`, d),
};

