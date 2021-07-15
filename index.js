/*const express = require('express');

const app = express();

app.get('/', (req, resp) =>{
    resp.status(200).send('Hello from the back end side :)');
});

app.post('/pepe', (req, resp) =>{
    resp.status(200).send('You can modify this URL');
});

const port = 8080;

app.listen(port, () => console.log('Listening at port 8080'));*/

const express = require('express');

const userRouter = require('./routes/userRoute');
const tourRouter = require('./routes/tourRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controlles/errorController');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const app = express();

// GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests per hour. Wait one hour.'
});

app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //Middleware: function that modifies the incoming data

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
/* Mongoose validations are enough to prevent this security issue, however, extra protection
it's never bad */
app.use(xss());

// Prevent parameter pollution
// Whitelist to duplicate fields
app.use(
    hpp({
      whitelist: [
        'duration',
        'ratingsQuantity',
        'ratingsAverage',
        'maxGroupSize',
        'difficulty',
        'price'
      ]
    })
  );

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

app.all('*', (req, resp, next) =>{

    /* Sending a parameter inside next, will skip every other middleware and jump right
    into our error middleware*/
    next(new AppError(`Can not find ${req.originalUrl} on the server`, 404));
});

app.use(globalErrorHandler);

/* Versions are useful to implement changes without breaking othe resources*/
//app.get('/api/v1/tours', getAllTours);
/*More wildcards: /api/v1/tours/:id/:v/:p? Last parameter is optional */
//app.get('/api/v1/tours/:id', getTour);
//app.put('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id', deleteTour);
//app.post('/api/v1/tours', createTour);

module.exports = app;