# DevSpace Pro IDE - Quick Start Guide

## Installation

The DevSpaceProIDE component is already integrated into your project. No additional installation needed!

## Basic Usage

### Simple Import

```tsx
import { DevSpaceProIDE } from "@/components/devspace";

export default function CodeEditor() {
  return <DevSpaceProIDE />;
}
```

### In a Route

```tsx
// In your router configuration
import { DevSpaceProIDE } from "@/components/devspace";

const routes = [
  {
    path: "/ide",
    element: <DevSpaceProIDE />,
  },
];
```

### With Page Layout

```tsx
import { DevSpaceProIDE } from "@/components/devspace";

export default function IDEPage() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <DevSpaceProIDE />
    </div>
  );
}
```

## Features At A Glance

### 📁 File Explorer

- Left sidebar shows your project structure
- Click folders to expand/collapse
- Click files to open them in editor
- Visual file type icons

### 📝 Monaco Editor

- Professional code editor with syntax highlighting
- IntelliSense autocomplete
- Bracket matching and pair colorization
- Minimap visible on right side

### 🔴 Real-Time Error Detection

- Red underlines show syntax errors
- Problems panel lists all issues
- Click error to jump to line
- Status bar shows error count

### ⚙️ Bottom Panels

- **Console**: Application output when you run code
- **Terminal**: Display-only terminal emulator
- **Problems**: Lists all detected errors and warnings

### ▶️ Code Execution

- Click Run button or press F5
- JavaScript code executes in browser sandbox
- `console.log()` output appears in Console panel
- Errors caught and displayed

### 💾 Auto Save

- Files auto-save to browser's localStorage
- Use Ctrl+S to manually save
- Modified indicator (●) shows unsaved changes
- Tabs persist between page reloads

## Supported Languages

| Language   | Extension | Status                 |
| ---------- | --------- | ---------------------- |
| JavaScript | .js       | ✅ Full support        |
| TypeScript | .ts, .tsx | ✅ Syntax highlighting |
| HTML       | .html     | ✅ Syntax highlighting |
| CSS        | .css      | ✅ Syntax highlighting |
| Python     | .py       | ⏳ Coming soon         |
| JSON       | .json     | ✅ Syntax highlighting |
| Markdown   | .md       | ✅ Syntax highlighting |
| Java       | .java     | ✅ Syntax highlighting |
| Other      | Various   | ✅ Basic support       |

## Running Your First Code

1. **Open index.js** from the file tree
2. **Edit the code** - try changing the console.log message
3. **Click ▶ Run** button or press F5
4. **See output** in the Console panel below
5. **Check errors** - try adding invalid code like `let x = undefined.foo`
6. **Errors appear** in the Problems panel automatically

## Keyboard Shortcuts

| Windows/Linux | Mac       | Action       |
| ------------- | --------- | ------------ |
| Ctrl+S        | Cmd+S     | Save file    |
| Ctrl+/        | Cmd+/     | Comment line |
| Ctrl+Z        | Cmd+Z     | Undo         |
| Ctrl+Y        | Cmd+Y     | Redo         |
| Alt+Click     | Opt+Click | Multi-cursor |
| Ctrl+L        | Cmd+L     | Select line  |
| F5            | F5        | Run code     |

## Example Code

Default index.js file:

```javascript
// Welcome to DevSpace Pro IDE
console.log("Hello World!");

function greet(name) {
  return "Hello, " + name;
}

console.log(greet("Developer"));
```

Try modifying it:

```javascript
// Add more functions
function add(a, b) {
  return a + b;
}

console.log("2 + 3 =", add(2, 3));

// Working with objects
const user = {
  name: "John",
  age: 30,
  greet: function () {
    return `Hello, I'm ${this.name}`;
  },
};

console.log(user.greet());
```

## Monitoring Errors

Errors are automatically detected and shown:

**Syntax Error:**

```javascript
const x = {
  name: "test"
  age: 25  // Missing comma - shows as error
}
```

**Undefined Variable:**

```javascript
console.log(myVar); // undefined variable shows as error
```

**Fix them:**

```javascript
const x = {
  name: "test",
  age: 25, // Fixed - comma added
};

const myVar = "exists";
console.log(myVar); // Fixed - variable defined
```

## Console Output

When you run code, output appears with formatting:

```
[Time] INFO Message
[Time] SUCCESS Message
[Time] ERROR Message
[Time] WARN Message
```

Example in code:

```javascript
console.log("Info"); // (i) INFO
console.error("Error"); // (!) ERROR
console.warn("Warning"); // (!) WARN
```

## File Management

### Creating Files

- Click 📄 icon in Explorer header
- Enter filename with extension
- New blank file opens

### Creating Folders

- Click 📁 icon in Explorer header
- Files go into src/ by default
- Organize your project structure

### Navigating

- Click file names to open
- Use tabs to switch between files
- Close tabs with × button

## Tips & Tricks

1. **Multi-file development**
   - Open multiple files in tabs
   - Easy switching between related files
   - See all open files at a glance

2. **Error catching**
   - Always check Problems panel
   - Red error message before running code
   - Fix errors to run successfully

3. **Organizing code**
   - Create folders for organization
   - Group related files together
   - Easier to navigate projects

4. **Testing locally**
   - Write test code in console
   - Quick prototyping
   - Debug before committing

5. **View management**
   - Console for output
   - Problems for errors
   - Terminal for status info

## Limitations

- **No filesystem**: Files saved in browser memory only
- **Limited languages**: Full support for JS, basic for others
- **No external packages**: Node.js modules not available
- **Browser sandbox**: Can't access system resources
- **Terminal read-only**: Display only, can't input commands

## Next Steps

- Explore the code editor features
- Try writing different JavaScript functions
- Create a small project structure
- Use it for prototyping and learning
- Share code snippets with colleagues

## Troubleshooting

**Monaco editor not loading?**

- Ensure internet connection (CDN required)
- Wait for page to fully load
- Check browser console for errors

**Code won't run?**

- Check Problems panel for syntax errors
- Ensure file is .js (JavaScript)
- Review error messages carefully

**Files not saving?**

- Check browser storage is enabled
- Files auto-save to localStorage
- Clear browser cache carefully

**Performance slow?**

- Close unused tabs
- Review very large files
- Reduce console output

## Getting Help

Check these resources:

- [DEVSPACE_PRO_README.md](./DEVSPACE_PRO_README.md) - Full documentation
- Monaco Editor docs: https://microsoft.github.io/monaco-editor/
- JavaScript docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/

---

**Happy Coding! 🚀**
