require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const guidanceRoutes = require('./routes/guidanceRoutes');

// DEBUG: Log route loading
console.log('Loading routes...');
console.log('authRoutes type:', typeof authRoutes);
if (authRoutes.stack) console.log('authRoutes length:', authRoutes.stack.length);

// Connect DB
connectDB().catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});

const app = express();


const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://task-management-frontend.vercel.app',
    'https://task-management-frontend-git-main-kelvin-maina.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); 
app.use(cookieParser());


// DEBUG: Log registered routes
console.log('Registered routes:');
app._router.stack.forEach((middleware, i) => {
  if (middleware.route) {
    console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
  } else if (middleware.name === 'router') {
    console.log(`Router #${i}: ${middleware.regexp}`);
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/guidance', guidanceRoutes);

// Health check for Render
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Management API Live!', 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    routes: ['/api/auth/me', '/api/projects']
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ message: 'Route not found', path: req.url });
});



// Error handling
app.use((err, req, res, next) => {
  console.error('ERROR:', err.message);
  console.error('Stack:', err.stack);
  res.status(500).json({ message: err.message || 'Internal server error' });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

