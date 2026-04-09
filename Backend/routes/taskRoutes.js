
const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes protected  
router.use(authMiddleware);

// Get user's tasks (filtered)
router.get('/', tasksController.getUserTasks);

// Create task (user verified project access)
router.post('/', tasksController.createTask);
   
// Update task (user verified access)
router.put('/:id', tasksController.updateTask);
router.delete('/:id', tasksController.deleteTask);

module.exports = router;
