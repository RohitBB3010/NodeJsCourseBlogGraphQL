const bcrypt = require('bcrypt');
const User = require('../models/user_model');
const jwt = require('jsonwebtoken');

module.exports = {

    createUser : async function({userInput}, req){
        
        console.log("Reached resolver");
        
        const existingUser = await User.findOne({
            email : userInput.email
        });

        if(existingUser){
            const error = new Error('User exists already');
            throw error;
        }

        const hashedPassword = await bcrypt.hash(userInput.password, 12);

        const user = User({
            email : userInput.email,
            name : userInput.name,
            password : hashedPassword
        });

        const createdUser = await user.save();

        return { 
            _id: createdUser._id.toString(),
            name: createdUser.name,       
            email: createdUser.email,     
            password: createdUser.password, 
        };
    },
    login : async function({email, password}){
        
        console.log("Inside function");
        
        const user = await User.findOne({email : email});
        if(!user){
            const error = new Error('No user found');
            error.code = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error('Incorrect password');
            error.code = 401;
            throw error;
        }

        const token =jwt.sign({
            userId : user._id.toString(),
            email : User.email,
        }, 
        'somesupersupersecretkey',
        { expiresIn : "1h"}
    );

    return { token : token, userId : user._id.toString() }
    }
}