class AppError extends Error {
    constructor(message, statusCode){
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true; //Other errors (Programming errors) won't have this property

        //Constructor won't show up in stack trace
        Error.captureStackTrace(this, this.constructor);
    }
}


module.exports = AppError;