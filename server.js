const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const colors = require('colors');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const cors = require('cors')
const helmet = require('helmet');
const xss = require('xss-clean');
const errorHandler = require('./middleware/error');
const connectDB = require('./config/database');
const fileupload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');

dotenv.config('.env');

connectDB();

const app = express();

//use express json middleware
app.use(express.json())

//Setting logger
if(process.env.NODE_ENV == 'development'){
    app.use(morgan('dev'))
};

//Setting mongo-sanitize to prevent noSQL injection
app.use(mongoSanitize())

//Set secure response headers
app.use(helmet());

//Prevent XSS (cross-site-scripting) attacks
app.use(xss())

//Setting cookieParser middleware
app.use(cookieParser());

//Set express fileupload middleware
app.use(fileupload());

//Limit requests per 10 minutes
const limiter = rateLimit({
    windowMs: 1000 * 10 * 60,
    max:100,
    message: "Too many requests please try again later"
})
app.use(limiter)

//Prevent HTTP param pollution
app.use(hpp())

//Allow cross origin resource sharing
app.use(cors())

//Set path for static files
app.use(express.static(path.join(__dirname, 'public')));

//Mount routes
app.use('/api/v1/bootcamps', require('./routes/bootcamps'));
app.use('/api/v1/courses', require('./routes/courses'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/reviews', require('./routes/reviews'));

//Set middlewares of error handling
app.use(errorHandler)

const PORT = process.env.PORT || 5000;

//Spinning up the server
const server = app.listen(PORT, console.log(`Server is running at ${process.env.NODE_ENV} on port ${PORT}`
.yellow.bold));


//Handle Unhandled Promise Rejection
const {unhanledPromiseRejetion} = require('./errorHandlers/unhandledPromise');
unhanledPromiseRejetion(server)