const Review = require('./../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

exports.getAllReviews = catchAsync(async (req, resp, next) =>{
    const reviews = await Review.find();

    resp.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
})

exports.createReview = catchAsync(async (req, resp, next) =>{
    const newReview = await Review.create(req.body);

    resp.status(200).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});