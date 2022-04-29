const ErrorResponse = require('../utils/errorResponse')

const errorHandler = (err, req, res, next) => {
    let error={...err};
    error.message = err.message;
    
    //Handle mongoose CastError due to id not found
    if(err.name == 'CastError'){
        const message = `Resource with id ${req.params.id} is not found`;
        error = new ErrorResponse(message, 404)
    }

    //Handle duplicate error
    if(err.code === 11000){
        const message = `Duplicate field value`;
        error = new ErrorResponse(message, 400)
    }
    
    //Handle validation error rejection
    if(err.name === 'ValidationError'){
        let message = {};
        Object.values(err.errors).map(val => {
            message[val.properties.path] = val.properties.message;
        });
        message = JSON.stringify(message);
        error = new ErrorResponse(message, 400)
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server error'
    })
}

module.exports = errorHandler;