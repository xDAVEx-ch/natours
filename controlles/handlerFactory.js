const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => catchAsync(async (req, resp, next) => {

    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc){
        return next(new AppError('No document found with that ID'));
    }

    resp.status(204).json({
        status: 'success',
        data: {
            tour: `Deleted tour id: ${req.params.id}`
        }
    });
});

exports.updateOne = Model => catchAsync(async (req, resp, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if(!doc){
        return next(new AppError('No document found with that ID'));
    }

    resp.status(200).json({
        status: 'success',
        data: {
            doc
        }
    });
})

exports.createOne = Model => catchAsync(async (req, resp, next) => {

    const newDoc = await Model.create(req.body);

    resp.status(201).json({
        status: 'success',
        data: {
            data: newDoc
        }
    });
})

exports.getOne = (Model, populateOpts) => catchAsync(async (req, resp, next) => {

    //We don't await for query response to manipulate its info later on
    let query = Model.findById(req.params.id);

    //Query manipulation here
    if(populateOpts) query = query.populate('reviews');

    //Now, await for response with new information within the query
    const doc = await query;
    /*const id = req.params.id * 1; //string * number === number
    const tour = tours.find((element) => element.id === id);*/

    //Name of th field we want to populate
    //const tour = await Tour.findById(req.params.id).populate('reviews');

    if(!doc){
        return next(new AppError('No document found with that ID'));
    }

    resp.status(200).json({
        status: 'success',
        data: {
           data: doc
        }
    });
})

exports.getAll = Model => catchAsync(async (req, resp, next) => {

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
        const features = new APIFeatures(Model.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();

        const doc = await features.query;

        resp.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc
            }
        });
    //No next() function. End of request-response cycle
})