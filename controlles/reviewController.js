const Review = require('./../models/reviewModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = catchAsync(async (req, resp, next) =>{

    let filter = {};

    if(req.params.tourId) filter = { tour: req.params.tourId };

    const reviews = await Review.find(filter);

    resp.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
})

exports.setTourAndUserId = (req, resp, next) =>{
    //Allow nested routes
    if(!req.body.tourRef) req.body.tourRef = req.params.tourId;
    if(!req.body.userRef) req.body.userRef = req.user.id;

    next();
}

exports.createReview = factory.createOne(Review);

/*exports.createReview = catchAsync(async (req, resp, next) =>{
    //Allow nested routes
    if(!req.body.tourRef) req.body.tourRef = req.params.tourId;
    if(!req.body.userRef) req.body.userRef = req.user.id;

    const newReview = await Review.create(req.body);

    resp.status(200).json({
        status: 'success',
        data: {
            review: newReview
        }
    });
});*/

exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);