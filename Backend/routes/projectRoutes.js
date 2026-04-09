const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route
router.get('/suggestions', projectsController.getProjectSuggestions);

// Protected routes  
router.use(authMiddleware);

router.get('/my-projects', projectsController.getMyProjects);
router.get('/all-my-projects', projectsController.getAllMyProjects);
router.get('/:id', projectsController.getProjectById);

// CRUD operations 
router.post('/', projectsController.createProject);
router.put('/:id', projectsController.updateProject);
router.delete('/:id', projectsController.deleteProject);

// Enrollment & progress
router.post('/:id/enroll', projectsController.enrollInProject);
router.post('/:id/rate', projectsController.rateProject);
router.put('/:id/milestones/:milestoneId', projectsController.updateMilestone);

module.exports = router;

