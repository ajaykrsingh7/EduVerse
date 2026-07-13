const router = require('express').Router();
const ctrl   = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');

router.get ('/:courseId/reviews',    ctrl.getCourseReviews);
router.post('/:courseId/reviews',    protect, ctrl.createReview);
router.delete('/reviews/:id',        protect, ctrl.deleteReview);

module.exports = router;