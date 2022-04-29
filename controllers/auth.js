const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');
const sendEmail = require('../utils/sendemail');
const crypto = require('crypto');
const { json } = require('express');
const maxAge = 24 * 60 * 60 * 1000;


//@desc         Add user data
//@route        POST    /api/v1/auth/register
//@access       Public
exports.registerUser = asyncHandler( async (req, res, next) => {
    const {name, email, role, password} = req.body ;
    const user = await User.create({
        name,
        email,
        role,
        password
    })

    sendCookieResponse(user, 200, res)
})

//@desc         Login user data
//@route        POST    /api/v1/auth/login
//@access       Public
exports.loginUser = asyncHandler( async (req, res, next) => {

    const { email, password } = req.body ;

    if(!email || !password){
        return next(new ErrorResponse('Invalid email or password', 400));
    };

    const user = await User.findOne({email}); 

    if(!user){
        return next(new ErrorResponse('Invalid email or password', 401));
    };

    const auth = await user.login(password);

    if(!auth){
        return next(new ErrorResponse('Invalid email or password', 401));
    };

    sendCookieResponse(user, 200, res);
})

//@desc         show logged user data
//@route        GET     /api/v1/auth/me
//@access       Private
exports.getMe = asyncHandler( (req, res, next)=>{
res.status(200).json({logged: req.user});
});

//@desc         reset password route
//@route        POST    /api/v1/auth/resetpassword
//@access       Public
exports.resetPassword = asyncHandler( async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new ErrorResponse('Email is not registered', 404));
    }

    const resetToken =await user.createResetToken();

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`


    try{
        await sendEmail({
            email: user.email,
            subject: 'reset password',
            message: `Please make a put request to the follwing URL /n/n ${resetURL}`
            }    );
        res.status(200).json({success: true, data: 'email sent'})
    }catch(err){
        console.log(err.message);

        //Reset tokens to undefined
        user.resetPasswordToken = undefined;
        user.resertPasswordDate = undefined;

        await user.save({validateBeforeSave: false});

       return next (new ErrorResponse('Token is expired or replaced', 500))
    }
});


//@desc         verify token and update password
//@route        PUT     /api/v1/auth/resetpassword/:token
//@access       Public
exports.updatePassword = asyncHandler(async (req, res, next) => {
    const hashedToken = crypto
                                .createHash('SHA256')
                                .update(req.params.token)
                                .digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resertPasswordDate: {$gt: Date.now() }
    });

    if(!user){
        return next(new ErrorResponse('Token is expired please try again', 400))
    };

    user.password = req.body.password ;
    user.resetPasswordToken = undefined ;
    user.resertPasswordDate = undefined ;

    await user.save();

    sendCookieResponse(user, 202, res);

});

//@desc         update user details
//@route        PUT     /api/v1/auth/updateMe
//@access       Private
exports.updateMe = asyncHandler(async (req, res, next)=>{
    let user = await User.findById(req.user.id) ;

    if(!user){
        return next(new ErrorResponse('You are not logged in', 401))
    }

    user.email = req.body.newEmail ;
    user.name = req.body.newName ;

    user = await user.save({validateBeforeSave: true});

    res.status(202).json({success: true, data: user})
    });


//@desc         update logged user password
//@route        PUT     /api/v1/auth/updateloggedpassword
//@access       Private
exports.updateMyPassword = asyncHandler(async (req, res, next)=>{

    let user = await User.findById(req.user.id) ;

    if(!user){
        return next(new ErrorResponse('You are not logged in', 401))
    }
    
    const auth = await user.login(req.body.currentPassword) ;

    if(!auth){
        return next(new ErrorResponse('Wrong password', 403));
    };

    user.password = req.body.newPassword ;

    user = await user.save({validateBeforeSave: true});

    res.status(202).json({success: true, user});
    
    });

//Function to create token and send as a cookie response
const sendCookieResponse = (user, statuseCode, res) => {
    const token = user.createToken();

    const options = {
        maxAge,
        httpOnly: true,
    }
    if(process.env.NODE_ENV == 'production'){
        options.secure = true;
    }
    res
        .status(statuseCode)
        .cookie('jwt', token, options)
        .json({success: true, token})
}

//@desc         logout user/delete jwt cookie
//@route        GET     /api/v1/auth/logout
//@access       Private
exports.logoutUser = asyncHandler( async (req, res, next) => {
    
    res.cookie('jwt', 'none', {maxAge: 1})
        .status(200)
        .json({success: true, message: "you logged out successfully"});
})
