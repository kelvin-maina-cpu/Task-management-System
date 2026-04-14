# DevSpace Pro - Enhanced Features Documentation

## Overview

DevSpace Pro is an advanced online code editor with professional-grade features for collaborative development, file persistence, syntax highlighting, version control integration, and extensibility through plugins.

## Features

### 1. **Syntax Highlighting with Monaco Editor**

Monaco Editor (the same editor used in VS Code) provides:
- Full syntax highlighting for 40+ languages
- IntelliSense and code completion
- Bracket matching and color coding
- Line numbers and mini-map
- Multi-cursor support

**Supported Languages:**
- JavaScript, TypeScript, JSX, TSX
- HTML, CSS, SCSS, Less
- Python, Java, C++, C#
- Go, Rust, PHP, Ruby
- SQL, JSON, YAML, XML
- Markdown and more

**Usage:**
```typescript
import Editor from '@monaco-editor/react';

<Editor
  height="100%"
  defaultLanguage="javascript"
  value={code}
  onChange={(value) => setCode(value)}
  theme="vs-dark"
  options={{
    minimap: { enabled: true },
    fontSize: 14,
    wordWrap: 'on',
  }}
/>
```

### 2. **Theme System**

DevSpace Pro supports three built-in themes with easy switching:

#### Light Theme
- Clean white background
- Dark text for readability
- Perfect for daytime use

#### Dark Theme (Default)
- GitHub-inspired dark background (#0d1117)
- Easy on the eyes
- Professional appearance

#### High Contrast Theme
- Maximum contrast for accessibility
- Black background, white foreground
- WCAG AAA compliant

**Switch Themes:**
Click the theme icon in the header (☀️ for light, 🌙 for dark, ⚫ for high contrast)

**Add Custom Themes:**
```typescript
const customTheme = {
  light: {
    background: '#ffffff',
    foreground: '#333333',
    monacoTheme: 'vs',
  },
  // Define other theme properties
};
```

### 3. **Backend File Persistence**

Save and load files directly from MongoDB with automatic synchronization.

**API Endpoints:**

```bash
# Get all files for a project
GET /api/files/projects/:projectId/files

# Get file structure (tree)
GET /api/files/projects/:projectId/file-structure

# Get specific file
GET /api/files/projects/:projectId/files/:filePath

# Save/update file
POST /api/files/projects/:projectId/files
Body: {
  path: "src/index.js",
  name: "index.js",
  content: "...",
  language: "javascript",
  type: "file"
}

# Batch save files
POST /api/files/projects/:projectId/files/batch
Body: { files: [...] }

# Delete file
DELETE /api/files/projects/:projectId/files/:filePath
```

**Usage in Frontend:**

```typescript
import { fileService } from './services/fileService';

// Save a file
await fileService.saveFile(projectId, {
  path: 'src/app.js',
  name: 'app.js',
  content: 'console.log("Hello");',
  language: 'javascript',
  type: 'file'
});

// Load files
const files = await fileService.getProjectFiles(projectId);
```

### 4. **Git Integration**

Integrated Git workflow with commit, push, and pull operations.

**Git Panel Features:**
- View current branch
- See staged and unstaged changes
- Commit with messages
- Push to remote
- Pull from remote
- View git status

**API Endpoints:**

```bash
# Get git status
GET /api/files/projects/:projectId/git/status

# Commit changes
POST /api/files/projects/:projectId/git/commit
Body: {
  message: "Initial commit",
  files: ["src/index.js", "package.json"]
}

# Push changes
POST /api/files/projects/:projectId/git/push
Body: { branch: "main" }

# Pull changes
POST /api/files/projects/:projectId/git/pull
Body: { branch: "main" }
```

**How to Use:**
1. Click the "Git" tab in the bottom panel
2. View your changes (staged/unstaged)
3. Click "Commit" and enter a commit message
4. Click "Push" to push to remote repository
5. Click "Pull" to sync with remote changes

### 5. **Real-Time Collaboration**

WebSocket-based real-time collaboration using Socket.io.

**Features:**
- Multi-user editing in the same file
- Live cursor positions
- Selection highlighting
- Active collaborator list
- Real-time file sync

**Collaboration Service:**

```typescript
import { collaborationService } from './services/collaborationService';

// Connect to collaboration server
await collaborationService.connect(projectId, userId, username);

// Listen for collaborator edits
collaborationService.on('file-edit', (data) => {
  console.log(`${data.username} edited ${data.filePath}`);
});

// Broadcast your edits
collaborationService.broadcastFileEdit(
  'src/app.js',
  newContent,
  startLine,
  endLine,
  changeText
);

// Broadcast cursor position
collaborationService.broadcastCursorPosition('src/app.js', line, column);

// Get active collaborators
const collaborators = await collaborationService.getCollaborators();
```

**Server Setup (Node.js with Express + Socket.io):**

```typescript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  socket.on('join-project', (data) => {
    socket.join(`project-${data.projectId}`);
    io.to(`project-${data.projectId}`).emit('user-joined', {
      userId: data.userId,
      username: data.username,
    });
  });

  socket.on('file-edit', (data) => {
    socket.to(`project-${data.projectId}`).emit('file-edit', data);
  });

  socket.on('cursor-move', (data) => {
    socket.to(`project-${data.projectId}`).emit('cursor-move', data);
  });

  socket.on('disconnect', () => {
    io.to(`project-${socket.data.projectId}`).emit('user-left', {
      userId: socket.data.userId,
    });
  });
});

server.listen(5000);
```

### 6. **Plugin System & Extensions**

Extensible architecture for custom language support and features.

**Plugin Interface:**

```typescript
interface DevSpacePlugin {
  name: string;
  version: string;
  activate: (context: PluginContext) => void;
  deactivate?: () => void;
}

interface PluginContext {
  registerLanguage: (plugin: LanguagePlugin) => void;
  registerTheme: (plugin: ThemePlugin) => void;
  registerStatusBarItem: (item: StatusBarItem) => void;
  registerCommand: (command: string, callback: Function) => void;
  workspace: {
    getCurrentFile: () => string | null;
    getFileContent: () => string;
    setFileContent: (content: string) => void;
  };
  logger: {
    info: (message: string) => void;
    warn: (message: string) => void;
    error: (message: string) => void;
  };
}
```

**Create a Custom Language Plugin:**

```typescript
import { pluginManager, LanguagePlugin } from './services/pluginManager';

const customLanguagePlugin: LanguagePlugin = {
  name: 'Custom Language',
  version: '1.0.0',
  extensions: ['.custom'],
  language: 'custom',
  monacoLanguage: 'custom',
  formatter: (code) => {
    // Custom formatting logic
    return code.trim();
  },
  linter: (code) => {
    // Custom linting logic
    return [];
  },
  snippets: [
    {
      label: 'hello',
      insertText: 'print("Hello, World!")',
      kind: 'snippet',
    },
  ],
};

// Register the plugin
const context = {
  registerLanguage: (plugin) => pluginManager.registerLanguage(plugin),
  // ... other context methods
};

```

**Built-in Plugins:**

- **Python Plugin** - Full Python support with snippets
- **TypeScript Plugin** - TypeScript/TSX with advanced features
- **SQL Plugin** - SQL syntax highlighting and common snippets

**Using Plugins:**

```typescript
import { pluginManager, pythonPlugin } from './services/pluginManager';

// Register a language plugin
pluginManager.registerLanguage(pythonPlugin);

// Get language support
const pythonSupport = pluginManager.getLanguage('python');

// Use linting
const errors = pluginManager.lintCode('python', code);

// Format code
const formatted = pluginManager.formatCode('python', code);

// Get code snippets
const snippets = pluginManager.getSnippets('python');
```

## Usage Guide

### Getting Started

1. **Open the Editor:**
   ```
   Navigate to /workspace/:workspaceType or /projects/:projectId/workspace
   ```

2. **Select a File:**
   - Click files in the explorer on the left
   - Or open recent files

3. **Edit Code:**
   - Start typing in the editor
   - Save with Ctrl+S (or Cmd+S on Mac)
   - Use Monaco Editor shortcuts

4. **Switch Themes:**
   - Click the theme button in the header
   - Cycle between Light, Dark, and High Contrast

5. **Save to Backend:**
   - Click the save button
   - Or use Ctrl+S
   - Automatic sync with MongoDB

6. **Collaborate:**
   - Invite team members via generated link
   - See active collaborators in the header
   - View real-time cursor positions

7. **Version Control:**
   - Click the Git tab in the bottom panel
   - Stage and commit changes
   - Push/pull with remote repository

## Configuration

### DevSpace Component Props

```typescript
interface DevSpaceProps {
  initialFileTree?: FileItem;           // Initial file structure
  projectId?: string;                    // MongoDB project ID
  readOnly?: boolean;                    // Read-only mode
  onCodeChange?: (path: string, content: string) => void;  // Change callback
  onFullscreenChange?: (isFullscreen: boolean) => void;    // Fullscreen callback
}
```

### Monaco Editor Options

```typescript
{
  minimap: { enabled: true },
  fontSize: 14,
  fontFamily: '"Fira Code", "Monaco", monospace',
  readOnly: false,
  scrollBeyondLastLine: false,
  tabSize: 2,
  wordWrap: 'on',
  autoClosingBrackets: 'always',
  autoClosingQuotes: 'always',
  formatOnPaste: true,
  formatOnType: true,
}
```

## Performance Optimization

1. **File Caching** - Files are cached in memory
2. **Lazy Loading** - Files loaded on demand
3. **Batch Operations** - Use batch save for multiple files
4. **Debounced Save** - Automatic save with 2s debounce

## Security

- All file operations require authentication
- Backend validates user access to projects
- WebSocket connections use secure rooms
- XSS protection with Monaco Editor sandboxing

## Troubleshooting

### Files Not Saving
- Check network connectivity
- Verify backend is running
- Check browser console for errors

### Collaboration Not Working
- Ensure Socket.io is configured
- Check firewall settings
- Verify CORS configuration

### Theme Not Switching
- Clear browser cache
- Check local storage
- Verify Monaco theme names

## Future Enhancements

- [ ] Diff viewer
- [ ] Code review comments
- [ ] AI-powered code completion
- [ ] Real-time linting with ESLint
- [ ] Docker environment support
- [ ] Cloud project backup
- [ ] Team workspace management

## Support

For issues or feature requests, please contact support or create an issue in the repository.
