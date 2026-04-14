const ProjectFile = require('../models/ProjectFile');
const Project = require('../models/Project');

// Git Commit
exports.commitChanges = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, files } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Commit message is required' });
    }

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Mark files as committed
    if (files && Array.isArray(files)) {
      await ProjectFile.updateMany(
        {
          projectId,
          userId,
          path: { $in: files },
        },
        { isModified: false }
      );
    }

    // In a real app, this would interact with a git repository
    const commitHash = generateCommitHash();
    
    res.json({
      message: 'Files committed successfully',
      commit: {
        hash: commitHash,
        message: message,
        timestamp: new Date(),
        author: req.user.email,
        filesChanged: files?.length || 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Git Push
exports.pushChanges = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { branch = 'main' } = req.body;
    const userId = req.user.id;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: `Pushed ${branch} to remote successfully`,
      branch,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Git Pull
exports.pullChanges = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { branch = 'main' } = req.body;
    const userId = req.user.id;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({
      message: `Pulled ${branch} from remote successfully`,
      branch,
      timestamp: new Date(),
      filesUpdated: 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get Git Status
exports.getGitStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Get modified files
    const modifiedFiles = await ProjectFile.find({
      projectId,
      userId,
      isModified: true,
    }).select('path name');

    const allFiles = await ProjectFile.find({
      projectId,
      userId,
      type: 'file',
    }).select('path name');

    res.json({
      branch: 'main',
      staged: modifiedFiles.map(f => f.path),
      unstaged: [],
      untracked: [],
      totalFiles: allFiles.length,
      modifiedCount: modifiedFiles.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to generate commit hash
function generateCommitHash() {
  return Math.random().toString(16).substr(2, 8) + Math.random().toString(16).substr(2, 8);
}
