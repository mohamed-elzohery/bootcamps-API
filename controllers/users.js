const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const asyncHandler = require('../middleware/asyncHandler');

//@desc         get all users in long response
//@route        GET     /api/v1/users
//@access       Private
exports.getUsers = asyncHandler( async (req, res, next) => {

    res.status(200).json({success: true, data: res.allResults});

});

//@desc         get all the user by Id
//@route        GET     /api/v1/users/:id
//@access       Private
exports.getUser = asyncHandler( async (req, res, next) => {

    const user = await User.findById(req.params.id);

    if(!user){
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(200).json({success: true, data: user});
});

//@desc         Add new user
//@route        POST     /api/v1/users
//@access       Private
exports.addUser = asyncHandler( async (req, res, next) => {
    const user = await User.create(req.body) ;

    res.status(201).json({success: true, data: user});

});

//@desc         Add new user
//@route        PUT     /api/v1/users/:id
//@access       Private
exports.editUser = asyncHandler( async (req, res, next) => {

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }) ;

    if(!user){
        return next(new ErrorResponse('User not found', 404));
    }

    res.status(202).json({success: true, data: user});

});

//@desc         delete a user
//@route        DELETE     /api/v1/users/:id
//@access       Private
exports.deleteUser = asyncHandler( async (req, res, next) => {

    await User.findByIdAndDelete(req.params.id);

    res.status(202).json({success: true, data: []});

});