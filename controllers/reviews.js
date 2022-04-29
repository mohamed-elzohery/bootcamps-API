const ErrorResponse = require('../utils/errorResponse');
const Review = require('../models/Review');
const asyncHandler = require('../middleware/asyncHandler');
const Bootcamp = require('../models/Bootcamps');


//@desc         get all reviews
//@route        GET     /api/v1/reviews
//@route        GET     /api/v1/bootcamps/:bootcampId/reviews
//@access       Public
exports.getAllReviews = asyncHandler( async (req, res, next) => {

    if(!req.params.bootcampId){
      return  res.status(200).json({success: true, data: res.allResults});
    }

    const reviews = await Review.find({bootcamp: req.params.bootcampId});

    if(!reviews){
        return next(new ErrorResponse('Bootcamp is no longer available', 404))
    }

    res.status(200).json({success: true, reviews});

});

//@desc         Add new review on a bootcamp
//@route        POST     /api/v1/bootcamps/:bootcampId/courses
//@access       Private
exports.addReview = asyncHandler( async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    const bootcamp = await Bootcamp.findById(req.body.bootcamp);

    if(!bootcamp){
        return next(new ErrorResponse('this bootcamp is no longer avaliable', 404))
    }

    let review = await Review.findOne({bootcamp: req.body.bootcamp, user: req.user.id});
    if(review){
        return next(new ErrorResponse('You cannot add more than one review for a single bootcamp', 400))
    }
    review = await Review.create(req.body);

    res.status(201).json({success: true, review});

});

//@desc         Get single review by id
//@route        GET     /api/v1/reviews/:id
//@access       Public
exports.getReview = asyncHandler( async (req, res, next) => {

    const review = await  Review.findById(req.params.id)
                    .populate({path: 'bootcamp', select: 'name description'})
                    .populate({path: 'user', select: 'name '});

    if(!review){
        return next(new ErrorResponse('review is no longer available', 404))
    }

    res.status(200).json({success: true, review});

});

//@desc         edit review data
//@route        PUT     /api/v1/reviews/:id
//@access       Private
exports.updateReview = asyncHandler( async(req, res, next) => {

    let review = await Review.findById(req.params.id);

    if(!review){
        return next(new ErrorResponse('review is not found', 404));
    }

    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse('you are not authorized to do such action', 401));
    }

    review = await Review.findOneAndUpdate({_id: req.params.id}, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({success: true, data: review})
});

//@desc         Delete review data
//@route        DELETE  /api/v1/reviews/:id
//@access       Private
exports.deleteReview = asyncHandler( async(req, res, next) => {

    const review = await Review.findById(req.params.id);

    if(!review){
        return next(new ErrorResponse('review is not found', 404));
    }

    if(review.user.toString() !== req.user.id && req.user.role !== 'admin'){
        return next(new ErrorResponse('you are not authorized to do such action', 401));
    }

     review.remove()

    res.status(200).json({success: true, data: review})
});




