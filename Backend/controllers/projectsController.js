const Project = require('../models/Project');
const mongoose = require('mongoose');

// GET /api/projects/suggestions
exports.getProjectSuggestions = async (req, res) => {
  try {
    const { difficulty, stack, domain } = req.query;
    const filter = { isTemplate: true };
    
    if (difficulty) filter.difficulty = difficulty;
    if (domain) filter.domain = domain;

    const projects = await Project.find(filter).limit(30);
    res.json(projects);
  } catch (error) {
    console.error('getProjectSuggestions error:', error);
    res.status(500).json({ error: error.message });
  }
};

// GET /api/projects/:id
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    console.error('getProjectById error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ POST /api/projects/:id/enroll - FIXED WITH DEFENSIVE HANDLING
exports.enrollInProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { chosenStack } = req.body;
    const userId = req.user?.userId;

    // 🔍 DETAILED LOGGING START
    console.log('🔵 ENROLLMENT START:', {
      projectId: id,
      userId,
      hasReqUser: !!req.user,
      reqUserKeys: req.user ? Object.keys(req.user) : null,
      chosenStackKeys: chosenStack ? Object.keys(chosenStack) : null
    });

    // Validate inputs
    if (!userId) {
      console.error('❌ NO USER ID - Auth failed');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('❌ INVALID PROJECT ID:', id);
      return res.status(400).json({ error: 'Invalid project ID' });
    }

    // Validate/convert userId to ObjectId safely
    let userObjectId;
    try {
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (oidError) {
      console.error('❌ INVALID USER ID FORMAT:', userId, oidError);
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    // Find project
    const project = await Project.findById(id);
    if (!project) {
      console.error('❌ PROJECT NOT FOUND:', id);
      return res.status(404).json({ error: 'Project not found' });
    }
    console.log('✅ Project found:', project.title, 'enrolledUsers exists?', !!project.enrolledUsers);

    // Check existing enrollment
    const existingEnrollment = project.enrolledUsers?.find(
      e => e.user?.toString() === userObjectId.toString()
    );
    if (existingEnrollment) {
      console.log('⚠️ Already enrolled:', userObjectId.toString());
      return res.status(400).json({ error: 'Already enrolled in this project' });
    }

    // Simplify chosenStack for storage (avoid schema validation issues)
    const safeChosenStack = chosenStack ? {
      name: chosenStack.name || 'Custom',
      technologies: chosenStack.technologies || [],
      // Store other fields as plain objects
      ...chosenStack
    } : { name: 'Default' };

    // Create enrollment
    const enrollment = {
      user: userObjectId,
      chosenStack: safeChosenStack,
      status: 'enrolled',
      currentMilestone: 0,
      completedMilestones: [],
      enrolledAt: new Date(),
      lastActivity: new Date()
    };

    // Initialize array
    if (!project.enrolledUsers) {
      project.enrolledUsers = [];
    }

    project.enrolledUsers.push(enrollment);
    
    console.log('🟡 Pre-save check - enrolledUsers length:', project.enrolledUsers.length);
    
    // Save with validation
    const savedProject = await project.save({ validateBeforeSave: true });
    console.log('✅ ENROLLMENT SUCCESS - savedProject._id:', savedProject._id);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in project',
      enrollment: {
        projectId: project._id,
        projectTitle: project.title,
        status: enrollment.status,
        currentMilestone: enrollment.currentMilestone,
        enrolledAt: enrollment.enrolledAt,
        chosenStack: safeChosenStack
      }
    });

  } catch (error) {
    // 🛑 COMPREHENSIVE ERROR LOGGING
    console.error('❌ CRITICAL ENROLLMENT ERROR:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      projectId: req.params.id,
      userId: req.user?.userId,
      chosenStackKeys: req.body.chosenStack ? Object.keys(req.body.chosenStack) : null,
      timestamp: new Date().toISOString()
    });
    
    if (error.name === 'ValidationError') {
      console.error('VALIDATION ERRORS:', error.errors);
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: Object.keys(error.errors || {}) 
      });
    }
    
    if (error.name === 'MongoError') {
      console.error('MONGO ERROR CODE:', error.code);
    }
    
    res.status(500).json({ 
      error: 'Enrollment failed', 
      message: error.message 
    });
  }
};


// GET /api/projects/my-projects
exports.getMyProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const projects = await Project.find({
      'enrolledUsers.user': userId
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user.userId
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/projects/:id/rate
exports.rateProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { rating, review, completed } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user already rated
    const existingRatingIndex = project.ratings
      ? project.ratings.findIndex(r => r.user.toString() === req.user.userId.toString())
      : -1;

    const ratingData = {
      user: req.user.userId,
      rating,
      review: review || '',
      completed: completed || false
    };

    if (!project.ratings) project.ratings = [];

    if (existingRatingIndex !== -1) {
      project.ratings[existingRatingIndex] = ratingData;
    } else {
      project.ratings.push(ratingData);
    }

    // Recalculate average rating
    const sum = project.ratings.reduce((acc, r) => acc + r.rating, 0);
    project.averageRating = Math.round((sum / project.ratings.length) * 10) / 10;

    await project.save();

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      averageRating: project.averageRating,
      totalRatings: project.ratings.length
    });
  } catch (error) {
    console.error('rateProject error:', error);
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/projects/:id/milestones/:milestoneId
exports.updateMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const project = await Project.findOne({ 
      _id: id, 
      'enrolledUsers.user': userId 
    });

    if (!project) {
      return res.status(404).json({ error: 'Project or enrollment not found' });
    }

    const enrollment = project.enrolledUsers.find(
      e => e.user.toString() === userId
    );

    if (status === 'completed') {
      const milestoneNum = parseInt(milestoneId);
      if (!enrollment.completedMilestones.includes(milestoneNum)) {
        enrollment.completedMilestones.push(milestoneNum);
      }
      enrollment.currentMilestone = Math.max(enrollment.currentMilestone, milestoneNum + 1);
    }

    enrollment.lastActivity = new Date();
    await project.save();

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

