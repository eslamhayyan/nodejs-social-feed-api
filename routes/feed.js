const express = require('express');
const feedController = require('../controllers/feed');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
router.use(isAuth);
router.get('/posts', feedController.getPosts);
router.post('/post', feedController.createPost);
router.get('/post/:postId', feedController.getPost);
router.put('/post/:postId', feedController.updatePost);
router.delete('/post/:postId', feedController.deletePost);

module.exports = router;
