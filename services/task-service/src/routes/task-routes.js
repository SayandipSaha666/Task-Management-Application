const express = require('express');
const router = express.Router();

const {
  addNewTask,
  getAllTasks,
  updateTask,
  deleteTask
} = require('../controllers/task-controller');

router.post('/add', addNewTask);
router.get('/all/:id', getAllTasks);
router.put('/update', updateTask);
router.delete('/delete/:id', deleteTask);

module.exports = router;
