const ProjectFile = require('../models/ProjectFile');
const Project = require('../models/Project');
const path = require('path');
const { spawn } = require('child_process');

const WORKSPACE_ROOT = path.resolve(__dirname, '..', '..');

function resolveWorkspaceDir(relativeCwd = '.') {
  const targetPath = path.resolve(WORKSPACE_ROOT, relativeCwd);
  const normalizedRoot = `${WORKSPACE_ROOT}${path.sep}`;
  const normalizedTarget = `${targetPath}${path.sep}`;

  if (targetPath !== WORKSPACE_ROOT && !normalizedTarget.startsWith(normalizedRoot)) {
    throw new Error('Requested terminal path is outside the allowed workspace');
  }

  return targetPath;
}

function createShellSpec(commandLine) {
  if (process.platform === 'win32') {
    return {
      shell: 'powershell',
      file: 'powershell.exe',
      args: ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', commandLine],
    };
  }

  return {
    shell: 'sh',
    file: '/bin/sh',
    args: ['-lc', commandLine],
  };
}

// Get all files for a project
exports.getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const files = await ProjectFile.find({
      projectId,
      userId,
    }).sort({ path: 1 });

    res.json({ files });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a specific file
exports.getFile = async (req, res) => {
  try {
    const { projectId, filePath } = req.params;
    const userId = req.user.id;

    const file = await ProjectFile.findOne({
      projectId,
      userId,
      path: filePath,
    });

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ file });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create or update a file
exports.saveFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { path, name, content, language, type = 'file' } = req.body;
    const userId = req.user.id;

    if (!path || !name) {
      return res.status(400).json({ error: 'Path and name are required' });
    }

    const file = await ProjectFile.findOneAndUpdate(
      { projectId, userId, path },
      {
        projectId,
        userId,
        path,
        name,
        content,
        language,
        type,
        isModified: true,
        parentPath: path.substring(0, path.lastIndexOf('/')),
      },
      { upsert: true, new: true }
    );

    res.json({ file, message: 'File saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a file
exports.deleteFile = async (req, res) => {
  try {
    const { projectId, filePath } = req.params;
    const userId = req.user.id;

    const result = await ProjectFile.findOneAndDelete({
      projectId,
      userId,
      path: filePath,
    });

    if (!result) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get file structure for editor initialization
exports.getFileStructure = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const files = await ProjectFile.find({
      projectId,
      userId,
    }).sort({ type: -1, path: 1 });

    // Build tree structure
    const buildTree = (items) => {
      const root = { name: project.title, type: 'folder', children: [] };
      const pathMap = new Map();
      pathMap.set('', root);

      items.forEach((item) => {
        const parent = pathMap.get(item.parentPath || '') || root;
        const node = {
          name: item.name,
          type: item.type,
          ...(item.type === 'file' && { content: item.content }),
        };
        pathMap.set(item.path, node);
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      });

      return root;
    };

    const structure = buildTree(files);
    res.json({ structure });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Batch save files
exports.batchSaveFiles = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { files } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(files)) {
      return res.status(400).json({ error: 'Files must be an array' });
    }

    const savedFiles = [];

    for (const file of files) {
      const { path, name, content, language, type = 'file' } = file;

      const savedFile = await ProjectFile.findOneAndUpdate(
        { projectId, userId, path },
        {
          projectId,
          userId,
          path,
          name,
          content,
          language,
          type,
          isModified: true,
          parentPath: path.substring(0, path.lastIndexOf('/')),
        },
        { upsert: true, new: true }
      );

      savedFiles.push(savedFile);
    }

    res.json({ files: savedFiles, message: 'Files saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Execute a workspace terminal command
exports.executeTerminalCommand = async (req, res) => {
  try {
    const { commandLine, cwd = '.' } = req.body;

    if (!commandLine || typeof commandLine !== 'string') {
      return res.status(400).json({ error: 'commandLine is required' });
    }
    const workspaceDir = resolveWorkspaceDir(cwd);
    const trimmedCommand = commandLine.trim();
    if (!trimmedCommand) {
      return res.status(400).json({ error: 'No command provided' });
    }
    const commandSpec = createShellSpec(trimmedCommand);

    const child = spawn(commandSpec.file, commandSpec.args, {
      cwd: workspaceDir,
      shell: false,
      windowsHide: true,
      env: process.env,
    });

    let stdout = '';
    let stderr = '';
    let finished = false;
    const outputLimit = 1024 * 64;

    const timeout = setTimeout(() => {
      if (!finished) {
        child.kill();
      }
    }, 30000);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > outputLimit) {
        stdout = `${stdout.slice(0, outputLimit)}\n...[truncated]`;
      }
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > outputLimit) {
        stderr = `${stderr.slice(0, outputLimit)}\n...[truncated]`;
      }
    });

    child.on('error', (error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      res.status(500).json({ error: error.message });
    });

    child.on('close', (code, signal) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);

      res.json({
        command: commandLine,
        cwd: path.relative(WORKSPACE_ROOT, workspaceDir) || '.',
        shell: commandSpec.shell,
        exitCode: code ?? 1,
        signal: signal || null,
        stdout,
        stderr,
      });
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
