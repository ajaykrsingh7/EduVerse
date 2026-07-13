const router     = require('express').Router();
const ctrl       = require('../controllers/learnController');
const { protect } = require('../middlewares/auth');

// Optional auth — attach user if token present but don't block
const optionalAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer')) return next();
  return protect(req, res, next);
};

router.get ('/free-courses',                                      ctrl.getFreeCourses);
router.get ('/:courseId',                     optionalAuth,       ctrl.getCourseContent);
router.get ('/:courseId/lesson/:lessonId',    optionalAuth,       ctrl.getLesson);
router.post('/:courseId/lesson/:lessonId/complete', protect,      ctrl.markComplete);

module.exports = router;