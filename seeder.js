const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const colors = require('colors');

//Set dotenv path
dotenv.config({ path: '.env' });

//Load data-model/s
const Bootcamp = require('./models/Bootcamps');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

//connect mongoose DB
connectDB()

//Import data from _data folder
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/Courses.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

//function to insert data imported into DB
const importData = async ()=>{
    
    try{
        await Bootcamp.create(bootcamps);
        await Course.create(courses);
        await User.create(users);
        await Review.create(reviews);
        console.log('Data Imported...'.green.inverse)
        process.exit()
    }catch(err){
        console.log(err.message)
        process.exit()
    }
}

//function to destroy data imported into DB
const destroyData = async ()=>{
    try{
        await Bootcamp.deleteMany({});
        await Course.deleteMany({});
        await User.deleteMany({});
        await Review.deleteMany({});
        console.log('Data destroyed...'.cyan.inverse)
        process.exit()
    }catch(err){
        console.log(err)
        process.exit()
    }
}

//Direct process functionality
if(process.argv[2] === '-i'){
    importData();
}
else if(process.argv[2] === '-d'){
    destroyData();
}