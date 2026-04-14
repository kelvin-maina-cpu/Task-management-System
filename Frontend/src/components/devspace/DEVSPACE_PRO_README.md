# DevSpace Pro IDE - Full-Featured Code Editor

A professional-grade IDE component built for React with Monaco Editor integration, real-time error detection, multiple file management, and integrated terminal/console.

## Features

### 🎯 Core Features

1. **Monaco Editor Integration**
   - Full syntax highlighting for 15+ languages
   - IntelliSense and code autocomplete
   - Code folding and minimap
   - Bracket pair colorization
   - Format on paste/type
   - Line numbers and gutter markers

2. **Advanced File Management**
   - Hierarchical file tree with expand/collapse
   - Multi-tab editing with unsaved indicator (●)
   - Quick file switching
   - File type icons matching VS Code
   - Persistent file state in localStorage

3. **Real-Time Error Detection**
   - JavaScript syntax validation
   - Undefined variable detection
   - Error highlighting with Monaco markers
   - Problems panel with click-to-navigate
   - Error count in status bar

4. **Console & Output Panels**
   - Console output with timestamped entries
   - Multiple severity levels (info, warn, error, success)
   - Syntax-highlighted code output
   - Persistent output history
   - Separate terminal panel

5. **Code Execution**
   - Run JavaScript files directly in browser
   - Console integration for logs
   - Error handling with stack traces
   - Multiple language support ready (JS, Python, HTML)

## Usage

### Import and Use

```tsx
import { DevSpaceProIDE } from "@/components/devspace/DevSpaceProIDE";

export function MyPage() {
  return <DevSpaceProIDE />;
}
```

### Keyboard Shortcuts

| Shortcut           | Action                            |
| ------------------ | --------------------------------- |
| `Ctrl+S` / `Cmd+S` | Save current file ✅              |
| `Ctrl+N` / `Cmd+N` | New file (requires folder open)   |
| `Ctrl+Shift+N`     | New folder (requires folder open) |
| `Ctrl+`` / `Cmd+`` | Toggle terminal (coming soon)     |
| `Ctrl+P` / `Cmd+P` | Command palette (coming soon)     |
| `F5`               | Run code                          |
| `Ctrl+/` / `Cmd+/` | Toggle comment                    |
| `Alt+Click`        | Multi-cursor                      |
| `Ctrl+L`           | Select line                       |

### File Navigation

- **Click folder**: Toggle expand/collapse
- **Double-click file**: Open in new tab
- **Click tab**: Switch between open files
- **Tab close button**: Close file

### Running Code

1. Open a JavaScript file
2. Click the ▶ Run button or press F5
3. Output appears in Console panel
4. Errors show in Problems panel

## Default Project Structure

```
src/
├── index.js       - Main entry point
├── app.js        - App module
└── styles.css    - Styles
public/
└── index.html    - HTML template
package.json      - Project metadata
README.md         - Project documentation
```

## File Language Support

Automatic language detection by file extension:

- **JavaScript**: `.js`, `.jsx`
- **TypeScript**: `.ts`, `.tsx`
- **HTML**: `.html`
- **CSS**: `.css`, `.scss`, `.sass`
- **JSON**: `.json`
- **Markdown**: `.md`
- **Python**: `.py`
- **Java**: `.java`
- **C/C++**: `.cpp`, `.c`, `.h`
- **Other**: `.go`, `.rs`, `.rb`, `.php`, `.sql`, `.sh`, `.yml`, `.yaml`

## Components

### File Tree

- Hierarchical navigation
- Folder expand/collapse
- Active file highlighting
- File type icons

### Editor

- Monaco editor instance
- Minimap preview
- Line numbers
- Error markers

### Tabs

- Multi-tab support
- Modified indicator (●)
- Error color coding
- Close button

### Bottom Panel

- **Console**: Application output
- **Terminal**: Command-line interface
- **Problems**: Error and warning list

### Status Bar

- Cursor position (Ln, Col)
- File encoding
- Language mode
- Notification bell

## Error Detection

### JavaScript Validation

- Syntax errors detected via `Function()` constructor
- Undefined variable detection
- Real-time validation on content change
- Monaco markers for inline errors

### Severity Levels

- **Error** (❌): Critical issues preventing execution
- **Warning** (⚠️): Potential issues or style problems

## Console API

Usage in code:

```javascript
console.log("Info message");
console.error("Error message");
console.warn("Warning message");
// success is custom for this IDE
```

## State Management

The component manages:

- Open files and tabs
- File tree structure
- Problems/diagnostics
- Console entries
- Editor content and position
- Expanded folders
- Current panel view

## LocalStorage

Automatically saves to localStorage:

- File contents (devspace_files)
- Open tabs (devspace_open_tabs)
- User preferences

## Performance Considerations

- Monaco editor loads asynchronously
- File tree renders efficiently with React keys
- Console output limits for performance
- Lazy panel rendering (content)

## Limitations

- Terminal is read-only (display only)
- File system is in-memory (no real filesystem)
- Python execution not yet implemented
- Some features (command palette, extensions) coming soon

## Future Enhancements

- [ ] Full terminal with xterm.js
- [ ] Extension system with plugin API
- [ ] Git integration (status, diff)
- [ ] Multi-workspace support
- [ ] Theme customization
- [ ] Debugger integration
- [ ] Real filesystem access
- [ ] Network requests support
- [ ] Database connection support
- [ ] Collaborative editing

## Troubleshooting

**Monaco not loading?**

- Check internet connection for CDN
- Allow third-party scripts
- Check browser console for errors

**Code not running?**

- Ensure file is JavaScript (.js)
- Check for syntax errors in Problems panel
- Review console output for error messages

**File changes not saved?**

- Files auto-save to localStorage
- Use Ctrl+S to manually save
- Check browser storage quota

## API Reference

### Component Props

Currently no props - uses internal state management

### Methods (via ref)

Would need to expose via useImperativeHandle for:

- `setFile(path: string, content: string)`
- `openFile(path: string)`
- `runCode()`
- `saveFile()`

## Contributing

To extend this component:

1. Add new validators in `validateContent()`
2. Register new file types in `getFileIcon()`
3. Add console formatters in `addConsoleEntry()`
4. Extend Monaco configuration

---

**Version**: 1.0.0  
**Last Updated**: April 2026
