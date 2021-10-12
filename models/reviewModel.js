const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema(
    {

        reviewContent: {
            type: String,
            required: [true, 'Review can not be empty']
        },

        rating: {
            type: Number,
            max: 5,
            min: 1
        },

        createdAt: {
            type: Date,
            default: Date.now()
        },

        tourRef: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour']
        },

        userRef: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        },
    },
    {
        //When there's a virtual property, it will show in our output
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.pre(/^find/, function(next){
    //this.populate({
    //    path: 'tourRef',
    //    select: 'name'
    //}).populate({
    //    path: 'userRef',
    //    select: 'name photo'
    //});

    this.populate({
        path: 'userRef',
        select: 'name photo'
    });
    
    next();
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;