const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);

/* Obj configuration to avoid warnings*/
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => console.log('connection was successful'));

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8'));

const importData = async () => {
    try {
        await Tour.create(tours);

        console.log('Data loaded');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

const deleteData = async () => {
    try {
        await Tour.deleteMany();

        console.log('Data deleted');
    } catch (error) {
        console.log(error);
    }
    process.exit();
};

if(process.argv[2] === '--import'){
    importData();
} else if(process.argv[2] === '--delete'){
    deleteData();
}