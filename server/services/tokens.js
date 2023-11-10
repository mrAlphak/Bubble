const jwt = require('jsonwebtoken')
const Log = require('./log')
const secret = process.env.SECRET

// Function to create JWT tokens
const createTokens = (payload, duration) => {
    return jwt.sign({ payload }, secret, { expiresIn: duration })
}

// Middleware to check and verify JWT tokens
const checkTokens =(req, res, next)=>{
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
        return res.status(401).json('Token not found');
    }
    jwt.verify(token, secret, (err, decoded) => {
        if (err) {
            Log(err, 'error')
            return res.status(401).json('Invalid token')
        }
        req.payload = decoded;
        next();
    })
}


module.exports = {
    createTokens,
    checkTokens
}