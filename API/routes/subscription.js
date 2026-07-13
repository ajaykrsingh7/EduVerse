const router = require('express').Router();
const ctrl   = require('../controllers/subscriptionController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.get ('/my',      ctrl.getMySubscription);
router.get ('/history', ctrl.getMyHistory);
router.post('/purchase',ctrl.purchasePlan);

module.exports = router;