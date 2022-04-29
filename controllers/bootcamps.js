const Bootcamp = require('../models/Bootcamps');
const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/asyncHandler');
const geocoder = require('../utils/geocoder');
const path = require('path');
const { findById } = require('../models/Bootcamps');

//@desc         get all bootcamps
//@route        GET /api/v1/bootcamps
//@access       Public
exports.getBootcamps = asyncHandler (async (req, res)=>{
    res.status(200).json(res.allResults)
})

//@desc         get a bootcamp
//@route        GET /api/v1/bootcamps/:id
//@access       Public
exports.getBootcamp = asyncHandler(async (req, res, next)=>{

        const query =  Bootcamp.findById(req.params.id).populate({
            path: 'courses',
            select:'title description'
        });

        const bootcamp = await query;
        if(!bootcamp){
            //in case u send id with the same format but doesn't exist
            //You must insert return here so that u don't have two responses in the same case which would give u 
            //Error: cannot send after headers are set 
            return next(new ErrorResponse(`Bootcamp with Id ${req.params.id} is not found`, 404))
        }   
        res.status(200).json({success: true, bootcamp}); 
    
})

//@desc         add new bootcamp
//@route        POST /api/v1/bootcamps
//@access       Private
exports.postBootcamp = asyncHandler( async (req, res, next)=>{

    //Check if the user(publisher) already have a bootcamp published
    req.body.user = req.user._id ;
        const publishedBootcamp = await Bootcamp.findOne({user: req.user._id});

        if(publishedBootcamp && req.user.role !== 'admin'){
            return next(new ErrorResponse(`Sorry but only admins are allowed to add more than one bootcamp`, 401));
        }
        const bootcamp = await Bootcamp.create(req.body);
        res.status(201).json({
            success: true,
            data: bootcamp
        })
   
})

//@desc         modify a bootcamp
//@route        PUT /api/v1/bootcamps/:id
//@access       Private
exports.putBootcamp = asyncHandler( async (req, res, next)=>{

   const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse(`Bootcamp with Id ${req.params.id} is not found`, 404))
    };

    if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin'){
        return (next(new ErrorResponse(`This user with ${req.user._id} is not the owner of this bootcamp`
        ,401)));
    }

    await Bootcamp.findByIdAndUpdate(req.params.id,req.body,{
        new: true,
        runValidators: true
    });

    res.status(202).json({success: true, data: bootcamp})
})

//@desc         delete a bootcamp
//@route        DELETE /api/v1/bootcamps/:id
//@access       Private
exports.deleteBootcamp = asyncHandler( async (req, res, next)=>{
      const bootcamp =  await Bootcamp.findById(req.params.id);
       
        if(!bootcamp){
            return next(new ErrorResponse(`Bootcamp with Id ${req.params.id} is not found`, 404))
        };
    
        if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin'){
            return (next(new ErrorResponse(`This user with ${req.user._id} is not the owner of this bootcamp`
            ,401)));
        }
        
        bootcamp.remove()
        res.status(200).json({
            success: true,
            message: 'item was deleted successfully'
        });
});

//@desc          get bootcamps within distance
//@route         GET /api/v1/bootcamps/near/:zipcode/:distance
//@access        Public
exports.getNearBootcamps = asyncHandler( async(req, res, next) => {
    const {zipcode, distance} = req.params;
    const loc = await geocoder.geocode(zipcode);
    const {longitude, latitude} = loc[0];
    console.log(distance)
    const bootcamps = await Bootcamp.find({
        location:{$geoWithin:{$centerSphere:[[longitude, latitude], distance/3963]}}
    })
    res.status(200).json(bootcamps)
});

//@desc         Upload a bootcamp photo
//@route        PUT /api/v1/bootcamps/:id/photo
//@access       Private          
exports.uploadPhoto = asyncHandler(async (req, res, next) => {

    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp){
        return next(new ErrorResponse('Bootcamp not found', 404))
    }


    //Check if the user uploaded something
    if(!req.files){
        return next(new ErrorResponse('Please upload an image', 400))
    };

    //Store uploaded file object in a variable
    const file = req.files.file;
    
    //Check if the file is image of any type
    if(!file.mimetype.startsWith('image')){
        return next(new ErrorResponse('Please upload an image', 400))
    }

    //check if the file uploaded is below max file size
    if(file.size > process.env.PHOTO_UPLOAD_SIZE){
        return next(new ErrorResponse(`Photo size cannot exceed ${process.env.PHOTO_UPLOAD_SIZE}`))
    }

    //Set custom file name based on bootcamp id so that duplicate photos names will override each other
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`

    //Save file to path
    file.mv(`${process.env.PHOTO_UPLOAD_PATH}/${file.name}`,async (err)=>{
        if(err){
            console.log(err);
            return next(new ErrorResponse('Problem happened while uploading please try again later', 500));
        }
        console.log(file.name)
        await Bootcamp.findByIdAndUpdate(bootcamp._id, {photo: file.name},{new: true});
        res.status(200).json({success: true, data: bootcamp})
    })
})