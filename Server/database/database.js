const mongoose = require('mongoose')

const URI = process.env.MONGO_URI()
const connectDB = async()=>{
    try {
        await mongoose.connect(`${URI}`)
        console.log('MongoDB connected Successfully')
    } catch (error) {
        console.log(error.message)
        process.exit(1)
    }
}

module.exports = connectDB