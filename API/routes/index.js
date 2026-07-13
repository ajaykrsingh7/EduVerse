const router = require('express').Router();

router.use('/auth',         require('./auth'));
router.use('/mentors',      require('./mentor'));
router.use('/courses',      require('./course'));
router.use('/shop',         require('./shop'));
router.use("/orders",       require("./order"));
router.use('/admin',        require('./admin'));
router.use('/mentor-dash',  require('./mentorDash'));
router.use('/learn',        require('./learn'));
router.use('/reviews',      require('./review'));
router.use('/enrollments',  require('./enrollments'));
router.use('/subscriptions',require('./subscription'));

module.exports = router;