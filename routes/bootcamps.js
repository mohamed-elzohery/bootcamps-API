const router = require('express').Router();

const {
        getBootcamps,
        getBootcamp,
        postBootcamp,
        putBootcamp,
        deleteBootcamp,
        getNearBootcamps,
        uploadPhoto
        } = require('../controllers/bootcamps');

        //Merge route from course router
        const courseRouter = require('./courses');
        const reviewRouter = require('./reviews');

        //Redirect the route to be used by courseRouter instead
        router.use('/:bootcampId/courses', courseRouter);

        //Redirect the route to be used by ReviewRouter instead
        router.use('/:bootcampId/reviews', reviewRouter);

        const Bootcamp = require('../models/Bootcamps');
        const longResults  =require('../middleware/longResults');
        const {protect, checkRole} = require('../middleware/protect');


router
    .route('/')
    .get(longResults(Bootcamp, {path: 'courses', select: 'title description'}),getBootcamps)
    .post(protect, checkRole('publisher', 'admin'), postBootcamp)



router
            .route('/:id')
            .get(getBootcamp)
            .put(protect, checkRole('publisher', 'admin'), putBootcamp)
            .delete(protect, checkRole('publisher', 'admin'), deleteBootcamp)


router
            .route('/near/:zipcode/:distance')
            .get(getNearBootcamps)

router
            .route('/:id/photo')
            .put(protect, checkRole('publisher', 'admin'), uploadPhoto)

module.exports = router;