// Load environment variables (local .env or production)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const guidanceRoutes = require('./routes/guidanceRoutes');
connectDB().catch(err => {
  console.error('MongoDB connection failed:', err.message);
  process.exit(1);
});

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/guidance', guidanceRoutes);

// Health check for Render
app.get('/', (req, res) => {
  res.json({ message: 'Task Management API Live!', status: 'OK', timestamp: new Date().toISOString() });
});

// Remove test route in production
// app.post('/api/test-enroll/:id', (req, res) => {
  // console.log('TEST ENROLL HIT:', req.params.id);
  // res.json({ success: true, message: 'Test route works' });


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

