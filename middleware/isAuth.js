const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {

    const authHeader = req.get('Authorization');

    if(!authHeader){
        const error = new Error('Not authorized');
        throw err;
    }

    const token = authHeader.split(' ')[1];
    let decodedToken;

    try{
        decodedToken = jwt.verify(token, 'somesupersupersecretkey');
    } catch(err) {
        err.statusode = 500;
        throw err;
    }

    if(!decodedToken){
        const error = new Error('Not authenticated');
        error.statusode = 401;
        throw err;
    }

    console.log("Decoded token is:" + decodedToken);

    req.userId = decodedToken.userId;
    next();
}