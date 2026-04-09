const Task = require('../models/Task');
const Project = require('../models/Project');
const mongoose = require('mongoose');

/**
 * Get user's tasks - only from projects they own/are enrolled in
 */
exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Find user's projects (created or enrolled)
    const userProjects = await Project.find({
      $or: [
        { createdBy: mongoose.Types.ObjectId(userId) },
        { 'enrolledUsers.user': mongoose.Types.ObjectId(userId) }
      ]
    });
    
    const projectIds = userProjects.map(p => p._id);
    
    // Get tasks from user's projects only
    const tasks = await Task.find({ 
      project: { $in: projectIds } 
    })
    .populate('assignedTo', 'name email')
    .populate('project', 'title')
    .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Create task in user's project
 */
exports.createTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { project: projectId, ...taskData } = req.body;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID required' });
    }
    
    // Verify user has access to this project
    const project = await Project.findOne({
      _id: projectId,
      $or: [
        { createdBy: mongoose.Types.ObjectId(userId) },
        { 'enrolledUsers.user': mongoose.Types.ObjectId(userId) }
      ]
    });
    
    if (!project) {
      return res.status(403).json({ error: 'No access to this project' });
    }
    
    const task = await Task.create({
      ...taskData,
      project: projectId,
      assignedTo: taskData.assignedTo || userId  // Default to creator
    });
    
    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'title');
    
    res.status(201).json({
      success: true,
      data: populatedTask
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Update task (verify access)
 */
exports.updateTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.id;
    
    // Find task and verify project access
    const task = await Task.findById(taskId).populate('project');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Check project access
    const project = task.project;
    const hasAccess = project.createdBy.toString() === userId || 
                     project.enrolledUsers.some(e => e.user.toString() === userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access to this task/project' });
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      taskId, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('project', 'title');
    
    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Delete task (verify access)
 */
exports.deleteTask = async (req, res) => {
  try {
    const userId = req.user.userId;
    const taskId = req.params.id;
    
    const task = await Task.findById(taskId).populate('project');
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const project = task.project;
    const hasAccess = project.createdBy.toString() === userId || 
                     project.enrolledUsers.some(e => e.user.toString() === userId);
    
    if (!hasAccess) {
      return res.status(403).json({ error: 'No access to this task/project' });
    }
    
    await Task.findByIdAndDelete(taskId);
    
    res.json({ 
      success: true,
      message: 'Task deleted successfully' 
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

