const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth');
const User = require('../models/user_model');

const router = express.Router();

router.put('/signup', [
    body('email').isEmail().withMessage('Please enter a valid email').custom((value, req) => {
        return User.findOne({email : value}).then(userDoc => {
            if(userDoc){
                return Promise.reject('Email already exists');
            }
        });
    }),
    body('password').trim().isLength({ min : 6 }),
    body('name').trim().not().isEmpty(),
],
    authController.signUp);

router.post('/login', authController.login);

module.exports = router;