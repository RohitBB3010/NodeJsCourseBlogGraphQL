const express = require('express');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const graphqlhttp = require('graphql-http');
const { createHandler } = require('graphql-http/lib/use/express');
const exp = require('constants');
const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolvers');
const authMiddleware = require('./middleware/auth');
const clearImage = require('./util/image_clear');

const app = express();

app.use(body_parser.json());
app.use('/images', express.static(path.join(__dirname, 'images')));

const fileStorage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'images')
    },
    filename : (req,file, cb) => {
        cb(null, uuidv4());
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    } else{
        cb(null, false);
    }
}

app.get('/graphiql', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>GraphiQL</title>
          <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
        </head>
        <body>
          <div id="graphiql" style="height: 100vh;"></div>
          <script src="https://unpkg.com/react/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/graphiql/graphiql.min.js"></script>
          <script>
            const graphQLFetcher = graphQLParams =>
              fetch('/graphql', {
                method: 'post',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(graphQLParams),
              }).then(response => response.json());
  
            ReactDOM.render(
              React.createElement(GraphiQL, { fetcher: graphQLFetcher }),
              document.getElementById('graphiql'),
            );
          </script>
        </body>
      </html>
    `);
  });

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(multer({
    storage:fileStorage, fileFilter:fileFilter
}).single('image'));

app.use(authMiddleware);

app.use('/post-image', (req, res, next) => {

  console.log("Request at image middleware");
  if(!req.isAuth){
    const error = new Error('No user found');
    error.code = 422;
    throw error;
  }

  if(!req.file){
    return res.status(200).json({message : 'No file provided'});
  }

  if(req.body.oldPath){
    clearImage(req.body.oldPath);
  }

  console.log(req.file.path);

  return res.status(201).json({message : 'File stored', filePath :  req.file.path.replace(/\\/g, "/")});
});

app.use('/graphql', createHandler({
    schema : graphqlSchema,
    rootValue : graphqlResolver,
    context: (req, res) => {
      return {
        isAuth: req.raw.isAuth,
        userId: req.raw.userId,
      };
    },
    formatError(err) {
      if (!err.originalError) return err;
      const data = err.originalError.data;
      const message = err.message || "Something went wrong.";
      const statusCode = err.originalError.statusCode || 500;
 
      return { message, statusCode, data };
    },
}));

mongoose.connect('mongodb+srv://rohit:Rohit123%40@cluster0.ha5sq.mongodb.net/messages?&w=majority&appName=Cluster0').then(result => {
    app.listen(8080);
}).catch(err => {
    console.log(err);
})