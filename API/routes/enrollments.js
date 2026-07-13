const router = require('express').Router();
const ctrl   = require('../controllers/enrollmentController');
const courseCtrl = require('../controllers/courseController');
const { protect } = require('../middlewares/auth');

router.get('/my-dashboard', protect, ctrl.getMyDashboard);

router.get('/my-enrollments', protect, courseCtrl.getMyEnrollments);

module.exports = router;