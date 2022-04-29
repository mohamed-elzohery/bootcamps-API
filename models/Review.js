const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title to your review'],
        maxlength: [100, 'title cannot exceed 100 chars']
    },
    text: {
        type: String,
        required: [true, 'Please add a content to your review'],
        maxlength: [2000, 'title cannot exceed 2000 chars'],
    },
    rating: {
        type: Number,
        max: 10,
        min:1,
        required: [true, 'add your rating of bootcamp']
    },
    createdAt : {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Bootcamps'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'users'
    }
});

//Calculate the average rating of bootcamp based on reviews
ReviewSchema.statics.getAverageRating = async function (bootcampId)  {
    const outPut = await this.aggregate([
        {
            $match: {bootcamp: bootcampId }
        }, 
        {
            $group:{
                _id: "$bootcamp",
                averageRating: {$avg: "$rating"}
            }
        }
    ])
    try{
        await this.model('Bootcamps').findByIdAndUpdate(bootcampId, {
            averageRating: outPut[0].averageRating
        });
    }catch(err){
        console.log(err.message)
    }
}


ReviewSchema.post('remove',async function(){

   await this.constructor.getAverageRating(this.bootcamp)
});

ReviewSchema.post('save',async function(){
    await this.constructor.getAverageRating(this.bootcamp)
 });

 ReviewSchema.post('findOneAndUpdate',async function(){
    const doc = await this.model.findOne(this.getQuery());
    await doc.constructor.getAverageRating(doc.bootcamp);
   
 });

const Review = mongoose.model('reviews', ReviewSchema);

module.exports = Review;