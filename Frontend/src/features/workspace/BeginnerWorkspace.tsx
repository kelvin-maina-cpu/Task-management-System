import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DevSpace, type FileItem } from '../../components/devspace/DevSpace';
import './BeginnerWorkspace.css';

const beginnerFileTree: FileItem = {
  name: 'beginner-projects',
  type: 'folder',
  children: [
    {
      name: 'lesson-1-html-basics',
      type: 'folder',
      children: [
        {
          name: 'index.html',
          type: 'file',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First HTML Page</title>
</head>
<body>
    <h1>Welcome to Web Development!</h1>
    <p>This is my first HTML page.</p>
    <p>I'm learning the basics of HTML.</p>
</body>
</html>`,
        },
        {
          name: 'README.md',
          type: 'file',
          content: `# Lesson 1: HTML Basics

## Learning Objectives
- Understand HTML structure
- Learn basic HTML tags
- Create your first webpage

## Task
Create a simple HTML page with:
- A main heading
- At least 2 paragraphs
- Proper HTML structure

## Tips
- Use <h1> for main heading
- Use <p> for paragraphs
- Always include DOCTYPE declaration`,
        },
      ],
    },
    {
      name: 'lesson-2-css-styling',
      type: 'folder',
      children: [
        {
          name: 'index.html',
          type: 'file',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Styled Page</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header>
        <h1>Learn CSS</h1>
    </header>
    
    <main>
        <article>
            <h2>Introduction to CSS</h2>
            <p>CSS makes your website beautiful!</p>
        </article>
    </main>
    
    <footer>
        <p>&copy; 2024 My Learning Project</p>
    </footer>
</body>
</html>`,
        },
        {
          name: 'style.css',
          type: 'file',
          content: `/* Basic styling */
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    background-color: #f4f4f4;
}

header {
    background-color: #333;
    color: white;
    padding: 1rem;
    text-align: center;
}

main {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

article {
    background: white;
    padding: 1.5rem;
    border-radius: 5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

footer {
    background-color: #333;
    color: white;
    text-align: center;
    padding: 1rem;
    margin-top: 2rem;
}`,
        },
        {
          name: 'README.md',
          type: 'file',
          content: `# Lesson 2: CSS Styling

## Learning Objectives
- Add styles to HTML elements
- Use CSS selectors
- Understand the box model
- Create layouts with CSS

## Task
1. Style the header with a background color
2. Add margin and padding to articles
3. Style the footer
4. Make the page responsive with max-width

## Tips
- Use classes and IDs for styling
- The box model: margin, border, padding, content
- Colors can be hexadecimal (#333) or named (white)`,
        },
      ],
    },
    {
      name: 'lesson-3-javascript-basics',
      type: 'folder',
      children: [
        {
          name: 'index.html',
          type: 'file',
          content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JavaScript Basics</title>
</head>
<body>
    <h1>JavaScript Basics</h1>
    
    <div id="message"></div>
    <button id="myButton">Click Me!</button>
    
    <script src="script.js"></script>
</body>
</html>`,
        },
        {
          name: 'script.js',
          type: 'file',
          content: `// Your JavaScript code here

// Example: Display a message when button is clicked
const button = document.getElementById('myButton');
const messageDiv = document.getElementById('message');

button.addEventListener('click', function() {
    messageDiv.textContent = 'Hello from JavaScript!';
    console.log('Button clicked!');
});

// Variables and data types
let name = 'Beginner Developer';
let age = 20;
let isLearning = true;

console.log('My name is ' + name);
console.log('I am ' + age + ' years old');

// Functions
function greet(personName) {
    return 'Hello, ' + personName + '!';
}

console.log(greet('Sarah'));`,
        },
        {
          name: 'README.md',
          type: 'file',
          content: `# Lesson 3: JavaScript Basics

## Learning Objectives
- Understand variables and data types
- Write simple functions
- Use DOM manipulation
- Handle user events

## Task
1. Create a variable to store your name
2. Write a function that greets a person
3. Add a click event listener to the button
4. Update the DOM with a message

## Tips
- Variables: let, const, var
- Data types: string, number, boolean, object, array
- Use console.log() for debugging
- DOM methods: getElementById, addEventListener`,
        },
      ],
    },
  ],
};

export const BeginnerWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCodeChange = useCallback((filePath: string, content: string) => {
    // Save code changes - could be sent to backend
    console.log(`Updated: ${filePath}`, content);
    
    // Track lesson progress
    const lesson = filePath.split('/')[0];
    if (!completedLessons.includes(lesson)) {
      setCompletedLessons([...completedLessons, lesson]);
    }
  }, [completedLessons]);

  const lessons = [
    {
      id: 'lesson-1-html-basics',
      title: 'HTML Basics',
      description: 'Learn the foundation of web pages with HTML',
      difficulty: 'Beginner',
      completed: completedLessons.includes('lesson-1-html-basics'),
    },
    {
      id: 'lesson-2-css-styling',
      title: 'CSS Styling',
      description: 'Make your websites beautiful with CSS',
      difficulty: 'Beginner',
      completed: completedLessons.includes('lesson-2-css-styling'),
    },
    {
      id: 'lesson-3-javascript-basics',
      title: 'JavaScript Basics',
      description: 'Add interactivity with JavaScript',
      difficulty: 'Beginner',
      completed: completedLessons.includes('lesson-3-javascript-basics'),
    },
  ];

  return (
    <div className={`beginner-workspace ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <div className="workspace-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/beginner')}>
            ← Back
          </button>
          <div>
            <h1>Beginner Workspace</h1>
            <p className="subtitle">Master the fundamentals of web development</p>
          </div>
        </div>
        <div className="progress-info">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
            />
          </div>
          <p>{completedLessons.length} of {lessons.length} lessons completed</p>
        </div>
      </div>

      <div className="workspace-content">
        <aside className={`lessons-sidebar ${isFullscreen ? 'hidden-sidebar' : ''}`}>
          <h2>Lessons</h2>
          <div className="lessons-list">
            {lessons.map((lesson) => (
              <div key={lesson.id} className={`lesson-card ${lesson.completed ? 'completed' : ''}`}>
                <div className="lesson-checkbox">
                  {lesson.completed && <span className="check-icon">✓</span>}
                </div>
                <div className="lesson-info">
                  <h3>{lesson.title}</h3>
                  <p>{lesson.description}</p>
                  <span className="difficulty-badge">{lesson.difficulty}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="devspace-wrapper">
          <DevSpace 
            initialFileTree={beginnerFileTree}
            onCodeChange={handleCodeChange}
            onFullscreenChange={setIsFullscreen}
          />
        </main>
      </div>
    </div>
  );
};
