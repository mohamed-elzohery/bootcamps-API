const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
    title:{
        type:String,
        req: [true, 'Please enter a course title'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 chars']
    },
    description:{
        type: String,
        req: [true, 'Please enter a description'],
        maxlength: [500, 'Description cannot exceed 100 chars']
    },
    weeks:{
        type: String,
        required: [true, 'Please enter weeks']
    },
    tuition:{
        type: Number,
        required: [true, 'Please enter a tution cost']
    },
    minimumSkill:{
        type: String,
        required: [true, 'Please enter minimum skill level'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailibility:{
        type: Boolean,
        default: false
    },
    bootcamp:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bootcamps',
        required: true
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});


CourseSchema.statics.calAvgCost = async function(bootcampId){
    const result = await this.aggregate([
        {
            $match:{bootcamp: bootcampId}
        },
        {
            $group:{
                _id: "$bootcamp",
                averageCost: {$avg: "$tuition"}
            }
        }
    ]);
    try{
        await this.model('Bootcamps').findByIdAndUpdate(
            bootcampId, 
            {averageCost: Math.ceil(result[0].averageCost)}
            )
    }catch(err){
        console.log(err.message)
    }
}

/*******************Cannot under stand why we didn't use next()******************/
//Setting hooks middleware to calculate the average cost
CourseSchema.post('save', async function(next){
    await this.constructor.calAvgCost(this.bootcamp);
})

CourseSchema.pre('remove', async function(next){
    await this.constructor.calAvgCost(this.bootcamp);
})

const Course = mongoose.model('courses', CourseSchema);


module.exports = Course ; 