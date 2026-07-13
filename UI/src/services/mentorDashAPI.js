import api from './api';

export const mentorDashAPI = {
  getProfile:    ()        => api.get('/mentor-dash/profile'),
  updateProfile: (d)       => api.put('/mentor-dash/profile', d),
  getStats:      ()        => api.get('/mentor-dash/stats'),
  getEarnings:   ()        => api.get('/mentor-dash/earnings'),
  getCourses:    (p)       => api.get('/mentor-dash/courses', { params: p }),
  createCourse:  (d)       => api.post('/mentor-dash/courses', d),
  updateCourse:  (id, d)   => api.put(`/mentor-dash/courses/${id}`, d),
  togglePublish: (id)      => api.patch(`/mentor-dash/courses/${id}/publish`),
  getStudents:   (p)       => api.get('/mentor-dash/students', { params: p }),
  getReviews:    (p)       => api.get('/mentor-dash/reviews', { params: p }),

  // Curriculum
getChapters:   (courseId)              => api.get(`/mentor-dash/courses/${courseId}/chapters`),
createChapter: (courseId, d)           => api.post(`/mentor-dash/courses/${courseId}/chapters`, d),
updateChapter: (courseId, chapId, d)   => api.put(`/mentor-dash/courses/${courseId}/chapters/${chapId}`, d),
deleteChapter: (courseId, chapId)      => api.delete(`/mentor-dash/courses/${courseId}/chapters/${chapId}`),

createLesson: (courseId, chapId, d)               => api.post(`/mentor-dash/courses/${courseId}/chapters/${chapId}/lessons`, d),
updateLesson: (courseId, chapId, lessonId, d)     => api.put(`/mentor-dash/courses/${courseId}/chapters/${chapId}/lessons/${lessonId}`, d),
deleteLesson: (courseId, chapId, lessonId)        => api.delete(`/mentor-dash/courses/${courseId}/chapters/${chapId}/lessons/${lessonId}`),

createQuiz: (courseId, chapId, d)                 => api.post(`/mentor-dash/courses/${courseId}/chapters/${chapId}/quizzes`, d),
updateQuiz: (courseId, chapId, quizId, d)         => api.put(`/mentor-dash/courses/${courseId}/chapters/${chapId}/quizzes/${quizId}`, d),
deleteQuiz: (courseId, chapId, quizId)            => api.delete(`/mentor-dash/courses/${courseId}/chapters/${chapId}/quizzes/${quizId}`),

getPlaylist:   (courseId)   => api.get(`/mentor-dash/courses/${courseId}/playlist`),
savePlaylist:  (courseId, d) => api.post(`/mentor-dash/courses/${courseId}/playlist`, d),
getLearnings:  (courseId)   => api.get(`/mentor-dash/courses/${courseId}/learnings`),
saveLearnings: (courseId, d) => api.post(`/mentor-dash/courses/${courseId}/learnings`, d),
};