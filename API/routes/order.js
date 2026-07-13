const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const { protect } = require('../middlewares/auth');

router.use(protect);
router.post('/checkout',   ctrl.checkout);
router.get ('/my-orders',  ctrl.getMyOrders);
router.get ('/:id',        ctrl.getOrderById);

module.exports = router;