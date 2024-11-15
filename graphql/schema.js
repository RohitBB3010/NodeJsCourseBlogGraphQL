const { buildSchema } = require('graphql');
const { Schema } = require('mongoose');

module.exports = buildSchema(`

    type Post{
        _id : ID!,
        title : String!,
        content : String!,
        imageUrl : String!,
        creator : User!,
        createdAt : String!,
        updatedAt : String!
    }
    
    type User{
        _id : ID!,
        name : String!,
        email : String!,
        password : String!,
        status : String!,
        posts : [Post!]!
    }
    
    input userInput{
        email : String!,
        name : String!,
        password : String!
    }

    Type RootMutation{
        createuser(input : userInput) : User!
    }

    schema{
        mutation : RootMutation
    }
`);