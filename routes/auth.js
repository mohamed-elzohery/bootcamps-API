const router = require('express').Router();
const {registerUser, loginUser, getMe, resetPassword, updatePassword, updateMe, updateMyPassword, logoutUser} = require('../controllers/auth');
const {protect} = require('../middleware/protect');
const rateLimit = require('express-rate-limit');

//Limit requests per 1hr to reset password 
const limiter = rateLimit({
        windowMs: 1000 * 60 * 60,
        max:1,
        message: "Too many requests please try again later"
    });
    

    router
            .route('/register')
            .post(registerUser);

    router
            .route('/login')
            .post(loginUser);

    router.post('/resetpassword', limiter, resetPassword);

    router.get('/me', protect, getMe);

    router.put('/resetpassword/:token', updatePassword);

    router.put('/updateme', protect, updateMe);

    router.put('/updateloggedpassword', protect, updateMyPassword);

    router.get('/logout', protect, logoutUser);

module.exports = router;