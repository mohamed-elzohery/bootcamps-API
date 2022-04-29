const Course = require('../models/Course');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const Bootcamp = require('../models/Bootcamps');
const { findByIdAndUpdate } = require('../models/Bootcamps');

//@desc         Get all courses with bootcamp id
//@route        GET /api/v1/bootcamps/:bootcamoId/courses
//@route        GET /api/v1/courses
//@access       Public
exports.getCourses = asyncHandler( async (req, res, next)=>{

    if(req.params.bootcampId){
         const courses =await Course.find({bootcamp: req.params.bootcampId});
         res.status(200).json({count: courses.length, allResorces: courses})
    }else{
     res.status(200).json(res.allResults)
    }
})

//@desc        Get course by Id
//@route       GET  /api/v1/courses/:id
//@access       Public

exports.getSingleCourse = asyncHandler( async (req, res, next)=>{
     const query =   Course.findById(req.params.id).populate({
          path:'bootcamp',
          select: 'name description'
     });

     const course = await query;
     if(!course){
         return next(new ErrorResponse(`Course with id ${req.params.id} doesn't exist`, 404));
     }
     res.status(200).json({ success: true,course })
});


//@desc        Add new course to certain bootcamp
//@route       POST      /api/v1/bootcamps/:bootcampId/courses
//@access      Private
exports.addCourse = asyncHandler( async (req, res, next)=>{
     req.body.bootcamp = req.params.bootcampId;
     const bootcamp = await Bootcamp.findById(req.params.bootcampId);

     if(!bootcamp){
          return next(new ErrorResponse('Bootcamp you trying to add course is not found', 404))
     };

     if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin'){
          return (next(new ErrorResponse(`This user with ${req.user._id} is not the owner of this bootcamp`
          ,401)));
      }
      
     const course = await Course.create(req.body);
     res.json({success: true, course})
});

//@desc        Update a course data
//@route       PUT /api/v1/courses/:id
//@access      Private
exports.updateCourse = asyncHandler( async(req, res, next) => {
    
     let course = await Course.findById(req.params.id)
     if(!course){
          return next(new ErrorResponse('Course is not found', 404));
     };

     const bootcamp = await Bootcamp.findById(course.bootcamp);

     if(!bootcamp){
          return next(new ErrorResponse('Bootcamp you trying to update course is not found', 404))
     };

     if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin'){
          return (next(new ErrorResponse(`This user with ${req.user._id} is not the owner of this bootcamp`
          ,401)));
      }

     course = await Course.findByIdAndUpdate(req.params.id, req.body,{
          new: true,
          runValidators:true
     });
     res.status(200).json({ logged: req.user, status: true, course});
})

//@desc        Delete a course data
//@route       DELETE /api/v1/courses/:id
//@access      Private
exports.deleteCourse = asyncHandler( async(req, res, next) => {
     let course = await Course.findById(req.params.id)
     if(!course){
          return next(new ErrorResponse('Course is not found', 404));
     };

     const bootcamp = await Bootcamp.findById(course.bootcamp);

     if(!bootcamp){
          return next(new ErrorResponse('Bootcamp you trying to delete course from is not found', 404))
     };

     if(req.user.id !== bootcamp.user.toString() && req.user.role !== 'admin'){
          return (next(new ErrorResponse(`This user with ${req.user._id} is not the owner of this bootcamp`
          ,401)));
      }
     course.remove()
     res.status(200).json({status: true, message: 'Course was deleted successfully'})
})