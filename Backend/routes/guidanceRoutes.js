const express = require('express');
const router = express.Router();
const {
  getAIAssistance,
  analyzeProgress,
  reviewCode,
  getMentorMatches,
  requestMentor,
  acceptMentor,
  scheduleSession,
  completeSession,
  getLearningPath,
  getMyMentorships,
  submitFeedback,
  getChatHistory,
  getArchitectureRecommendation
} = require('../controllers/guidanceController');

const { requireAuth, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// AI Assistance routes
router.post('/ai-assist', getAIAssistance);
router.post('/analyze-progress', analyzeProgress);
router.post('/code-review', reviewCode);
router.get('/chat-history/:projectId', getChatHistory);
router.post('/architecture', getArchitectureRecommendation);

// Learning path
router.get('/learning-path/:projectId', getLearningPath);

// Mentor matching routes
router.get('/mentor-matches/:projectId', getMentorMatches);
router.post('/request-mentor', requestMentor);
router.post('/accept-mentor', requireRole(['mentor', 'admin']), acceptMentor);

// Mentorship session routes
router.get('/mentorships', getMyMentorships);
router.post('/schedule-session', scheduleSession);
router.post('/complete-session', completeSession);
router.post('/feedback', submitFeedback);

module.exports = router;

