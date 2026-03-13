const express = require('express');
const router = express.Router();
const { register, login, refresh, logout, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Logout user
router.post('/logout', logout);

// Refresh token
router.post('/refresh', refresh);

// Get current user (requires authentication)
router.get('/me', authMiddleware, getMe);

module.exports = router;

