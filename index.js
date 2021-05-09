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

const app = express();

app.use(express.json()); //Middleware: function that modifies the incoming data

app.use('/api/v1/users', userRouter);
app.use('/api/v1/tours', tourRouter);

/* Versions are useful to implement changes without breaking othe resources*/
//app.get('/api/v1/tours', getAllTours);
/*More wildcards: /api/v1/tours/:id/:v/:p? Last parameter is optional */
//app.get('/api/v1/tours/:id', getTour);
//app.put('/api/v1/tours/:id', updateTour);
//app.delete('/api/v1/tours/:id', deleteTour);
//app.post('/api/v1/tours', createTour);

module.exports = app;