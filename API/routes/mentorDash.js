const router = require('express').Router();
const ctrl   = require('../controllers/mentorDashController');
const { protect, authorize } = require('../middlewares/auth');
const mctrl = require('../controllers/mentorDashController');

router.use(protect);
router.use(authorize('mentor', 'admin'));

router.get ('/profile',              ctrl.getProfile);
router.put ('/profile',              ctrl.updateProfile);
router.get ('/stats',                ctrl.getStats);
router.get ('/earnings',             ctrl.getEarnings);
router.get ('/courses',              ctrl.getMyCourses);
router.post('/courses',              ctrl.createCourse);
router.put ('/courses/:id',          ctrl.updateCourse);
router.patch('/courses/:id/publish', ctrl.togglePublish);
router.get ('/students',             ctrl.getMyStudents);
router.get ('/reviews',              ctrl.getMyReviews);

// Curriculum — chapters
router.get ('/courses/:courseId/chapters',                              mctrl.getChapters);
router.post('/courses/:courseId/chapters',                              mctrl.createChapter);
router.put ('/courses/:courseId/chapters/:chapterId',                   mctrl.updateChapter);
router.delete('/courses/:courseId/chapters/:chapterId',                 mctrl.deleteChapter);

// Lessons inside a chapter
router.post('/courses/:courseId/chapters/:chapterId/lessons',           mctrl.createLesson);
router.put ('/courses/:courseId/chapters/:chapterId/lessons/:lessonId', mctrl.updateLesson);
router.delete('/courses/:courseId/chapters/:chapterId/lessons/:lessonId', mctrl.deleteLesson);

// Quizzes inside a chapter
router.post('/courses/:courseId/chapters/:chapterId/quizzes',           mctrl.createQuiz);
router.put ('/courses/:courseId/chapters/:chapterId/quizzes/:quizId',   mctrl.updateQuiz);
router.delete('/courses/:courseId/chapters/:chapterId/quizzes/:quizId', mctrl.deleteQuiz);

// Playlist and learnings
router.get ('/courses/:courseId/playlist',    mctrl.getPlaylist);
router.post('/courses/:courseId/playlist',    mctrl.savePlaylist);
router.get ('/courses/:courseId/learnings',   mctrl.getLearnings);
router.post('/courses/:courseId/learnings',   mctrl.saveLearnings);
module.exports = router;