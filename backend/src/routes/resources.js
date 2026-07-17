const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const auth = require('../middleware/auth');

// Resource routes (public)
router.get('/', resourceController.getResources);
router.get('/categories', resourceController.getCategories);
router.get('/:id', resourceController.getResourceById);
router.post('/:id/like', resourceController.toggleLike);

// Quiz routes (public)
router.get('/quizzes', resourceController.getQuizzes);
router.get('/quizzes/:id', resourceController.getQuizById);

// Protected quiz routes
router.post('/quizzes/:id/submit', auth, resourceController.submitQuiz);
router.get('/user/quiz-progress', auth, resourceController.getUserQuizProgress);
router.get('/user/course-progress', auth, resourceController.getCourseProgress);
router.post('/user/course-progress/:id', auth, resourceController.updateCourseProgress);

module.exports = router;