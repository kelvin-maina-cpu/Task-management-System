const Project = require('../models/Project');
const mongoose = require('mongoose');

// GET /api/projects/suggestions
exports.getProjectSuggestions = async (req, res) => {
  try {
    const { difficulty, stack, domain } = req.query;
    console.log('🔍 getProjectSuggestions:', { difficulty, stack, domain });
    
    const filter = { isTemplate: true };
    
    if (difficulty) filter.difficulty = difficulty;
    if (domain) filter.domain = domain;

    const projects = await Project.find(filter).limit(30);
    console.log('✅ Found templates:', projects.length, projects.map(p => ({title: p.title, _id: p._id})));
    
    res.json(projects);
  } catch (error) {
    console.error('💥 getProjectSuggestions error:', error);
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
    const { id: projectId, milestoneId } = req.params;
    const { status, completed } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Find user's enrollment
    const enrollmentIndex = project.enrolledUsers.findIndex(
      e => e.user.toString() === req.user.userId.toString()
    );

    if (enrollmentIndex === -1) {
      return res.status(400).json({ error: 'Not enrolled in this project' });
    }

    const enrollment = project.enrolledUsers[enrollmentIndex];
    const milestoneOrder = parseInt(milestoneId);

    if (status === 'completed' && !enrollment.completedMilestones.includes(milestoneOrder)) {
      enrollment.completedMilestones.push(milestoneOrder);
      enrollment.completedMilestones.sort((a, b) => a - b);
      
      // Update current milestone to next one
      const totalMilestones = project.milestones?.length || 0;
      if (milestoneOrder < totalMilestones) {
        enrollment.currentMilestone = milestoneOrder + 1;
      }
      
      // Update enrollment status
      if (milestoneOrder === totalMilestones) {
        enrollment.status = 'completed';
        project.completionCount = (project.completionCount || 0) + 1;
      } else if (enrollment.status === 'enrolled') {
        enrollment.status = 'in-progress';
      }
    }

    await project.save();

    res.json({
      success: true,
      message: 'Milestone updated successfully',
      enrollment: {
        currentMilestone: enrollment.currentMilestone,
        completedMilestones: enrollment.completedMilestones,
        status: enrollment.status
      }
    });
  } catch (error) {
    console.error('Update milestone error:', error);
    res.status(500).json({ error: error.message });
  }
};

// MISSING METHODS FROM projectcontroller.js - MERGED
exports.getAllMyProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Query 1: Created projects
    const createdQuery = { createdBy: userId };
    const createdProjects = await Project.find(createdQuery)
      .select('title slug description difficulty domain estimatedDuration suggestedStacks milestones averageRating createdAt updatedAt')
      .lean();

    // Query 2: Enrolled projects
    const enrolledQuery = { 'enrolledUsers.user': userId };
    const enrolledProjectsRaw = await Project.find(enrolledQuery)
      .select('title slug description difficulty domain estimatedDuration suggestedStacks milestones enrolledUsers averageRating createdAt updatedAt')
      .lean();

    // Map enrolled with user enrollment data
    const enrolledProjects = enrolledProjectsRaw.map(project => {
      const enrollment = project.enrolledUsers.find(
        e => e.user.toString() === userId
      );
      return {
        _id: project._id,
        title: project.title,
        slug: project.slug,
        description: project.description,
        difficulty: project.difficulty,
        domain: project.domain,
        estimatedDuration: project.estimatedDuration,
        suggestedStacks: project.suggestedStacks,
        milestones: project.milestones,
        averageRating: project.averageRating,
        enrollment: {
          currentMilestone: enrollment?.currentMilestone || 0,
          completedMilestones: enrollment?.completedMilestones || [],
          chosenStack: enrollment?.chosenStack,
          status: enrollment?.status || 'enrolled',
          enrolledAt: enrollment?.enrolledAt,
          repositoryUrl: enrollment?.repositoryUrl,
          deployedUrl: enrollment?.deployedUrl
        },
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        isCreated: false
      };
    });

    // Combine and dedupe
    const allIds = new Set();
    const allProjects = [];

    [...createdProjects.map(p => ({...p, isCreated: true})), ...enrolledProjects].forEach(project => {
      if (!allIds.has(project._id.toString())) {
        allIds.add(project._id.toString());
        allProjects.push(project);
      }
    });

    allProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.json({
      success: true,
      count: allProjects.length,
      data: allProjects
    });
  } catch (error) {
    console.error('Get all my projects error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    const existingProject = await Project.findOne({ 
      title: title.trim(), 
      createdBy: req.user.userId 
    });

    if (existingProject) {
      return res.status(400).json({ message: 'Project with this title already exists' });
    }

    const project = await Project.create({
      title: title.trim(),
      description: description?.trim(),
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      data: project
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user.userId;
    
    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();

    if (title) {
      const existing = await Project.findOne({
        title: title.trim(),
        createdBy: userId,
        _id: { $ne: req.params.id }
      });
      
      if (existing) {
        return res.status(400).json({ message: 'Another project with this title exists' });
      }
    }

    const mongoose = require('mongoose');
    const project = await Project.findOneAndUpdate(
      { 
        _id: req.params.id, 
        createdBy: new mongoose.Types.ObjectId(userId)
      },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!project) {
      const exists = await Project.findById(req.params.id);
      if (!exists) return res.status(404).json({ message: 'Project not found' });
      return res.status(403).json({ message: 'Not authorized to edit this project' });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('updateProject error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      success: true,
      message: 'Project deleted successfully',
      data: project._id
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


