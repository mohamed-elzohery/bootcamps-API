const longResults = require('../middleware/longResults');
const {protect, checkRole} = require('../middleware/protect');
const User = require('../models/User');
const router = require('express').Router();

const {
    getUsers,
    getUser,
    addUser,
    editUser,
    deleteUser
                    }   =   require('../controllers/users');

    router.use(protect, checkRole('admin'));

    router
        .route('/')
        .get(longResults(User), getUsers)
        .post(addUser)


    router
        .route('/:id')
        .get(getUser)
        .put(editUser)
        .delete(deleteUser)

module.exports = router ;