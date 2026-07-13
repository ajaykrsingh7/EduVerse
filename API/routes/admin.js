const router = require("express").Router();
const ctrl = require("../controllers/adminController");
const { protect, authorize } = require("../middlewares/auth");

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize("admin"));

// Dashboard
router.get("/stats", ctrl.getStats);

// Users
router.get("/users", ctrl.getUsers);
router.put("/users/:id", ctrl.updateUser);
router.delete("/users/:id", ctrl.deleteUser);

// Courses
router.get("/courses", ctrl.getCourses);
router.post("/courses", ctrl.createCourse);
router.put("/courses/:id", ctrl.updateCourse);
router.patch("/courses/:id/publish", ctrl.togglePublish);
router.delete("/courses/:id", ctrl.deleteCourse);

// Mentors
router.get("/mentors", ctrl.getMentors);
router.patch("/mentors/:id/approve", ctrl.toggleMentorApproval);
router.delete("/mentors/:id", ctrl.deleteMentor);

// Books
router.get("/books", ctrl.getBooks);
router.post("/books", ctrl.createBook);
router.put("/books/:id", ctrl.updateBook);
router.delete("/books/:id", ctrl.deleteBook);

router.put('/pricing/:id', ctrl.updatePlan);

// Applications
router.get("/applications", ctrl.getApplications);
router.patch("/applications/:id/review", ctrl.reviewApplication);

// Newsletter
router.get("/newsletter", ctrl.getNewsletter);

// Enrollments
router.get("/enrollments", ctrl.getEnrollments);

module.exports = router;

// Reviews
router.get("/reviews", ctrl.getReviews);
router.delete("/reviews/:id", ctrl.deleteReview);

