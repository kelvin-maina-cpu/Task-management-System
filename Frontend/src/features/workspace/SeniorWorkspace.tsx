import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DevSpace, type FileItem } from '../../components/devspace/DevSpace';
import './SeniorWorkspace.css';

const seniorFileTree: FileItem = {
  name: 'advanced-projects',
  type: 'folder',
  children: [
    {
      name: 'project-1-react-app',
      type: 'folder',
      children: [
        {
          name: 'App.tsx',
          type: 'file',
          content: `import React, { useState, useEffect } from 'react';
import './App.css';

interface User {
  id: number;
  name: string;
  email: string;
}

export const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Simulate API call
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="app">
      <h1>User Management System</h1>
      <div className="users-grid">
        {users.map(user => (
          <div key={user.id} className="user-card">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  );
};`,
        },
        {
          name: 'App.css',
          type: 'file',
          content: `.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.user-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.user-card h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.user-card p {
  margin: 0;
  color: #666;
}`,
        },
        {
          name: 'package.json',
          type: 'file',
          content: `{
  "name": "react-user-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "~5.9.0",
    "vite": "^7.0.0"
  }
}`,
        },
      ],
    },
    {
      name: 'project-2-api-server',
      type: 'folder',
      children: [
        {
          name: 'server.js',
          type: 'file',
          content: `import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';

config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock database
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
];

// Routes
app.get('/api/users', (req, res) => {
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email required' });
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`,
        },
        {
          name: 'database.js',
          type: 'file',
          content: `import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};`,
        },
        {
          name: '.env.example',
          type: 'file',
          content: `PORT=3000
MONGODB_URI=mongodb://localhost:27017/myapp
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development`,
        },
      ],
    },
    {
      name: 'project-3-devops-pipeline',
      type: 'folder',
      children: [
        {
          name: 'Dockerfile',
          type: 'file',
          content: `FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD node healthcheck.js

# Start application
CMD ["npm", "start"]`,
        },
        {
          name: 'docker-compose.yml',
          type: 'file',
          content: `version: '3.8'

services:
  app:
    build: .
    container_name: my-app
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/myapp
    depends_on:
      - mongo
    networks:
      - app-network
    volumes:
      - log-volume:/app/logs

  mongo:
    image: mongo:6
    container_name: mongo-db
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongo-data:/data/db
    networks:
      - app-network

volumes:
  mongo-data:
  log-volume:

networks:
  app-network:
    driver: bridge`,
        },
        {
          name: '.github/workflows/deploy.yml',
          type: 'file',
          content: `name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build application
        run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to server
        env:
          DEPLOY_KEY: \${{ secrets.DEPLOY_KEY }}
        run: |
          echo \$DEPLOY_KEY | ssh-add -
          ssh deploy@production "cd /app && git pull && npm install && npm run build && systemctl restart app"`,
        },
      ],
    },
  ],
};

interface ProjectChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'Intermediate' | 'Advanced' | 'Expert';
  estimatedTime: string;
  skills: string[];
}

export const SeniorWorkspace: React.FC = () => {
  const navigate = useNavigate();
  const [completedProjects, setCompletedProjects] = useState<string[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCodeChange = useCallback((filePath: string, content: string) => {
    console.log(`Updated: ${filePath}`, content);
    
    const project = filePath.split('/')[0];
    if (!completedProjects.includes(project)) {
      setCompletedProjects([...completedProjects, project]);
    }
  }, [completedProjects]);

  const challenges: ProjectChallenge[] = [
    {
      id: 'project-1-react-app',
      title: 'Build a React Component Library',
      description: 'Create a reusable component library with TypeScript and Storybook',
      difficulty: 'Advanced',
      estimatedTime: '8-12 hours',
      skills: ['React', 'TypeScript', 'Component Design', 'Testing'],
    },
    {
      id: 'project-2-api-server',
      title: 'RESTful API with Express & MongoDB',
      description: 'Build a production-ready REST API with authentication and validation',
      difficulty: 'Advanced',
      estimatedTime: '10-15 hours',
      skills: ['Node.js', 'Express', 'MongoDB', 'Security'],
    },
    {
      id: 'project-3-devops-pipeline',
      title: 'CI/CD Pipeline & Docker Deployment',
      description: 'Setup a complete DevOps pipeline with GitHub Actions and Docker',
      difficulty: 'Expert',
      estimatedTime: '12-18 hours',
      skills: ['Docker', 'GitHub Actions', 'DevOps', 'Cloud Deployment'],
    },
  ];

  return (
    <div className={`senior-workspace ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      <div className="workspace-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <div>
            <h1>Advanced Developer Workspace</h1>
            <p className="subtitle">Master complex architectural patterns and DevOps practices</p>
          </div>
        </div>
        <div className="progress-info">
          <div className="progress-stats">
            <div className="stat">
              <span className="stat-number">{completedProjects.length}</span>
              <span className="stat-label">Projects Completed</span>
            </div>
            <div className="stat">
              <span className="stat-number">{challenges.length}</span>
              <span className="stat-label">Total Challenges</span>
            </div>
          </div>
        </div>
      </div>

      <div className="workspace-content">
        <aside className={`challenges-sidebar ${isFullscreen ? 'hidden-sidebar' : ''}`}>
          <h2>Advanced Challenges</h2>
          <div className="challenges-list">
            {challenges.map((challenge) => (
              <div
                key={challenge.id}
                className={`challenge-card ${
                  completedProjects.includes(challenge.id) ? 'completed' : ''
                } ${selectedChallenge === challenge.id ? 'active' : ''}`}
                onClick={() => setSelectedChallenge(challenge.id)}
              >
                <div className="challenge-header">
                  <h3>{challenge.title}</h3>
                  <span className={`difficulty-badge ${challenge.difficulty.toLowerCase()}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <p className="challenge-desc">{challenge.description}</p>
                <div className="challenge-meta">
                  <span className="time-estimate">⏱️ {challenge.estimatedTime}</span>
                  {completedProjects.includes(challenge.id) && (
                    <span className="completed-badge">✓ Completed</span>
                  )}
                </div>
                <div className="skills-tags">
                  {challenge.skills.map((skill) => (
                    <span key={skill} className="skill-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="devspace-wrapper">
          <DevSpace 
            initialFileTree={seniorFileTree}
            onCodeChange={handleCodeChange}
            onFullscreenChange={setIsFullscreen}
          />
        </main>
      </div>
    </div>
  );
};
