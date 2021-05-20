const mongoose = require('mongoose');
const app = require('./index');
const dotenv = require('dotenv');

//Listening for uncaughtExceptions and closing application
process.on('uncaughtException', error => {
    console.log(error.name, error.message);
    console.log('UNHANDLE REJECTION...shutting down application...');
    //This handles synchronous exeptions, don't need server
    process.exit(1);
})

/*
    uncaughtException
    console.log(x);
*/

dotenv.config({path: './config.env'});

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

/* Obj configuration to avoid warnings*/
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('connection was successful'));

const port = process.env.PORT;

const server = app.listen(port, () => console.log(`Listening in port ${port}`));

//Listening for rejections and closing application
process.on('unhandledRejection', error => {
    console.log(error.name, error.message);
    console.log('UNHANDLE REJECTION...shutting down application...');
    //server.close() finishes the server and requests slowly
    server.close(() => process.exit(1));
})