const mongoose = require('mongoose')
//  process.env.MONGO_URI // For cloud server
let URI = "mongodb://localhost:27017/Task_Management_App"
// URI = "mongodb://mongodb:27017/Task_Management_App" // While running the server on Docker -> mongo instance also running in docker
// So don't use localhost then instead use image name
mongoose.connect(`${URI}`)
.then(()=> console.log("Connected to MongoDB"))
.catch((err) => console.log(`Error Occured ${err}`));