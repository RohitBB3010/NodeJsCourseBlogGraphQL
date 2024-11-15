const express = require('express');
const body_parser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const exp = require('constants');

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

app.use(multer({
    storage:fileStorage, fileFilter:fileFilter
}).single('image'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

mongoose.connect('mongodb+srv://rohit:Rohit123%40@cluster0.ha5sq.mongodb.net/messages?&w=majority&appName=Cluster0').then(result => {
    app.listen(8080);
}).catch(err => {
    console.log(err);
})