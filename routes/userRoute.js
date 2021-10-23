const express = require('express');
const authController = require('../controlles/authController');

//Mounting of router
const router = express.Router();

const userController = require('./../controlles/userController');

router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protecting all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/updateMe', userController.updateMe);

router.delete('/deleteMe', userController.deleteMe);

router.get('/me', userController.getMe, userController.getUser)

//Restriction to all routes after this middleware
router.use(authController.restrictTo('admin'));

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;