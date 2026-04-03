const mongoose = require('mongoose')
//  process.env.MONGO_URI // For cloud server
// let URI = "mongodb://localhost:27017/Task_Management_App"
let URI = "mongodb+srv://noob_coder_27:Saha%4006122004@cluster0.xhkc6lj.mongodb.net/Taskflow_DB"
// URI = "mongodb://mongodb:27017/Task_Management_App" // While running the server on Docker -> mongo instance also running in docker
// So don't use localhost then instead use image name
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