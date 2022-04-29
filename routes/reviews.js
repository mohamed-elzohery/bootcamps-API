const longResults = require('../middleware/longResults');
const {protect, checkRole} = require('../middleware/protect');
const Review = require('../models/Review');
const router = require('express').Router({mergeParams: true});

const {
    getAllReviews, addReview, getReview, updateReview, deleteReview
                    }   =   require('../controllers/reviews');

    

        router
            .route('/')
            .get(longResults(Review, {path: 'bootcamp', select: 'name description'}), getAllReviews)
            .post(protect, checkRole('user', 'admin'), addReview)

        router
            .route('/:id')
            .get(getReview)
            .put(protect, checkRole('user', 'admin'), updateReview)
            .delete(protect, checkRole('user', 'admin'), deleteReview)


module.exports = router ;