const Joi = require('joi');
const Task = require('../models/task');
const { publishTaskEvent } = require('../events/publisher');

const addTaskSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  status: Joi.string().valid('todo', 'inProgress', 'blocked', 'review', 'done').required(),
  userId: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high').required()
});

// ─── Add Task ──────────────────────────────────────────────────
const addNewTask = async (req, res) => {
  const { title, description, status, userId, priority } = req.body;
  const { error } = addTaskSchema.validate({ title, description, status, userId, priority });

  if (error) {
    return res.status(400).json({
      success: false, message: error.details[0].message
    });
  }

  try {
    const newTask = await Task.create({ title, description, status, userId, priority });

    // ─── Publish event ──────────────────────────────────
    await publishTaskEvent('task.created', {
      taskId: newTask._id.toString(),
      userId,
      title: newTask.title,
      status: newTask.status,
      priority: newTask.priority
    });
    // ────────────────────────────────────────────────────────

    return res.status(201).json({
      success: true, message: 'Task added successfully',
      data: newTask
    });
  } catch (error) {
    console.error('Add task error:', error);
    return res.status(500).json({
      success: false, message: 'Internal Server Error'
    });
  }
};

// ─── Get All Tasks ─────────────────────────────────────────────
const getAllTasks = async (req, res) => {
  const { id } = req.params;

  try {
    const tasks = await Task.find({ userId: id });
    return res.status(200).json({
      success: true, message: 'Tasks fetched successfully',
      taskList: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({
      success: false, message: 'Internal Server Error'
    });
  }
};

// ─── Update Task ───────────────────────────────────────────────
const updateTask = async (req, res) => {
  const { title, description, status, priority, userId, _id } = req.body;

  try {
    // ─── Fetch the OLD task BEFORE updating ─────────────
    // We need the old status to detect status changes
    const oldTask = await Task.findById(_id);
    if (!oldTask) {
      return res.status(404).json({
        success: false, message: 'Task not found'
      });
    }
    // ────────────────────────────────────────────────────────

    const updatedTask = await Task.findByIdAndUpdate(
      _id,
      { title, description, status, priority, userId },
      { new: true }
    );

    // ─── Publish "task.updated" event ───────────────────
    await publishTaskEvent('task.updated', {
      taskId: updatedTask._id.toString(),
      userId,
      oldStatus: oldTask.status,
      newStatus: updatedTask.status
    });

    // ─── If status actually changed, publish a SEPARATE event
    if (oldTask.status !== status) {
      await publishTaskEvent('task.statusChanged', {
        taskId: updatedTask._id.toString(),
        userId,
        from: oldTask.status,
        to: status
      });
    }
    // ────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true, message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({
      success: false, message: 'Some error occurred while updating task'
    });
  }
};

// ─── Delete Task ───────────────────────────────────────────────
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res.status(400).json({
        success: false, message: 'Invalid Id'
      });
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({
        success: false, message: 'Task Not Found'
      });
    }

    // ─── Publish event ──────────────────────────────────
    await publishTaskEvent('task.deleted', {
      taskId: id,
      userId: deletedTask.userId,
      title: deletedTask.title
    });
    // ────────────────────────────────────────────────────────

    return res.status(200).json({
      success: true, message: 'Task Deleted Successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({
      success: false, message: 'Internal Server Error'
    });
  }
};

module.exports = { addNewTask, getAllTasks, updateTask, deleteTask };
