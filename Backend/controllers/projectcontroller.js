const Project = require('../models/Project');

// @desc    Get project suggestions (templates)
// @route   GET /api/projects/suggestions
// @access  Public (no auth required)
const getProjectSuggestions = async (req, res) => {
  try {
    const { difficulty, stack, domain } = req.query;
    
    // Build filter object
    const filter = { isTemplate: true };
    
    if (difficulty) filter.difficulty = difficulty;
    if (domain) filter.domain = domain;
    if (stack) {
      // Filter by stack/technologies - check both new and legacy formats
      filter.$or = [
        { 'suggestedStacks.name': { $regex: stack, $options: 'i' } },
        { 'suggestedStacks.technologies.name': { $regex: stack, $options: 'i' } },
        { 'tags': { $regex: stack, $options: 'i' } }
      ];
    }

    const projects = await Project.find(filter)
      .select('-members -createdBy -enrolledUsers')
      .limit(20)
      .lean();

    // Always return an array in the response
    res.json(projects || []);
  } catch (error) {
    console.error('Project suggestions error:', error);
    res.status(500).json({ error: error.message, projects: [] });
  }
};

// @desc    Get user's enrolled projects
// @route   GET /api/projects/my-projects
// @access  Private
const getMyProjects = async (req, res) => {
  try {
    // Find projects where the user is enrolled
    const projects = await Project.find({
      'enrolledUsers.user': req.user.userId
    })
    .select('title slug description difficulty domain estimatedDuration suggestedStacks milestones enrolledUsers averageRating')
    .lean();

    // Map to include user's enrollment data
    const userProjects = projects.map(project => {
      const enrollment = project.enrolledUsers.find(
        e => e.user.toString() === req.user.userId.toString()
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
        }
      };
    });

    res.json({
      success: true,
      count: userProjects.length,
      data: userProjects
    });
  } catch (error) {
    console.error('Get my projects error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Enroll in a project
// @route   POST /api/projects/:id/enroll
// @access  Private
const enrollInProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const { chosenStack } = req.body;
    const userId = req.user.userId;

    console.log('🔵 Enrollment attempt:', { projectId, userId, chosenStack });

    // Validate project ID
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    // Find the project
    const project = await Project.findById(projectId);
    
    if (!project) {
      console.log('❌ Project not found:', projectId);
      return res.status(404).json({ error: 'Project not found' });
    }

    console.log('✅ Project found:', project.title);

    // Check if already enrolled - handle both populated and non-populated users
    const existingEnrollment = project.enrolledUsers?.find(
      e => {
        const enrolledUserId = e.user?.toString ? e.user.toString() : e.user;
        return enrolledUserId === userId;
      }
    );
    
    if (existingEnrollment) {
      console.log('⚠️ User already enrolled');
      return res.status(400).json({ error: 'Already enrolled in this project' });
    }

    // Find the stack details if provided
    let stackDetails = null;
    if (chosenStack && project.suggestedStacks && project.suggestedStacks.length > 0) {
      stackDetails = project.suggestedStacks.find(
        s => s.name === chosenStack.name || (s._id && s._id.toString() === chosenStack._id)
      );
    }

    // Use provided stack or first suggested stack
    const finalStack = stackDetails || chosenStack || (project.suggestedStacks?.[0] ? { name: project.suggestedStacks[0].name } : null);

    // Initialize enrolledUsers array if it doesn't exist
    if (!project.enrolledUsers) {
      project.enrolledUsers = [];
    }

    // Add enrollment with all required fields
    const enrollment = {
      user: userId,
      chosenStack: finalStack,
      status: 'enrolled',
      currentMilestone: 0,
      completedMilestones: [],
      enrolledAt: new Date(),
      lastActivity: new Date()
    };

    project.enrolledUsers.push(enrollment);
    await project.save();

    const newEnrollment = project.enrolledUsers[project.enrolledUsers.length - 1];

    console.log('✅ Enrollment successful:', newEnrollment);

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in project',
      enrollment: {
        projectId: project._id,
        projectTitle: project.title,
        currentMilestone: newEnrollment.currentMilestone,
        completedMilestones: newEnrollment.completedMilestones,
        chosenStack: newEnrollment.chosenStack,
        status: newEnrollment.status,
        enrolledAt: newEnrollment.enrolledAt
      }
    });
  } catch (error) {
    console.error('❌ Enrollment error:', error);
    res.status(500).json({ error: 'Enrollment failed', message: error.message });
  }
};

// @desc    Update milestone progress
// @route   PUT /api/projects/:id/milestones/:milestoneId
// @access  Private
const updateMilestone = async (req, res) => {
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

// @desc    Rate a project
// @route   POST /api/projects/:id/rate
// @access  Private
const rateProject = async (req, res) => {
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
    const existingRatingIndex = project.ratings.findIndex(
      r => r.user.toString() === req.user.userId.toString()
    );

    const ratingData = {
      user: req.user.userId,
      rating,
      review: review || '',
      completed: completed || false
    };

    if (existingRatingIndex !== -1) {
      // Update existing rating
      project.ratings[existingRatingIndex] = ratingData;
    } else {
      // Add new rating
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
    console.error('Rate project error:', error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const { title, description } = req.body;

    // Check for duplicate title
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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get all projects for logged-in user
// @route   GET /api/projects
// @access  Private
const getUserProjects = async (req, res) => {
  try {
    const { search, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    let query = { createdBy: req.user.userId };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const projects = await Project.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .select('-__v');

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    // Find project by ID - allow viewing any project (templates or user's projects)
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user is enrolled in this project
    const userEnrollment = project.enrolledUsers?.find(
      e => e.user.toString() === req.user.userId.toString()
    );

    // If user is enrolled, include their enrollment data
    if (userEnrollment) {
      return res.json({
        success: true,
        data: {
          ...project.toObject(),
          enrollment: {
            currentMilestone: userEnrollment.currentMilestone,
            completedMilestones: userEnrollment.completedMilestones,
            chosenStack: userEnrollment.chosenStack,
            status: userEnrollment.status,
            enrolledAt: userEnrollment.enrolledAt,
            repositoryUrl: userEnrollment.repositoryUrl,
            deployedUrl: userEnrollment.deployedUrl
          }
        }
      });
    }

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (description !== undefined) updateFields.description = description.trim();

    if (title) {
      const existing = await Project.findOne({
        title: title.trim(),
        createdBy: req.user.userId,
        _id: { $ne: req.params.id }
      });
      
      if (existing) {
        return res.status(400).json({ message: 'Another project with this title exists' });
      }
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.userId },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({
      success: true,
      data: project
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Get ALL user's projects (created + enrolled)
// @route   GET /api/projects/all-my-projects
// @access  Private
const getAllMyProjects = async (req, res) => {
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
        isCreated: false // Distinguish from created projects
      };
    });

    // Combine and dedupe by _id
    const allIds = new Set();
    const allProjects = [];

    [...createdProjects.map(p => ({...p, isCreated: true})), ...enrolledProjects].forEach(project => {
      if (!allIds.has(project._id.toString())) {
        allIds.add(project._id.toString());
        allProjects.push(project);
      }
    });

    // Sort by updatedAt desc
    allProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    res.json({
      success: true,
      count: allProjects.length,
      data: allProjects
    });

  } catch (error) {
    console.error('Get all my projects error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
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
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

module.exports = {
  getProjectSuggestions,
  createProject,
  getUserProjects,
  getProjectById,
  updateProject,
  deleteProject,
  enrollInProject,
  getMyProjects,
  getAllMyProjects,  // ✅ New unified endpoint
  updateMilestone,
  rateProject
};


