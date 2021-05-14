const globalErrorHandler = (error, req, resp, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || 'error';

    resp.status(error.statusCode).json({
        status: 'fail',
        message: error.message
    });
}

module.exports = globalErrorHandler;