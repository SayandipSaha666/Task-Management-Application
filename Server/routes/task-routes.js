const express = require('express')
const taskRouter = express.Router()

const {addNewTask, getAllTasks, updateTask, deleteTask} = require('../controllers/task-controller')

taskRouter.post('/add',addNewTask)
taskRouter.get('/all/:id',getAllTasks)
taskRouter.put('/update',updateTask)
taskRouter.delete('/delete/:id',deleteTask)

module.exports = taskRouter;