const router = require("express").Router();
const ctrl = require("../controllers/courseController");
const { protect } = require("../middlewares/auth");

router.get("/", ctrl.getCourses);
router.get("/my-enrollments", protect, ctrl.getMyEnrollments);
router.get("/:id", ctrl.getCourseById);
router.post("/:id/enroll", protect, ctrl.enrollCourse);

module.exports = router;
