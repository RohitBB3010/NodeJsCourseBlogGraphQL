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
    },

    input PostInputData{
        title : String!,
        content : String!,
        imageUrl : String!
    }

    type AuthData{
        token : String!,
        userId : String!
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

    type PostData{
        posts : [Post!],
        totalPosts : Int!
    }

    type RootMutation{
        createUser(userInput : userInput) : User!,
        createPost(postInput : PostInputData) : Post!
    }

    type RootQuery{
        login(email : String!, password : String!) : AuthData!,
        posts : PostData!,
        post(id : ID!) : Post!
    }

    schema{
        query : RootQuery
        mutation : RootMutation
    }
`);