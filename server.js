const mongoose = require('mongoose');
const app = require('./index');
const dotenv = require('dotenv');

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

app.listen(port, () => console.log(`Listening in port ${port}`));