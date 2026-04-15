const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');
const gitController = require('../controllers/gitController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// ===== FILE OPERATIONS =====
// Get all files for a project
router.get('/projects/:projectId/files', fileController.getProjectFiles);

// Get file structure (tree)
router.get('/projects/:projectId/file-structure', fileController.getFileStructure);

// Get specific file
router.get('/projects/:projectId/files/:filePath', fileController.getFile);

// Save/update file
router.post('/projects/:projectId/files', fileController.saveFile);

// Batch save files
router.post('/projects/:projectId/files/batch', fileController.batchSaveFiles);

// Delete file
router.delete('/projects/:projectId/files/:filePath', fileController.deleteFile);

// Workspace terminal
router.post('/workspace/terminal/execute', fileController.executeTerminalCommand);

// ===== GIT OPERATIONS =====
// Get git status
router.get('/projects/:projectId/git/status', gitController.getGitStatus);

// Commit changes
router.post('/projects/:projectId/git/commit', gitController.commitChanges);

// Push changes
router.post('/projects/:projectId/git/push', gitController.pushChanges);

// Pull changes
router.post('/projects/:projectId/git/pull', gitController.pullChanges);

module.exports = router;
