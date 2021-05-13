const express = require('express');

//Mounting of routers
const router = express.Router();

const tourController = require('./../controlles/tourController');

//router.param('id', tourController.checkId);

//Aliasing
router.route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats')
    .get(tourController.getTourStats);

router.route('/')
    .get(tourController.getAllTours)

    /*
        This middleware will never be called. 
        The middleware above finishes the request-response cycle sending a response
        .use('/random', (req, resp, next)=>{
	        console.log('Hello from the middleware');
            next();
        })  */
    //.post(tourController.checkBody, tourController.createTour);
    .post(tourController.createTour);

router.route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour);

module.exports = router;