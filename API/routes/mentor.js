const router  = require('express').Router();
const ctrl    = require('../controllers/mentorController');
const rCtrl   = require('../controllers/mentorReviewController');
const { protect } = require('../middlewares/auth');

router.get ('/',                         ctrl.getMentors);
router.get ('/:id',                      ctrl.getMentorById);
router.post('/apply',          protect,  ctrl.applyAsMentor);

// Reviews for a specific mentor
router.get ('/:mentorId/reviews',        rCtrl.getReviews);
router.post('/:mentorId/reviews', protect, rCtrl.createReview);

module.exports = router;