import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api/v1";

const api = axios.create({ baseURL: API_BASE });

// Attach JWT token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("EduVerse_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Unwrap data or throw meaningful error
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const msg = err.response?.data?.message || "Something went wrong";
    return Promise.reject(new Error(msg));
  },
);

// Auth 
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data) => api.put("/auth/me", data),
};

// Mentors 
export const mentorsAPI = {
  getAll: (params) => api.get("/mentors", { params }),
  getById: (id) => api.get(`/mentors/${id}`),
  apply: (data) => api.post("/mentors/apply", data),
};

// Courses 
export const coursesAPI = {
  getAll: (params) => api.get("/courses", { params }),
  getById: (id) => api.get(`/courses/${id}`),
  enroll: (id) => api.post(`/courses/${id}/enroll`),
  myEnrollments: () => api.get("/courses/my-enrollments"),
};

// Shop / Books 
export const shopAPI = {
  getBooks: (params) => api.get("/shop/books", { params }),
  getFeatured: () => api.get("/shop/books/featured"),
  getBookById: (id) => api.get(`/shop/books/${id}`),
};

// Pricing 
export const pricingAPI = {
  getAll: () => api.get("/shop/pricing"),
  getById: (id) => api.get(`/shop/pricing/${id}`),
};

// Newsletter 
export const newsletterAPI = {
  subscribe: (email) => api.post("/shop/newsletter", { email }),
};

//order api
export const ordersAPI = {
  checkout: (data) => api.post("/orders/checkout", data),
  myOrders: () => api.get("/orders/my-orders"),
  getById: (id) => api.get(`/orders/${id}`),
};

export const learnAPI = {
  getFreeCourses: () => api.get("/learn/free-courses"),
  getCourse: (courseId) => api.get(`/learn/${courseId}`),
  getLesson: (courseId, lessonId) =>
    api.get(`/learn/${courseId}/lesson/${lessonId}`),
  markComplete: (courseId, lessonId) =>
    api.post(`/learn/${courseId}/lesson/${lessonId}/complete`),
};

// Reviews
export const reviewsAPI = {
  getCourseReviews: (courseId, p) => api.get(`/reviews/${courseId}/reviews`, { params: p }),
  createReview:     (courseId, d) => api.post(`/reviews/${courseId}/reviews`, d),
};

// Enrollments dashboard
export const enrollmentAPI = {
  getMyDashboard: () => api.get('/enrollments/my-dashboard'),
  getMyEnrollments: () => api.get('/enrollments/my-enrollments'),
};

// Subscriptions
export const subscriptionsAPI = {
  getMySub:   ()       => api.get('/subscriptions/my'),
  getHistory: ()       => api.get('/subscriptions/history'),
  purchase:   (planId) => api.post('/subscriptions/purchase', { planId }),
};

export const mentorReviewsAPI = {
  getByMentor:   (mentorId, p) => api.get(`/mentors/${mentorId}/reviews`, { params: p }),
  createReview:  (mentorId, d) => api.post(`/mentors/${mentorId}/reviews`, d),
};


export default api;
