const mongoose = require('mongoose');
const {isEmail, isAlphanumeric} = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const crypto = require('crypto');

const maxAge = 24 * 60 * 60 * 1000;

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter a name'],
        maxlength: [40, 'Name cannot exceed 40 chars'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        trim: true,
        validate: {
            validator: isEmail,message: 'Please add a valid email'
        },
        lowercase: true
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [8, 'Password cannot be less than 8 characters'],
    },
    resetPasswordToken: String,
    resertPasswordDate: Date,
    createdAt: {
            type: Date,
            default: Date.now
    }
});

//Funtion to create web token and by user id
UserSchema.methods.createToken =  function() {
 return   jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: maxAge
    })
};

//Check for login
UserSchema.methods.login = async function (password){
    const auth = await bcrypt.compare(password, this.password)
    return auth ;
}

//create reset token
UserSchema.methods.createResetToken = async function (){
    const resetToken = crypto.randomBytes(20).toString('hex');
    //Hash the reset token
    this.resetPasswordToken = crypto
                                    .createHash('SHA256')
                                    .update(resetToken)
                                    .digest('hex') ;
                
    this.resertPasswordDate =  Date.now() + 30 * 60 * 1000
    await this.save({validateBeforeSave: false});
    return resetToken ;
}

//Setting crypting middleware
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        next();
    }
const salt = await bcrypt.genSalt(10); 
const hash = await bcrypt.hash(this.password, salt);
this.password = hash;
next()
});

const User = mongoose.model('users', UserSchema);

module.exports = User;