const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');

exports.signUp = catchAsync(async (req, resp, next) => {

    const newUser = await User.create(
        {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        }
    );

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });

    resp.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
})

exports.logIn = catchAsync( async (req, resp, next) => {
    const { email, password } = req.body;

    //1) Check if emaill and password exist
    if(!email || !password){
        return next(new AppError('Please provide an email and password'), 400);
    }

    //2) Check if password es correct and user exists
    //+password uses the hide password by select in schema
    const user = await User.findOne({ email }).select('+password');

    //3) Send response
    const token = '';
    resp.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });

})