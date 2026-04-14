# DevSpace - Online Code Editor for Developers

## Overview

DevSpace is a comprehensive online IDE integrated into the Task Management System that provides dedicated learning and development environments for both beginner and advanced developers.

## Components

### 1. **DevSpace Core Component** (`src/components/devspace/DevSpace.tsx`)

The main editor component that provides a VS Code-like interface with:

#### Features:

- **File Explorer**: Hierarchical file tree with folder expansion/collapse
- **Multi-Tab Editor**: Open multiple files simultaneously with tab management
- **Code Editor**: Syntax-aware textarea with:
  - Line numbers
  - Auto-indentation with Tab key
  - Cursor position tracking (Line, Column)
  - Ctrl+S save functionality
  - Read-only mode support
- **Console Panel**: Real-time logging with different severity levels:
  - `info` (blue) - General information
  - `success` (green) - Successful operations
  - `warn` (yellow) - Warnings
  - `error` (red) - Error messages

- **Additional Panels**:
  - Problems: Error and warning tracking
  - Output: Build and runtime output
  - Terminal: Simulated command-line interface

- **Status Bar**: Displays branch, cursor position, file encoding, and language mode

#### Props:

```typescript
interface DevSpaceProps {
  initialFileTree?: FileItem; // Custom file structure
  readOnly?: boolean; // Lock editor
  onCodeChange?: (filePath, content) => void; // Code change callback
}
```

---

## Workspaces

### 2. **Beginner Workspace** (`src/features/workspace/BeginnerWorkspace.tsx`)

A structured learning environment for beginners with 3 progressive lessons.

#### Lessons:

1. **HTML Basics**
   - Learn page structure
   - Semantic HTML
   - Forms and elements

2. **CSS Styling**
   - Layout and positioning
   - Box model
   - Responsive design

3. **JavaScript Basics**
   - Variables and functions
   - DOM manipulation
   - Event handling

#### Features:

- Sidebar with lesson cards showing:
  - Title and description
  - Difficulty level badge
  - Completion status checkmark
- Progress bar tracking lessons completed
- Pre-configured file structure for each lesson
- Responsive layout (collapses to mobile-friendly view)

---

### 3. **Senior Workspace** (`src/features/workspace/SeniorWorkspace.tsx`)

An advanced development environment for experienced developers.

#### Projects:

1. **React Component Library** (Advanced)
   - TypeScript setup
   - Component design patterns
   - Storybook integration
   - Testing strategies

2. **RESTful API Server** (Advanced)
   - Express.js backend
   - MongoDB integration
   - Authentication flows
   - Error handling

3. **CI/CD & DevOps Pipeline** (Expert)
   - Docker containerization
   - GitHub Actions workflows
   - Database configuration
   - Deployment strategies

#### Features:

- Sidebar with challenge cards showing:
  - Project title and detailed description
  - Difficulty badges (color-coded):
    - Intermediate (yellow)
    - Advanced (red)
    - Expert (purple)
  - Estimated completion time
  - Required skills/technologies
  - Completion status
- Statistics dashboard:
  - Projects completed count
  - Total challenges count
- Interactive challenge selection

---

## Routes

### Protected Routes (Require Authentication)

```
/beginner-workspace           → BeginnerWorkspace component
/senior-workspace             → SeniorWorkspace component

OR within MainLayout:
/workspace/beginner           → BeginnerWorkspace component
/workspace/senior             → SeniorWorkspace component
```

### Navigation

Access workspaces from:

1. **Dashboard Navigation Sidebar** - Two new nav items with descriptions
2. **Direct URL navigation** - `/beginner-workspace` or `/senior-workspace`
3. **MainLayout routes** - `/workspace/beginner` or `/workspace/senior`

---

## Styling

### Color Scheme

- **Primary Background**: `#0d1117` (Dark gray)
- **Secondary Background**: `#161b22` (Slightly lighter)
- **Accent Blue**: `#58a6ff` (GitHub blue)
- **Accent Green**: `#238636` (Success green)
- **Text Primary**: `#c9d1d9` (Light gray)
- **Text Secondary**: `#8b949e` (Muted gray)

### CSS Files

- `DevSpace.css` - Editor styling (260 lines, comprehensive theme)
- `BeginnerWorkspace.css` - Beginner UI styling
- `SeniorWorkspace.css` - Senior UI styling

---

## Integration & Callbacks

### Code Change Integration

Both workspaces support real-time code change callbacks:

```typescript
const handleCodeChange = (filePath: string, content: string) => {
  // Save to database
  // Track user progress
  // Validate code
};

<DevSpace onCodeChange={handleCodeChange} />
```

### Progress Tracking

- **Beginner**: Tracks completed lessons
- **Senior**: Tracks completed projects and challenges

---

## Getting Started

### For Users

1. Log in to the system
2. Navigate to Dashboard
3. Click "Beginner Workspace" or "Advanced Workspace" in sidebar
4. Select a lesson/project from the sidebar
5. Write, edit, and save code in the editor
6. View console output and logs in bottom panel

### For Developers

```tsx
// Import components
import { DevSpace } from "@/components/devspace/DevSpace";
import { BeginnerWorkspace } from "@/features/workspace/BeginnerWorkspace";
import { SeniorWorkspace } from "@/features/workspace/SeniorWorkspace";

// Use in your routes
export const router = createBrowserRouter([
  {
    path: "/my-workspace",
    element: <DevSpace initialFileTree={myFiles} onCodeChange={handler} />,
  },
]);
```

---

## File Structure

```
Frontend/
├── src/
│   ├── components/
│   │   └── devspace/
│   │       ├── DevSpace.tsx
│   │       └── DevSpace.css
│   ├── features/
│   │   └── workspace/
│   │       ├── BeginnerWorkspace.tsx
│   │       ├── BeginnerWorkspace.css
│   │       ├── SeniorWorkspace.tsx
│   │       └── SeniorWorkspace.css
│   └── app/
│       └── router.tsx (updated with workspace routes)
```

---

## Browser Support

- Modern browsers with ES6+ support
- Works best on desktop (1024px+ width)
- Responsive design handles tablets and mobile views

---

## Future Enhancements

1. **Code Execution**
   - JavaScript sandbox execution
   - Live preview pane
   - Linting and error detection

2. **Collaboration**
   - Real-time collaborative editing (WebSocket)
   - Multiple user cursors
   - Comment and code review features

3. **Extension System**
   - Custom theme support
   - Plugin architecture
   - Custom panel components

4. **Backend Integration**
   - Save code to database
   - Version control/git history
   - Deployment integration
   - User progress analytics

---

## Support & Troubleshooting

### Common Issues

**Editor not showing code:**

- Ensure `initialFileTree` is properly configured
- Check that files have `type: 'file'` and `content` property

**Tab changes not working:**

- File paths must be unique
- Use consistent path separators (/)

**Callbacks not triggering:**

- Ensure `onCodeChange` is properly passed to DevSpace
- Check browser console for errors

---

For more information, refer to individual component documentation or the feature guides.
