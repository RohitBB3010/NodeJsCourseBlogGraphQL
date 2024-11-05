const { validationResult } = require('express-validator');
const User = require('../models/user_model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signUp = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error('Validation failed; entered data is incorrect');
        error.status = 422;
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    bcrypt.hash(password, 12).then(hp => {
        const user = new User({
            name:name,
            password:hp,
            email:email
        });

        return user.save();
    }).then(result => {
        res.status(200).json({
            message : 'User created successfully',
            userId : result._id
        });
    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    })
}

exports.login = (req, res, next) => {

    console.log('login request recieved');
    
    const email = req.body.email;
    const password = req.body.password;

    console.log(password);
    let loadedUser;

    User.findOne({email : email}).then(user => {
        if(!user){
            const error = new Error('No user for this email found');
            error.statusCode = 401;
        }
        
        loadedUser = user;
        return bcrypt.compare(password, user.password);
    }).then(isEqual => {
        if(!isEqual){
            const error = new Error('The password is incorrect');
            error.statusCode = 401;
        }

        const token = jwt.sign({
            email : email,
            userId : loadedUser._id.toString()
        }, 'somesupersupersecretkey', { expiresIn : '1h'});

        res.status(200).json({
            token : token,
            userId : loadedUser._id.toString()
        })
    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
}