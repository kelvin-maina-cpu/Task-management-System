# DevSpace Pro Integration Guide

## Quick Start

### 1. Import the Enhanced DevSpace Component

```typescript
import { DevSpace } from '@/components/devspace/DevSpaceEnhanced';
```

### 2. Use in Your Workspace Component

```typescript
import React, { useState } from 'react';
import { DevSpace } from '@/components/devspace/DevSpaceEnhanced';
import { useParams } from 'react-router-dom';

export const ProjectWorkspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const initialFileTree = {
    name: 'project',
    type: 'folder' as const,
    children: [
      {
        name: 'src',
        type: 'folder' as const,
        children: [
          {
            name: 'main.js',
            type: 'file' as const,
            content: 'console.log("Hello")',
            language: 'javascript',
          },
        ],
      },
    ],
  };

  return (
    <div style={{ height: '100vh' }}>
      <DevSpace
        initialFileTree={initialFileTree}
        projectId={projectId}
        onFullscreenChange={setIsFullscreen}
        onCodeChange={(filePath, content) => {
          console.log(`File changed: ${filePath}`);
        }}
      />
    </div>
  );
};
```

### 3. Backend Setup

Ensure your backend has the following:

1. **File Model** - Already created at `Backend/models/ProjectFile.js`
2. **File Controller** - Already created at `Backend/controllers/fileController.js`
3. **Git Controller** - Already created at `Backend/controllers/gitController.js`
4. **File Routes** - Already created at `Backend/routes/fileRoutes.js`
5. **Server Integration** - Already added to `Backend/server.js`

### 4. WebSocket Setup (Optional - for Collaboration)

Update your backend server to include Socket.io:

```bash
npm install socket.io
```

In your `server.js`:

```javascript
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production'
      ? ['https://yourdomain.com']
      : true,
  },
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-project', (data) => {
    socket.join(`project-${data.projectId}`);
    socket.data.projectId = data.projectId;
    socket.data.userId = data.userId;
    socket.data.username = data.username;

    io.to(`project-${data.projectId}`).emit('user-joined', {
      userId: data.userId,
      username: data.username,
      totalCollaborators: io.sockets.adapter.rooms.get(`project-${data.projectId}`)?.size || 1,
    });
  });

  socket.on('file-edit', (data) => {
    socket.to(`project-${data.projectId}`).emit('file-edit', data);
  });

  socket.on('cursor-move', (data) => {
    socket.to(`project-${data.projectId}`).emit('cursor-move', data);
  });

  socket.on('selection-change', (data) => {
    socket.to(`project-${data.projectId}`).emit('selection-change', data);
  });

  socket.on('get-collaborators', (_, callback) => {
    const room = io.sockets.adapter.rooms.get(`project-${socket.data.projectId}`);
    const collaborators = [];
    
    if (room) {
      room.forEach((socketId) => {
        const collaborator = io.sockets.sockets.get(socketId);
        if (collaborator?.data) {
          collaborators.push({
            id: collaborator.data.userId,
            username: collaborator.data.username,
          });
        }
      });
    }
    
    callback(collaborators);
  });

  socket.on('disconnect', () => {
    const room = `project-${socket.data.projectId}`;
    io.to(room).emit('user-left', {
      userId: socket.data.userId,
      username: socket.data.username,
    });
  });
});

server.listen(5000);
```

### 5. Use Services in Components

**File Service:**

```typescript
import { fileService } from '@/services/fileService';

// Load files from backend
const files = await fileService.getProjectFiles(projectId);

// Save a file
await fileService.saveFile(projectId, {
  path: 'src/index.js',
  name: 'index.js',
  content: 'console.log("Hello");',
  language: 'javascript',
  type: 'file',
});
```

**Collaboration Service:**

```typescript
import { collaborationService } from '@/services/collaborationService';

// Connect for collaboration
await collaborationService.connect(projectId, userId, username);

// Listen for changes
collaborationService.on('file-edit', (data) => {
  console.log(`${data.username} changed ${data.filePath}`);
});

// Broadcast your changes
collaborationService.broadcastFileEdit(
  'src/app.js',
  newCode,
  startLine,
  endLine,
  change
);

// Disconnect when leaving
collaborationService.disconnect();
```

**Plugin Manager:**

```typescript
import { pluginManager, pythonPlugin } from '@/services/pluginManager';

// Register a language
pluginManager.registerLanguage(pythonPlugin);

// Use language features
const formatted = pluginManager.formatCode('python', code);
const errors = pluginManager.lintCode('python', code);
const snippets = pluginManager.getSnippets('python');
```

## API Reference

### File Service

```typescript
// Get all files
getProjectFiles(projectId: string): Promise<any[]>

// Get files tree
getFileStructure(projectId: string): Promise<any>

// Get specific file
getFile(projectId: string, filePath: string): Promise<any>

// Save file
saveFile(projectId: string, fileData: FileData): Promise<any>

// Batch save
batchSaveFiles(projectId: string, files: FileData[]): Promise<any[]>

// Delete file
deleteFile(projectId: string, filePath: string): Promise<void>

// Get git status
getGitStatus(projectId: string): Promise<any>

// Commit
commitChanges(projectId: string, message: string, files?: string[]): Promise<any>

// Push
pushChanges(projectId: string, branch?: string): Promise<any>

// Pull
pullChanges(projectId: string, branch?: string): Promise<any>
```

### Collaboration Service

```typescript
// Connect
connect(projectId: string, userId: string, username: string): Promise<void>

// Broadcast edits
broadcastFileEdit(filePath: string, content: string, startLine: number, endLine: number, change: string): void

// Broadcast cursor
broadcastCursorPosition(filePath: string, line: number, column: number): void

// Broadcast selection
broadcastSelection(filePath: string, startLine: number, endLine: number, startColumn: number, endColumn: number): void

// Get collaborators
getCollaborators(): Promise<any[]>

// Listen
on(event: string, callback: Function): void

// Stop listening
off(event: string, callback: Function): void

// Disconnect
disconnect(): void

// Check connection
isConnected(): boolean
```

### Plugin Manager

```typescript
// Load plugin
loadPlugin(plugin: DevSpacePlugin, context: PluginContext): Promise<void>

// Unload plugin
unloadPlugin(pluginName: string): void

// Register language
registerLanguage(plugin: LanguagePlugin): void

// Register theme
registerTheme(plugin: ThemePlugin): void

// Create context for plugins
createPluginContext(...): PluginContext

// Get language
getLanguage(language: string): LanguagePlugin | undefined

// Get all languages
getLanguages(): LanguagePlugin[]

// Get theme
getTheme(name: string): ThemePlugin | undefined

// Get all themes
getThemes(): ThemePlugin[]

// Lint code
lintCode(language: string, code: string): LintError[]

// Format code
formatCode(language: string, code: string): string

// Get snippets
getSnippets(language: string): CodeSnippet[]
```

## Database Schema

### ProjectFile Model

```javascript
{
  _id: ObjectId,
  projectId: ObjectId (ref: Project),
  userId: ObjectId (ref: User),
  path: String (unique per project/user),
  name: String,
  content: String,
  type: 'file' | 'folder',
  language: String,
  parentPath: String,
  isModified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+S | Save file |
| Ctrl+/ | Toggle comment |
| Ctrl+H | Replace |
| Ctrl+F | Find |
| Alt+Shift+F | Format code |
| Ctrl+Space | Trigger autocomplete |
| Tab | Indent |
| Shift+Tab | Dedent |
| Ctrl+Up | Go to definition |
| Ctrl+Alt+Up | Multi-cursor |

## Styling & Customization

### CSS Variables

```css
--bg-primary: #0d1117;      /* Main background */
--bg-secondary: #161b22;    /* Sidebar background */
--bg-tertiary: #21262d;     /* Hover background */
--text-primary: #c9d1d9;    /* Main text */
--text-secondary: #8b949e;  /* Secondary text */
--accent-blue: #58a6ff;     /* Accent color */
--accent-green: #238636;    /* Success color */
--accent-red: #f85149;      /* Error color */
--accent-yellow: #d29922;   /* Warning color */
```

### Custom Theme

```typescript
const customTheme: Theme = {
  light: {
    background: '#ffffff',
    foreground: '#333333',
    monacoTheme: 'vs',
    className: 'custom-light',
  },
};

// Apply custom theme
setTheme('custom');
```

## Testing

### Unit Tests

```typescript
import { fileService } from '@/services/fileService';
import { collaborationService } from '@/services/collaborationService';
import { pluginManager } from '@/services/pluginManager';

describe('FileService', () => {
  it('should save files', async () => {
    const result = await fileService.saveFile('projectId', {
      path: 'test.js',
      name: 'test.js',
      content: 'console.log("test");',
      language: 'javascript',
      type: 'file',
    });
    expect(result).toBeDefined();
  });
});
```

## Performance Tips

1. **Enable minimap only for large files**
   ```typescript
   minimap: { enabled: fileSize > 1000 }
   ```

2. **Use batch save for multiple files**
   ```typescript
   await fileService.batchSaveFiles(projectId, files);
   ```

3. **Debounce file changes**
   ```typescript
   const debounce = (fn, delay) => {
     let timeoutId;
     return (...args) => {
       clearTimeout(timeoutId);
       timeoutId = setTimeout(() => fn(...args), delay);
     };
   };
   ```

4. **Disconnect collaboration when not needed**
   ```typescript
   useEffect(() => {
     return () => collaborationService.disconnect();
   }, []);
   ```

## Troubleshooting

### Issue: Files not persisting
**Solution:** Ensure backend routes are registered and MongoDB is connected

### Issue: Collaboration not working
**Solution:** Check Socket.io configuration and CORS settings

### Issue: Monaco Editor not rendering
**Solution:** Ensure `@monaco-editor/react` is installed and editor container has height

### Issue: Theme not switching
**Solution:** Clear browser cache and verify Monaco theme names

## Support & Documentation

- Monaco Editor: https://microsoft.github.io/monaco-editor/
- Socket.io: https://socket.io/docs/
- React Hooks: https://react.dev/reference/react
- HTTP Status Codes: https://httpwg.org/specs/rfc7231.html

## Version History

- **1.0.0** - Initial release with Monaco Editor, themes, file persistence, git integration, collaboration, and plugins
