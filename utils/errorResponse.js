//Here in utils we put any functions that is not controller or middle-ware
class ErrorResponse extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorResponse;