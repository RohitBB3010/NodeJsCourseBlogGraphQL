const bcrypt = require('bcrypt');
const User = require('../models/user_model');

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
            password: createdUser.password, // Ensure password is being returned (optional, depending on your use case)
        };
    }
}