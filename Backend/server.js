const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envFileByMode = {
  test: '.env.test',
  production: '.env.production',
};

const envPath = path.resolve(__dirname, envFileByMode[process.env.NODE_ENV] || '.env');

// Load local env files when present, while keeping real platform env vars as the source of truth.
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: false });
} else if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.resolve(__dirname, '.env'), override: false });
}

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const connectDB = require('./config/db');
const { initializeTerminalSocket } = require('./services/terminalSocketService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const guidanceRoutes = require('./routes/guidanceRoutes');
const fileRoutes = require('./routes/fileRoutes');

// Connect DB
connectDB().catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [
        'https://task-management-system-beige-beta-38.vercel.app',
        'https://task-management-system-git-main-kelvin-mainas-projects-2196d2d7.vercel.app',
        'https://task-management-system-c9m5ikrw9.vercel.app',
        /\.vercel\.app$/ // covers any future preview URLs
      ]
    : true,  // allow all origins locally
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 
app.use(cookieParser());

// No-cache middleware for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/guidance', guidanceRoutes);
app.use('/api/files', fileRoutes);

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Management API Live!', 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    routes: ['/api/auth/me', '/api/projects']
  });
});

// Favicon/static silent 404
app.use((req, res) => {
  if (req.url.match(/\\.(ico|png|jpg|jpeg|gif|svg|css|js|json)$/)) {
    res.status(204).end();
    return;
  }
  res.status(404).end();
});

// Error handler
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  const server = http.createServer(app);
  initializeTerminalSocket(server);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
