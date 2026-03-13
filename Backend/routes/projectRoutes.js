const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const projectcontroller = require('../controllers/projectcontroller');  // ✅ For unified CRUD
const { authenticate } = require('../middleware/auth');

// Public route
router.get('/suggestions', projectsController.getProjectSuggestions);

// Protected routes
router.use(authenticate);

router.get('/my-projects', projectsController.getMyProjects);
router.get('/all-my-projects', projectcontroller.getAllMyProjects);  // ✅ New unified endpoint
router.get('/:id', projectsController.getProjectById);

// CRUD operations (unified controller)
router.post('/', projectcontroller.createProject);
router.put('/:id', projectcontroller.updateProject);
router.delete('/:id', projectcontroller.deleteProject);

// Enrollment & progress
router.post('/:id/enroll', projectsController.enrollInProject);
router.post('/:id/rate', projectsController.rateProject);
router.put('/:id/milestones/:milestoneId', projectsController.updateMilestone);

module.exports = router;

