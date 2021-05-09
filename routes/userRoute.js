const express = require('express');

//Mounting of router
const router = express.Router();

const userController = require('./../controlles/userController');

router.route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router.route('/:id')
    .get(userController.getUser)
    .put(userController.updateUser)
    .delete(userController.deleteUser);

module.exports = router;