const AppError = require('../utils/appError');

const handleCastErrorDB = (err) =>{
    const message = `Invalid ${err.path}: ${err.value}`

    return new AppError(message, 400);
}

const handleDuplicateFieldsDB = (err) =>{
    const value = err.keyValue.name;
    const message = `Duplicate field: ${value}. Please use another value`;

    return new AppError(message, 400);
}

//Cover errors coming from DB due to validation schema
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map(element => element.message);
    const message = `Invalid input data: ${errors.join('. ')}`;

    return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid token. Please login again', 401);
const handleJWTExpirationError = () => new AppError('Your token has expired', 401);

const sendErrorDev = (error, resp) => {
    resp.status(error.statusCode).json({
        status: error.status,
        message: error.message,
        stack: error.stack,
        error
    });
}

const sendErrorProd = (error, resp) => {

    //Covering operational errors. Trusted errors we want to clients
    if (error.isOperational) {
        resp.status(error.statusCode).json({
            status: error.status,
            message: error.message
        });
    //Covering programming errors. Unknown errors. Do not want to leak errors details
    } else {
        console.error('Error', error);

        resp.status(500).json({
            status: error.status,
            message: 'Something went wrong',
            error
        });
    }

}

const globalErrorHandler = (error, req, resp, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(error, resp);
    
    } else if (process.env.NNODE_ENV === 'production') {

        let err = {...error};
        console.log(err);
        if(err.kind === 'ObjectId') err = handleCastErrorDB(err);
        if(err.code === 11000) err = handleDuplicateFieldsDB(err);
        if(err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if(err.name === 'JsonWebTokenError') err = handleJWTError();
        if(err.name === 'TokenExpiredError') err = handleJWTExpirationError()
        sendErrorProd(err, resp);
    }
}

module.exports = globalErrorHandler;