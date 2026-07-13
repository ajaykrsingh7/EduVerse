const router = require('express').Router();
const ctrl   = require('../controllers/shopController');

// books
router.get ('/books',           ctrl.getBooks);
router.get ('/books/featured',  ctrl.getShopData);
router.get ('/books/:id',       ctrl.getBookById);

// pricing
router.get ('/pricing',         ctrl.getPlans);
router.get ('/pricing/:id',     ctrl.getPlanDetail);

// newsletter
router.post('/newsletter',      ctrl.subscribe);

module.exports = router;