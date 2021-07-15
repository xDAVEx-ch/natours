const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const { promisify } = require('util');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const createSignInToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, resp) =>{
    const token = createSignInToken(user._id);
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60000
        ), httpOnly: true
    }

    //Remove password from output
    user.password = undefined;

    if(process.env.NODE_ENV === 'production'){
        cookieOptions.secure = true; //Send this cookie only in https
    }

    resp.cookie('jwt', token, cookieOptions);

    resp.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
}

exports.signUp = catchAsync(async (req, resp, next) => {

    const newUser = await User.create(
        {
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm,
            passwordChangedAt: req.body.passwordChangedAt,
            role: req.body.role
        }
    );

    createSendToken(newUser, 201, resp);
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
        if (!correctPass) {
            return next(new AppError('Incorrect email or password', 401));
        }
    } else {
        return next(new AppError('Incorrect email or password', 401));
    }

    //3) Send response
    createSendToken(user, 20, resp);
})

exports.protect = catchAsync(async (req, resp, next) => {
    //1) Getting token and check of it's there

    let token = '';
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer')) {
        token = authHeader.split(' ')[1];
    }
    console.log('token checked');

    if (!token) {
        return next(new AppError('Please login to get access', 401));
    }

    //2) Verification token

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log('after verification');

    //3) Check if user still exists

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(new AppError('The user of this token does not longer exist', 401));
    }
    console.log('after user verification');

    //4) Check if user has chanced password after the token was issued
    //iat means issue at
    if (currentUser.changesPasswordAfter(decoded.iat)) {
        return next(new AppError('Password was recently updated. Login again please', 401))
    }
    console.log('after changes pass');

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    console.log('before next');
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

    //Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    //Send to user email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    const message = `Forgot your password? Reset your old password using the link below: \n ${resetURL}`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid fro 10 min)',
            message
        });
    
        resp.status(200).json({
            status: 'success',
            message: 'Token sent to email'
        });
    }catch(error){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        console.log(error);

        await user.save({ validateBeforeSave: false });

        return next(new AppError('There was an error sending the email', 500));

    }
});

exports.resetPassword = catchAsync(async(req, resp, next) =>{
    //1) Get user base on token
    const hashedToken = crypto.createHash('sha256')
        .update(req.params.token)
        .digest('hex');
    
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    //2) If token has not expired and there is a user, then set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400));
    }
    
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordReset = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    createSendToken(user, 200, resp);
});

exports.updatePassword = catchAsync(async (req, resp, next) =>{
    //1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    //2) Check if Posted current password is correct
    const userPassword = user.password;
    const candidatePass = req.body.currentPassword;

    if(!user.correctPassword(candidatePass, userPassword)){
        return next(new AppError('Passwords do not match', 401));
    }

    //3) Update password if Posted password is correct
    /* User.findByIdAndUpdate will make our validations not work. Also,
        all the middlewares including the one in charge of encryption stop working.
        They use save events */
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4) Log in user and send token
    createSendToken(user, 200, resp);
});