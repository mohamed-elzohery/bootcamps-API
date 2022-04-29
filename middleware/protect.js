const asyncHandler = require('./asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.protect = asyncHandler( async (req, res, next) => {
    let token;
    if(req.cookies.jwt){
        token = req.cookies.jwt;
    }
   
    if(!token){
        return next(new ErrorResponse('Unauthorized request', 401))
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
        if (err){
        return next(new ErrorResponse('Unauthorized request', 401))
        }
        try{
            const user = await  User.findById(decoded.id).select('-password');
            if(!user){
                return next(new ErrorResponse('Unauthorized request', 401))
            }
            req.user =  user ;
            next();
        }catch(err){
            return next(new ErrorResponse('Unauthorized request', 401))
        }
       
    });
});


//Function to limit users action 
exports.checkRole = (...roles) => (req, res, next) => {
    if(!roles.includes(req.user.role)){
        return next(new ErrorResponse(`Sorry! ${req.user.role}s are not allowed to such actions`, 403));
    }
    next()
}