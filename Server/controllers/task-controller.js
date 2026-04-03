const Joi = require("joi")
const { Task } = require("../models/tasks")

const addTaskSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    status: Joi.string().required(),
    userId: Joi.string().required(),
    priority: Joi.string().required()
})

const addNewTask = async (req,res) => {
    const {title, description, status, userId, priority} = req.body
    const {error} = addTaskSchema.validate({title, description, status, userId, priority});
    if(error){
        return res.status(400).json({
            success: false, message: error.details[0].message
        })
    }
    try{
        const newTask = await Task.create({
            title,
            description,
            status,
            userId,
            priority
        })
        if(newTask){
            return res.status(201).json({
                success: true, message: "Task added successfully",
                data: newTask
            })
        }else{
            return res.status(400).json({
                success: false, message: "Task not added"
            })
        }
    }catch(error){
        return res.status(500).json({
            success: false, message: "Internal Server Error"
        })
    }
}

const getAllTasks = async (req,res) => {
    const {id} = req.params;
    try{
        const tasks = await Task.find({userId: id});
        if(tasks){
            return res.status(200).json({
                success: true, message: "Tasks fetched successfully",
                taskList: tasks
            })
        }else{
            return res.status(400).json({
                success: false, message: "No tasks found"
            })
        }
    }catch(error){
        return res.status(500).json({
            success: false, message: "Internal Server Error"
        })
    }
}

const updateTask = async(req,res) => {
    const {title, description, status, priority, userId, _id} = req.body
    try {
        const updateTask = await Task.findByIdAndUpdate({_id},{
            title,
            description,
            status,
            priority,
            userId
        },{
            new: true
        })
        if(updateTask){
            return res.status(201).json({
                success: true, message: "Task updated successfully",
                data: updateTask
            })
        }else{
            return res.status(400).json({
                success: false, message: "Task not updated"
            })
        }
    } catch (error) {
        return res.status(500).json({
            success: false, message: "Some error occured while updating task"
        })
    }
}

const deleteTask = async(req,res) => {
    const {id} = req.params;
    try {
        if(!id){
            return res.status(400).json({
                success: false, message: "Invalid Id"
            })
        }
        const deleteItem = await Task.findByIdAndDelete(id);
        if(!deleteItem){
            return res.status(400).json({
                success: false, message: "Task Not Found"
            })
        }else{
            return res.status(200).json({
                success: true, message: "Task Deleted Successfully"
            })
        }
    } catch (error) {
        return res.status(400).json({
            success: false, message: error.details[0].message
        })
    }
}

module.exports = {addNewTask, getAllTasks, updateTask, deleteTask}
