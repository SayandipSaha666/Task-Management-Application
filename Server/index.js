require("dotenv").config();
const express = require("express");
const app = express();
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

app.use(cors({
    origin: ['http://localhost:5173'],
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(bodyParser.json())

// user-router
const userRouter = require('./routes/user-routes')
app.use('/api/user',userRouter)

// task-routers
const taskRouter = require('./routes/task-routes')
app.use('/api/task',taskRouter)

require('./database/database')
app.use('/api',(req,res) => {
    res.status(200).json({message: "Hello Express"});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT,() => {
    console.log(`Server running on port ${PORT}`);
})