const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');

exports.getAllUsers = catchAsync(async (req, resp, next) =>{
    const user = await User.find();

    resp.status(500).json({
        status: 'error',
        data: {
            user
        }
    });
})

exports.createUser = (req, resp) =>{
    resp.status(500).json({
        status: 'error',
        message: 'Route not defined yet!'
    });
}

exports.getUser = (req, resp) =>{
    resp.status(500).json({
        status: 'error',
        message: 'Route not defined yet!'
    });
}

exports.updateUser = (req, resp) =>{
    resp.status(500).json({
        status: 'error',
        message: 'Route not defined yet!'
    });
}

exports.deleteUser = (req, resp) =>{
    resp.status(500).json({
        status: 'error',
        message: 'Route not defined yet!'
    });
}