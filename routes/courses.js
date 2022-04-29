const router = require('express').Router({mergeParams: true});

const {getCourses, getSingleCourse, addCourse, updateCourse, deleteCourse} = require('../controllers/courses');

const Course = require('../models/Course');
const longResults  =require('../middleware/longResults');
const {protect, checkRole} = require('../middleware/protect');

router
        .route('/')
        .get(longResults(Course, {path: 'bootcamp', select:'name description'}), getCourses)
        .post(protect,checkRole('publisher', 'admin'), addCourse)

router
        .route('/:id')
        .get(getSingleCourse)
        .put(protect, checkRole('publisher', 'admin'), updateCourse)
        .delete(protect, checkRole('publisher', 'admin'), deleteCourse)


module.exports = router;