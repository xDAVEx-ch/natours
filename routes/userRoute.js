const express = require('express');
const authController = require('../controlles/authController');

//Mounting of router
const router = express.Router();

const userController = require('./../controlles/userController');

router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updatePassword);

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .put(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;