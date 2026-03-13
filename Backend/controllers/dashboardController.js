const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// Helper: Calculate task statistics
const calculateTaskStats = (tasks) => {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const highPriority = tasks.filter(t => t.priority === 'high').length;
  
  return {
    total,
    completed,
    inProgress,
    todo,
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    highPriority
  };
};

// Helper: Calculate project progress
const calculateProjectProgress = (tasks, projectId) => {
  const projectTasks = tasks.filter(t => 
    t.project && t.project.toString() === projectId.toString()
  );
  if (projectTasks.length === 0) return 0;
  const completed = projectTasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / projectTasks.length) * 100);
};

// GET /api/dashboard/stats
exports.getDashboardStats = async (req, res) => {
  try {
    // Use userId from the decoded JWT token (set by auth middleware)
    const userId = req.user.userId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    // Convert string ID to ObjectId if needed
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Get user's projects (as member or creator)
    const projects = await Project.find({
      $or: [
        { members: userObjectId },
        { createdBy: userObjectId }
      ]
    }).populate('members', 'name email avatar');

    const projectIds = projects.map(p => p._id);

    // Get all tasks for these projects
    const tasks = await Task.find({ project: { $in: projectIds } })
      .populate('assignee', 'name email avatar')
      .populate('project', 'title')
      .sort({ updatedAt: -1 });

    // Calculate statistics
    const taskStats = calculateTaskStats(tasks);
    
    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const recentTasks = tasks.filter(t => new Date(t.updatedAt) >= sevenDaysAgo);
    
    // Tasks due soon (next 7 days)
    const dueSoon = tasks.filter(t => {
      if (!t.dueDate || t.status === 'completed') return false;
      const due = new Date(t.dueDate);
      return due >= now && due <= new Date(now + 7 * 24 * 60 * 60 * 1000);
    });

    // Project statistics
    const projectStats = projects.map(project => ({
      id: project._id,
      title: project.title,
      description: project.description,
      status: project.status,
      progress: calculateProjectProgress(tasks, project._id),
      memberCount: project.members.length,
      taskCount: tasks.filter(t => t.project.toString() === project._id.toString()).length,
      createdAt: project.createdAt
    }));

    // Team performance (top contributors)
    const teamPerformance = await Task.aggregate([
      { $match: { project: { $in: projectIds }, status: 'completed' } },
      { $group: { _id: '$assignedTo', completedTasks: { $sum: 1 } } },
      { $sort: { completedTasks: -1 } },
      { $limit: 5 },
      { $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'user'
      }},
      { $unwind: '$user' },
      { $project: {
        userId: '$_id',
        name: '$user.name',
        email: '$user.email',
        completedTasks: 1
      }}
    ]);

    // Monthly task completion trend
    const monthlyTrend = await Task.aggregate([
      { $match: { project: { $in: projectIds }, status: 'completed' } },
      { $group: {
        _id: {
          year: { $year: '$updatedAt' },
          month: { $month: '$updatedAt' }
        },
        count: { $sum: 1 }
      }},
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 6 }
    ]);

    // Format monthly trend for charts
    const taskDistribution = monthlyTrend.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      count: item.count
    })).reverse();

    const stats = {
      overview: {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalTasks: taskStats.total,
        completedTasks: taskStats.completed,
        completionRate: taskStats.completionRate,
        tasksDueSoon: dueSoon.length
      },
      taskStats: {
        ...taskStats,
        distribution: {
          todo: taskStats.todo,
          inProgress: taskStats.inProgress,
          completed: taskStats.completed
        }
      },
      projects: projectStats.sort((a, b) => b.progress - a.progress),
      recentActivity: recentTasks.slice(0, 10).map(task => ({
        id: task._id,
        title: task.title,
        status: task.status,
        project: task.project?.title || 'Unknown',
        assignee: task.assignedTo?.name || 'Unassigned',
        updatedAt: task.updatedAt,
        priority: task.priority
      })),
      dueSoon: dueSoon.map(task => ({
        id: task._id,
        title: task.title,
        deadline: task.dueDate,
        project: task.project?.title || 'Unknown',
        priority: task.priority,
        daysLeft: Math.ceil((new Date(task.dueDate) - now) / (1000 * 60 * 60 * 24))
      })),
      teamPerformance,
      taskDistribution,
      monthlyTrend: taskDistribution
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats',
      details: error.message 
    });
  }
};

// GET /api/dashboard/activity - Recent activity feed
exports.getRecentActivity = async (req, res) => {
  try {
    // Use userId from the decoded JWT token (set by auth middleware)
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Convert to ObjectId for querying
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const projects = await Project.find({
      $or: [{ members: userObjectId }, { createdBy: userObjectId }]
    });

    const projectIds = projects.map(p => p._id);

    const activities = await Task.find({ project: { $in: projectIds } })
      .populate('assignedTo', 'name avatar')
      .populate('project', 'title')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const formattedActivities = activities.map(task => ({
      id: task._id,
      type: 'task_update',
      description: `Task "${task.title}" was ${task.status === 'completed' ? 'completed' : 'updated'}`,
      project: task.project?.title,
      user: task.assignedTo?.name || 'Unknown',
      avatar: task.assignedTo?.avatar,
      timestamp: task.updatedAt,
      status: task.status
    }));

    res.json({
      activities: formattedActivities,
      pagination: {
        page,
        limit,
        hasMore: activities.length === limit
      }
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
};

