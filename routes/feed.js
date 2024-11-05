const express = require('express');
const{ body } = require('express-validator');
const isAuth = require('../middleware/isAuth');

const router = express.Router();

const feedController = require('../controllers/feed');

router.get('/posts', isAuth, feedController.getPosts);

router.post('/posts', [
    body('title').trim().isLength({ min : 5 }),
    body('content').trim().isLength({ min : 5 })
], isAuth, feedController.createPost);

router.get('/posts/:postId', isAuth, feedController.getSinglePost);

router.put('/posts/:postId', [
    body('title').trim().isLength({ min : 5 }),
    body('content').trim().isLength({ min : 5 })
],isAuth, feedController.updatePost);

router.delete('/posts/:postId', isAuth, feedController.deletePost);

module.exports = router;