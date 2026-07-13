const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');
const auth = require('../middleware/auth');

// Public routes
router.get('/categories', communityController.getCategories);
router.get('/posts', communityController.getPosts);
router.get('/posts/:id', communityController.getPost);

// Protected routes
router.post('/posts', auth, communityController.createPost);
router.post('/posts/:postId/comments', auth, communityController.createComment);
router.post('/posts/:postId/reactions', auth, communityController.addReaction);
router.post('/posts/:postId/bookmark', auth, communityController.toggleBookmark);
router.get('/bookmarks', auth, communityController.getBookmarks);
router.post('/report', auth, communityController.reportContent);

module.exports = router;