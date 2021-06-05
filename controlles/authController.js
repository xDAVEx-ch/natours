const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');

const createSignInToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signUp = catchAsync(async (req, resp, next) => {

    const newUser = await User.create(
        {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            passwordChangedAt: req.body.passwordChangedAt
        }
    );

    const token = createSignInToken(newUser._id);

    resp.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
})

exports.logIn = catchAsync(async (req, resp, next) => {
    const { email, password } = req.body;

    //1) Check if emaill and password exist
    if (!email || !password) {
        return next(new AppError('Please provide an email and password'), 400);
    }

    //2) Check if password es correct and user exists
    //+password uses the password hidden by select in schema
    const user = await User.findOne({ email }).select('+password');

    if (user) {
        const correctPass = await user.correctPassword(password, user.password);
        console.log('after correct password');
        if (!correctPass) {
            return next(new AppError('Incorrect email or password', 401));
        }
    } else {
        return next(new AppError('Incorrect email or password', 401));
    }

    //3) Send response
    const token = createSignInToken(user._id);
    console.log(token);

    resp.status(201).json({
        status: 'success',
        token,
        data: {
            user: user
        }
    });

})

exports.protect = catchAsync(async (req, resp, next) => {
    //1) Getting token and check of it's there

    let token = '';
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Please login to get access', 401));
    }

    //2) Verification token

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    //3) Check if user still exists

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('The user of this token does not longer exist', 401));
    }

    //4) Check if user has chanced password after the token was issued
    //iat means issue at
    if (currentUser.changesPasswordAfter(decoded.iat)) {
        return next(new AppError('Password was recently updated. Login again please', 401))
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, resp, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permisson to perform this action', 403));
        }

        next();
    };
}

exports.forgotPassword = catchAsync(async (req, resp, next) =>{
    const user = await User.findOne( {email: req.body.email} );

    if(!user){
        return new AppError('There is not user with this email', 404);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
});

exports.resetPassword = () =>{

};