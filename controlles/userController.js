const catchAsync = require('../utils/catchAsync');
const User = require('./../models/userModel');
const AppError = require('./../utils/appError');

removeBodyEl = (obj, ...allowedFields) =>{
    const newObj = {};

    Object.keys(obj).forEach(element =>{
        if(allowedFields.includes(element)) {
            newObj[element] = obj[element]
        }
    });

    return newObj;
}

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

exports.updateMe = catchAsync(async (req, resp, next) =>{
    //1) Create error if user Posts password data
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError(
            'This route is not for password updates. Use /updateMyPassword',
        400));
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    // We keep email and name. rol for example is deleted
    const filteredBody = removeBodyEl(req.body, 'name', 'email');

    // 3) Update user document. We use findByIdAndUpdate now, due to some fields
    // are required (like password), but not updated, giving one error.
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true
    });

    resp.status(200).json({
        status: 'success',
        data: {
            user: updatedUser
        }
    });
})

exports.deleteMe = catchAsync(async (req, resp, next) =>{
    await User.findByIdAndUpdate(req.user.id, {active: false});

    resp.status(204).json({
        status: 'success',
        data: null
    });
});

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