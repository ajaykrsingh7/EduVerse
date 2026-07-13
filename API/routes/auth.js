const router = require('express').Router();
const ctrl   = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get ('/me',       protect, ctrl.getProfile);
router.put ('/me',       protect, ctrl.updateProfile);

module.exports = router;