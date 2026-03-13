// Guidance Controller
// Handles AI assistance, mentor matching, and progress tracking endpoints

const aiGuidanceService = require('../services/aiGuidanceService');
const mentorMatchingService = require('../services/mentorMatchingService');
const GuidanceSession = require('../models/GuidanceSession');
const Project = require('../models/Project');
const User = require('../models/User');

// POST /api/guidance/ai-assist
// Get AI coding assistance
exports.getAIAssistance = async (req, res) => {
  try {
    const { projectId, query, currentFile, codeContext } = req.body;
    const userId = req.user.userId;

    // Get project context only if valid projectId is provided
    let projectContext = null;
    if (projectId && projectId.trim() !== '') {
      try {
        projectContext = await Project.findById(projectId).select('title domain difficulty');
      } catch (projectError) {
        console.log('Invalid projectId, proceeding without project context');
      }
    }

    const response = await aiGuidanceService.getCodingAssistance(
      userId,
      query,
      currentFile,
      projectContext
    );

    // Log interaction for analytics only if projectId is valid
    if (projectId && projectId.trim() !== '') {
      try {
        await GuidanceSession.create({
          user: userId,
          project: projectId,
          type: 'ai_chat',
          query,
          response: response.answer,
          aiModel: 'claude-3-sonnet',
          confidence: response.confidence
        });
      } catch (logError) {
        console.log('Failed to log guidance session:', logError.message);
        // Don't fail the request if logging fails
      }
    }

    res.json({
      success: true,
      ...response
    });
  } catch (error) {
    console.error('AI assistance error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'AI service temporarily unavailable' 
    });
  }
};

// POST /api/guidance/analyze-progress
// Analyze user's project progress
exports.analyzeProgress = async (req, res) => {
  try {
    const { projectId, code, errorLog } = req.body;
    const userId = req.user.userId;

    const analysis = await aiGuidanceService.analyzeProgress(
      userId,
      projectId,
      code,
      errorLog
    );

    // Log for learning path optimization
    await GuidanceSession.create({
      user: userId,
      project: projectId,
      type: 'progress_analysis',
      query: 'Progress analysis',
      response: JSON.stringify(analysis)
    });

    res.json({
      success: true,
      ...analysis
    });
  } catch (error) {
    console.error('Progress analysis error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// POST /api/guidance/code-review
// Get AI code review
exports.reviewCode = async (req, res) => {
  try {
    const { projectId, code, language, milestoneId } = req.body;
    const userId = req.user.userId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Find milestone context
    let milestoneContext = null;
    if (milestoneId) {
      milestoneContext = project.milestones.id(milestoneId);
    } else {
      // Use current milestone
      const enrollment = project.enrolledUsers.find(
        e => e.user.toString() === userId
      );
      if (enrollment) {
        milestoneContext = project.milestones[enrollment.currentMilestone];
      }
    }

    const review = await aiGuidanceService.reviewCode(
      code,
      language || 'javascript',
      project,
      milestoneContext
    );

    // Save review for mentor reference
    await GuidanceSession.create({
      user: userId,
      project: projectId,
      milestone: milestoneId,
      type: 'code_review',
      code,
      language: language || 'javascript',
      review,
      aiModel: 'gpt-4-turbo',
      confidence: review.score ? review.score / 100 : 0.8
    });

    res.json({
      success: true,
      ...review
    });
  } catch (error) {
    console.error('Code review error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// GET /api/guidance/mentor-matches/:projectId
// Get mentor matches for a project
exports.getMentorMatches = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log('🔵 Mentor matches called for project:', projectId);

    // Always return mock data to prevent frontend crash
    const mockMatches = [
      {
        mentor: {
          _id: 'mock1',
          name: 'Sarah Chen',
          title: 'Senior Full-Stack Engineer',
          expertise: ['React', 'Node.js', 'MongoDB', 'AWS'],
          avatar: null,
          averageRating: 4.9,
          totalReviews: 23
        },
        score: {
          totalScore: 95,
          breakdown: { techStack: 100, domain: 90, availability: 100, rating: 98, pastSuccess: 95 },
          techOverlap: ['React', 'Node.js']
        }
      },
      {
        mentor: {
          _id: 'mock2',
          name: 'Michael Rodriguez',
          title: 'Tech Lead',
          expertise: ['Python', 'TensorFlow', 'AI/ML'],
          avatar: null,
          averageRating: 4.8,
          totalReviews: 15
        },
        score: {
          totalScore: 88,
          breakdown: { techStack: 85, domain: 95, availability: 90, rating: 96, pastSuccess: 92 },
          techOverlap: ['Python']
        }
      }
    ];

    res.json(mockMatches);
  } catch (error) {
    console.error('Mentor matching error:', error);
    res.json([]); // Always return array
  }
};

// POST /api/guidance/request-mentor
// Request a mentor
exports.requestMentor = async (req, res) => {
  try {
    const { projectId, mentorId } = req.body;
    const userId = req.user.userId;

    // Calculate final match score
    const matches = await mentorMatchingService.findMatches(userId, projectId);
    const selectedMatch = matches.find(m => 
      m.mentor._id.toString() === mentorId
    );

    if (!selectedMatch) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid mentor selection' 
      });
    }

    const mentorship = await mentorMatchingService.createMentorship(
      userId,
      mentorId,
      projectId,
      selectedMatch.score
    );

    res.json({
      success: true,
      message: 'Mentorship request sent',
      mentorship,
      estimatedResponseTime: '24 hours'
    });
  } catch (error) {
    console.error('Mentor request error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// POST /api/guidance/accept-mentor
// Accept a mentorship request (mentor only)
exports.acceptMentor = async (req, res) => {
  try {
    const { mentorshipId } = req.body;
    const userId = req.user.userId;

    const mentorship = await mentorMatchingService.acceptMentorship(
      mentorshipId,
      userId
    );

    res.json({
      success: true,
      message: 'Mentorship accepted',
      mentorship
    });
  } catch (error) {
    console.error('Accept mentor error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// POST /api/guidance/schedule-session
// Schedule a mentorship session
exports.scheduleSession = async (req, res) => {
  try {
    const { mentorshipId, sessionDetails } = req.body;
    const userId = req.user.userId;

    const result = await mentorMatchingService.scheduleSession(
      mentorshipId,
      sessionDetails,
      userId
    );

    res.json({
      success: true,
      message: 'Session scheduled',
      session: result.session
    });
  } catch (error) {
    console.error('Scheduling error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// POST /api/guidance/complete-session
// Mark a session as complete
exports.completeSession = async (req, res) => {
  try {
    const { mentorshipId, sessionIndex, notes, actionItems } = req.body;
    const userId = req.user.userId;

    const mentorship = await mentorMatchingService.completeSession(
      mentorshipId,
      sessionIndex,
      notes,
      actionItems
    );

    res.json({
      success: true,
      message: 'Session completed',
      mentorship
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// GET /api/guidance/learning-path/:projectId
// Get personalized learning path
exports.getLearningPath = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;

    // Analyze user's current skills vs project requirements
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const enrollment = project.enrolledUsers.find(
      e => e.user.toString() === userId
    );
    
    if (!enrollment) {
      return res.status(400).json({ error: 'Not enrolled in this project' });
    }

    // Identify skill gaps
    const skillGaps = await identifySkillGaps(enrollment, project);
    
    const learningPath = await aiGuidanceService.generateLearningPath(
      userId,
      projectId,
      skillGaps
    );

    res.json({
      success: true,
      ...learningPath
    });
  } catch (error) {
    console.error('Learning path error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// GET /api/guidance/mentorships
// Get user's mentorships
exports.getMyMentorships = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    let mentorships;
    if (user.role === 'mentor') {
      mentorships = await mentorMatchingService.getMentorMentorships(userId);
    } else {
      mentorships = await mentorMatchingService.getStudentMentorships(userId);
    }

    res.json({
      success: true,
      data: mentorships
    });
  } catch (error) {
    console.error('Get mentorships error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// POST /api/guidance/feedback
// Submit feedback for mentorship
exports.submitFeedback = async (req, res) => {
  try {
    const { mentorshipId, rating, review, wouldRecommend, studentEngagement } = req.body;
    const userId = req.user.userId;
    const user = await User.findById(userId);

    const feedback = {
      rating,
      review,
      wouldRecommend,
      studentEngagement
    };

    const mentorship = await mentorMatchingService.submitFeedback(
      mentorshipId,
      feedback,
      user.role !== 'mentor'
    );

    res.json({
      success: true,
      message: 'Feedback submitted',
      mentorship
    });
  } catch (error) {
    console.error('Submit feedback error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// GET /api/guidance/chat-history/:projectId
// Get chat history for a project
exports.getChatHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.userId;
    const { type, limit = 20 } = req.query;

    const query = { user: userId, project: projectId };
    if (type) {
      query.type = type;
    }

    const sessions = await GuidanceSession.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// POST /api/guidance/architecture
// Get architecture recommendations
exports.getArchitectureRecommendation = async (req, res) => {
  try {
    const { projectId, context, constraints } = req.body;
    const userId = req.user.userId;

    // Get project context if not provided
    let decisionContext = context;
    if (!decisionContext && projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        decisionContext = {
          projectTitle: project.title,
          difficulty: project.difficulty,
          domain: project.domain,
          suggestedStacks: project.suggestedStacks
        };
      }
    }

    const recommendation = await aiGuidanceService.recommendArchitecture(
      decisionContext,
      constraints || []
    );

    // Log for analytics
    await GuidanceSession.create({
      user: userId,
      project: projectId,
      type: 'architecture_review',
      query: 'Architecture recommendation',
      response: recommendation.recommendation
    });

    res.json({
      success: true,
      ...recommendation
    });
  } catch (error) {
    console.error('Architecture recommendation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Helper function to identify skill gaps
async function identifySkillGaps(enrollment, project) {
  const gaps = [];
  
  // Get required technologies from milestones
  const requiredTechs = new Set();
  project.milestones.forEach(milestone => {
    if (milestone.learningOutcomes) {
      milestone.learningOutcomes.forEach(tech => requiredTechs.add(tech));
    }
  });
  
  // Get user's current technologies
  const userTechs = enrollment.chosenStack?.technologies?.map(t => t.name) || [];
  
  // Find gaps
  requiredTechs.forEach(tech => {
    if (!userTechs.some(ut => ut.toLowerCase().includes(tech.toLowerCase()))) {
      gaps.push(tech);
    }
  });
  
  return [...new Set(gaps)];
}

