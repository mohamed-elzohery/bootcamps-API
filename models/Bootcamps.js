const mongoose = require('mongoose');
const slugify = require('slugify');
const geocoder = require('../utils/geocoder');

const bootcampSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please enter bootcamp name'],
        maxlength: [50, 'Bootcamp name can not exceed 50 characters'],
        unique: true,
        trim: true
    },
    slug: String,
    website: {
        type: String,
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Enter a valid URL'
        ]
    },
    phone: String,
    email:{
        type: String,
        match: [
            /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/,
            'Enter a valid email'
        ]
    },
    description: {
        type: String,
        maxlength: [500, 'Description can not exceed 500 words'],
        required: [true, 'Please add description to bootcamp']
    },
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    location: {
        type: {
            type: String,
            num:['Point'],
           
        },
        coordinates: {
            type: [Number],
        },
    formattedAddress: String,
    street: String,
    city: String,
    government: String,
    country: String,
    zipcode: String
    },
    careers: {
        type: [String],
        required: true,
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Business',
            'Data Science',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        max: [10, 'Rating must be lower than 10'],
        min: [1, 'Rating must be higher than 1']
    },
    averageCost:Number,
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false,
    },
    jobAssistance: {
        type: Boolean,
        default: false,
    },
    jobGuarantee: {
        type: Boolean,
        default: false,
    },
    acceptGi: {
        type: Boolean,
        default: false,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
},{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

bootcampSchema.index({location: '2dsphere'});

//Setting middlewares

//Middleware to slugify name
bootcampSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next()
});

//Middleware to extract geo data
bootcampSchema.pre('save', async function(next){
    const loc = await geocoder.geocode(this.address);
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude],
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        country: loc[0].country || loc[0].countryCode,
        zipcode: loc[0].zipcode
    }
    this.address = 'undefined'
    next()
});

//Middleware to to cascade deleting courses on deleting its parent bootcamp
bootcampSchema.pre('remove', async function(next){
    await this.model('courses').deleteMany({bootcamp: this._id})
    next()
})

bootcampSchema.virtual('courses', {
    ref:'courses',
    localField: '_id',
    foreignField: 'bootcamp',
    justOnce: false
});


const Bootcamp = mongoose.model('Bootcamps', bootcampSchema);

module.exports = Bootcamp;