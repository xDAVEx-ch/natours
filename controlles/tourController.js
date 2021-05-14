const catchAsync = require('../utils/catchAsync');
const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('../utils/appError');

/*const fs = require('fs');
const toursData = fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`);
const tours = JSON.parse(toursData);

exports.checkId = (req, resp, next, value) =>{
    console.log('ID read from checkId function' +value)
    if (parseInt(req.params.id) > tours.length) {
        return resp.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        });
    }

    next();
}*/

/*exports.checkBody = (req, resp, next) => {
    const keysArr = Object.keys(req.body);

    if(keysArr.indexOf('name') && keysArr.indexOf('price')){
        return resp.status(404).json({
            status: 'fail',
            message: 'No name or price'
        });
    }

    next();
}*/

exports.aliasTopTours = (req, resp, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingAverage,price';
    req.query.fields = 'name,price,ratingAverage,summary,difficulty';
    next();
}

exports.getAllTours = catchAsync(async (req, resp, next) => {

    /* Queries to MongoDB req.query
    const tour = await Tour.find({
        duration: 5,
        difficulty: 'easy'
    });
    or you can:
    const tour = await Tour.find()
        .where('duration')
        .equals(5)
        .where('diffuculty')
        .equals('easy');
     */

        //Execute query
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const tours = await features.query;

        resp.status(200).json({
            status: 'success',
            results: tours.length,
            data: {
                tours
            }
        });
    //No next() function. End of request-response cycle
})

exports.getTour = catchAsync(async (req, resp, next) => {

    /*const id = req.params.id * 1; //string * number === number
    const tour = tours.find((element) => element.id === id);*/

    const tour = await Tour.findById(req.params.id);

    if(!tour){
        return next(new AppError('No tour found with that ID'));
    }

    resp.status(200).json({
        status: 'success',
        data: {
            tour
        }
    });
})

/*Old createTour
exports.createTour = (req, resp) => {
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);

    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (error) => {
        resp.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        });

    });
}*/

exports.createTour = catchAsync(async (req, resp, next) => {

    const newTour = await Tour.create(req.body);

    resp.status(201).json({
        status: 'success',
        data: {
            tour: newTour
        }
    });
})

exports.updateTour = catchAsync(async (req, resp, next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    });

    if(!tour){
        return next(new AppError('No tour found with that ID'));
    }

    resp.status(201).json({
        status: 'success',
        data: {
            tour
        }
    });
})

exports.deleteTour = catchAsync(async (req, resp, next) => {

    const tour = await Tour.findByIdAndDelete(req.params.id);

    if(!tour){
        return next(new AppError('No tour found with that ID'));
    }

    resp.status(204).json({
        status: 'success',
        data: {
            tour: `Deleted tour id: ${req.params.id}`
        }
    });
})

/* The MongoDB aggregation pipeline consists of stages. 
Each stage transforms the documents as they pass through the pipeline */
exports.getTourStats = catchAsync(async (req, resp, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingAverage: { $gte: 4.5 } }
        },
        {/*Since _id is null, all info will be inside only in one group.
            Groups are generated by accomulators*/
            $group: {
                _id: null,
                //_id: '$difficulty'
                numTours: { $sum: 1},//1 added per doc in numTours counter
                numRatings: {$sum: '$ratingsQuantity'},
                avgRating: { $avg: '$ratingAverage' }, //Field where we get data from 
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }
            }
        },
        {//Now we sort using the names above. Our data change due to pipeline
            $sort: {
                $avg: { avgPrice: 1 }
            }
        },
        {//Stages can come more than once
            $match: {_id: {$ne: 'easy'}}
        }
    ]);

    resp.status(204).json({
        status: 'success',
        data: {
            stats
        }
    });
})

exports.getMonthlyPlan = catchAsync(async (req, resp, next) =>{
    const year = req.params.year * 1;


    /* Deconstructs an array field from the input documents to output a document for each element.
        From: { "_id" : 1, "item" : "ABC1", sizes: [ "S", "M", "L"] }
        to:
        { "_id" : 1, "item" : "ABC1", "sizes" : "S" }
        { "_id" : 1, "item" : "ABC1", "sizes" : "M" }
        { "_id" : 1, "item" : "ABC1", "sizes" : "L" }
    */
    const plan = await Tour.aggregate([
        {$unwind: '$startDates'},
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates'},
                numToursStarts: { $sum: 1 },
                tours: { $push: '$name'}
            }
        },
        {//Adding one new field with id value
            $addFields: { month: '$_id' }
        },
        {//Zero means no show up, one will show up.
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numToursStarts: -1}
        },
        {
            $limit: 6
        }
    ]);

    resp.status(204).json({
        status: 'success',
        data: {
            plan
        }
    });
})