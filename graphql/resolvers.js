const bcrypt = require('bcrypt');
const User = require('../models/user_model');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const Post = require('../models/post_model');

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
    },
    createPost : async function ({postInput}, req) {
        
        if(!req.isAuth){
            const error = new Error('User not authenticated');
            error.code = 401;
            throw error;
        }

        const errors = [];

        if(!validator.isLength(postInput.title, { min : 5 })){
            errors.push({message : 'Title is invalid'});
        }

        if(!validator.isLength(postInput.content, { min : 5 })){
            errors.push({message : 'Content is invalid'});
        }

        if(errors.length > 0){
            const error = new Error('Invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        const user = await User.findById(req.userId);

        if(!user){
            const error = new Error('Not valid user');
            error.code = 401;
            throw error;
        }

        const post = new Post({
            title : postInput.title,
            content : postInput.content,
            imageUrl : postInput.imageUrl,
            creator : user
        });

        const createdPost = await post.save();
        user.posts.push(createdPost);
        await user.save();

        return {...createdPost._doc, _id : createdPost._id.toString(), createdAt : createdPost.createdAt.toISOString(), updatedAt : createdPost.updatedAt.toISOString()}
    },
    posts : async function (args, req) {

        if(!req.isAuth){
            const error = new Error('User not authenticated');
            error.code = 401;
            throw error;
        }

        const totalDocuments = await Post.countDocuments();

        const posts = await Post.find().sort({createdAt :  -1 }).populate('creator');

        return {
            posts : posts.map(p => {
                return {
                    ...p._doc,
                    _id : p._id.toString(),
                    createdAt : p.createdAt.toISOString(),
                    updatedAt : p.updatedAt.toISOString()
                }
            }),
            totalPosts : totalDocuments
        }
    }
}