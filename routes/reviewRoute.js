const express = require('express');

//Mounting of router
const router = express.Router();

const authController = require('./../controlles/authController');
const reviewController = require('./../controlles/reviewController');

router.route('/').get(authController.protect, reviewController.getAllReviews);
router.route('/')
    .post(
        authController.protect,
        authController.restrictTo('user'),
        reviewController.createReview);

module.exports = router;