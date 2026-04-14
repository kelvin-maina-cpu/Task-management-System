import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProjectByIdQuery, type Technology } from '../projects/projectsApi';
import { DevSpace, type FileItem } from '../../components/devspace/DevSpace';
import './ProjectDevSpace.css';

export const ProjectDevSpace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const { data: project, isLoading, error } = useGetProjectByIdQuery(projectId || '');

  // Create file structure based on project
  const fileTree = useMemo<FileItem>(() => {
    if (!project) {
      return {
        name: 'project',
        type: 'folder',
        children: [],
      };
    }

    const suggestedStack = project.suggestedStacks?.[0];
    const stackName = suggestedStack?.name || 'HTML/CSS/JS';

    // Template files based on project type/stack
    const srcFiles: FileItem[] = [
      {
        name: 'index.html',
        type: 'file',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- ${project.title} -->
    <main>
        <h1>${project.title}</h1>
        <p>${project.description}</p>
    </main>
    <script src="script.js"></script>
</body>
</html>`,
      },
      {
        name: 'styles.css',
        type: 'file',
        content: `/* Styles for ${project.title} */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
  min-height: 100vh;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 1rem;
  color: #667eea;
}

p {
  color: #666;
  line-height: 1.6;
}`,
      },
      {
        name: 'script.js',
        type: 'file',
        content: `// JavaScript for ${project.title}

console.log('${project.title} - Project loaded');
console.log('Stack: ${stackName}');

// Add your functionality here
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM is ready');
});`,
      },
    ];

    // Add package.json if not already present
    const projectFiles: FileItem[] = [
      {
        name: 'package.json',
        type: 'file',
        content: `{
  "name": "${project.title?.toLowerCase().replace(/\\s+/g, '-') || 'my-project'}",
  "version": "1.0.0",
  "description": "${project.description || 'Project description'}",
  "main": "index.html",
  "scripts": {
    "start": "open index.html",
    "dev": "vite"
  },
  "keywords": [${project.tags?.map((tag) => `"${tag}"`).join(', ') || '"development"'}],
  "author": "",
  "license": "MIT"
}`,
      },
      {
        name: 'README.md',
        type: 'file',
        content: `# ${project.title}

## Overview
${project.description}

## Difficulty
${project.difficulty || 'Not specified'}

## Tech Stack
${stackName}

## Getting Started
1. Open \`index.html\` in your browser
2. Edit \`styles.css\` to style the project
3. Use \`script.js\` for functionality

## Requirements
${
  project.requirements?.functional && project.requirements.functional.length > 0
    ? project.requirements.functional.map((req) => `- ${req.iWant}`).join('\n')
    : '- To be determined'
}

## Milestones
${project.milestones?.map((milestone: any, idx: number) => `${idx + 1}. ${milestone.title || milestone}`).join('\n') || '- To be determined'}`,
      },
      {
        name: '.gitignore',
        type: 'file',
        content: `node_modules/
dist/
.env
.env.local
.DS_Store
*.log
npm-debug.log*`,
      },
    ];

    // Add src folder with files
    const children: FileItem[] = [
      {
        name: 'src',
        type: 'folder',
        children: srcFiles,
      },
      ...projectFiles,
    ];

    // Add suggested stack files if available
    if (suggestedStack) {
      const stackNameLower = suggestedStack.name?.toLowerCase() || '';
      const hasReact = stackNameLower.includes('react') || 
        suggestedStack.technologies?.some(
          (tech: Technology) => tech.name.toLowerCase().includes('react')
        );
      const hasNode = stackNameLower.includes('node') || 
        stackNameLower.includes('express') ||
        suggestedStack.technologies?.some(
          (tech: Technology) => tech.name.toLowerCase().includes('node') || 
                               tech.name.toLowerCase().includes('express')
        );

      if (hasReact) {
        children.push({
          name: 'components',
          type: 'folder',
          children: [
            {
              name: 'App.tsx',
              type: 'file',
              content: `import React from 'react';

export const App: React.FC = () => {
  return (
    <div className="app">
      <h1>${project.title}</h1>
      <p>${project.description}</p>
    </div>
  );
};`,
            },
          ],
        });
      }

      if (hasNode) {
        children.push({
          name: 'server',
          type: 'folder',
          children: [
            {
              name: 'app.js',
              type: 'file',
              content: `const express = require('express');
const app = express();

app.use(express.json());

app.get('/api', (req, res) => {
  res.json({ message: '${project.title}' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
            },
          ],
        });
      }
    }

    return {
      name: project.title || 'project',
      type: 'folder',
      children,
    };
  }, [project]);

  const handleCodeChange = (filePath: string, content: string) => {
    // Save to backend or local storage
    console.log(`Code change in ${filePath}:`, content);
  };

  if (isLoading) {
    return (
      <div className="project-devspace-loader">
        <div className="loader-content">
          <div className="spinner"></div>
          <p>Loading {projectId} workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-devspace-error">
        <div className="error-content">
          <h2>❌ Project Not Found</h2>
          <p>The project couldn't be loaded. Please try again.</p>
          <button onClick={() => navigate('/projects')}>Back to Projects</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`project-devspace ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <div className="project-devspace-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="header-info">
          <h1>{project.title}</h1>
          <span className="tech-stack">
            {project.suggestedStacks?.[0]?.name || 'Web Project'}
          </span>
        </div>
      </div>
      <div className="project-devspace-content">
        <DevSpace
          initialFileTree={fileTree}
          onCodeChange={handleCodeChange}
          onFullscreenChange={setIsFullscreen}
        />
      </div>
    </div>
  );
};
