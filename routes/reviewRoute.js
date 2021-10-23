const express = require('express');

//Mounting of router
//Mergin params we get access to parameters from the route that uses this one
const router = express.Router({ mergeParams: true });

const authController = require('./../controlles/authController');
const reviewController = require('./../controlles/reviewController');

router.use(authController.protect);

router.route('/').get(reviewController.getAllReviews);
router.route('/')
    .post(
        authController.restrictTo('user'),
        reviewController.setTourAndUserId,
        reviewController.createReview);

router.route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.restrictTo('admin', 'user'),
        reviewController.updateReview
    )
    .delete(
        authController.restrictTo('admin', 'user'),
        reviewController.deleteReview
    );

module.exports = router;