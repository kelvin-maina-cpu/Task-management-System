const jwt = require('jsonwebtoken');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../config/tokens');

exports.register = async (req, res) => {
  try {
    // ✅ Debug: Log the request body to see what's happening
    console.log('Register body:', req.body);
    
    const { email, password, name } = req.body;
    
    // ✅ Validate required fields - return 400 for client errors
    if (!email || !password || !name) {
      console.log('Missing required fields:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ error: 'Missing required fields: email, password, and name are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    // ✅ Debug: Check user object before token generation
    console.log('User created:', { _id: user._id, email: user.email, role: user.role, tokenVersion: user.tokenVersion });

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookie and respond
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: 'User created successfully',
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    // ✅ Better error handling - distinguish between server and client errors
    console.error('❌ REGISTRATION ERROR:', error);
    console.error('Stack:', error.stack);
    
    // Check for specific error types
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: '***' });
    
    // ✅ Add .select('+password') to include the password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('User found, comparing passwords...');
    console.log('Stored password hash exists:', !!user.password);  // Should be true
    
    // Now this will work!
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      console.log('Password mismatch');
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Password valid, generating tokens...');
    
    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Set cookie and respond
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
    
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    // 🔍 Enhanced refresh logging
    console.log('🔄 REFRESH REQUEST:', {
      hasRefreshCookie: !!req.cookies.refreshToken,
      cookieAge: req.cookies.refreshToken ? 'present' : 'missing'
    });
    
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = generateAccessToken(user);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

exports.logout = async (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out successfully' });
};

// Get current user (requires authentication)
exports.getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
