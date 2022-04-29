const mongoose = require('mongoose');

const connectDB = async ()=>{
        const conn = await mongoose.connect(process.env.MONGO_URL,{
            useNewUrlParser: true,
            useCreateIndex: true,
            useUnifiedTopology: true,
            useFindAndModify: false
        });

        console.log(`Data-base is connected at ${conn.connection.host}`.cyan.underline)
}

module.exports = connectDB ;