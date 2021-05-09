const mongoose = require('mongoose');
const { default: slugify } = require('slugify');

/* Everything outside the schema, it's simple ignored */
const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name for the tour is required!'],
        unique: true
    },

    slug: String,

    duration: {
        type: Number,
        required: [true, 'Duration must be declared']
    },

    maxGroupSize: {
        type: Number,
        required: [true, 'Tour has have a group size']
    },

    difficulty: {
        type: String,
        required: [true, 'Tour has have a difficulty']
    },

    ratingAverage: {
        type: Number,
        default: 4.5
    },

    ratingQuantity: {
        type: Number,
        default: 0
    },

    price: {
        type: Number,
        required: [true, 'A price for the tour must be declared!']
    },

    priceDiscount: Number,

    summary: {
        type: String,
        trim: true,
        required: [true, 'A summary for the tour has to be declared']
    },

    description: {
        type: String,
        trim: true
    },

    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover']
    },

    images: [String],

    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },

    startDates: [Date]
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//Virtual properties won't be stored in db and no part of queries
tourSchema.virtual('durationWeek').get(function(){
    return this.duration / 7;
});

//Before save event happens, runs pre document middleware
tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    next();
})

//function inside is called hooked function
tourSchema.pre('save', function (next) {
    console.log('Saving document');
    next();
})

//After save event happens, runs pre document middleware
tourSchema.post('save', function (doc, next) {
    console.log(doc);
    next();
})


//Query middlewares
tourSchema.pre(/^find/, function (next) {
    this.find({ secretTour: {$ne: true} });
    next();
});


///Aggregation middlewares
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: {secretTour: {$ne: true}} });
    console.log(this.pipeline());//Gives an array with our pipeline in tourController.js
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;