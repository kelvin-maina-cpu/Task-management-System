const jwt = require('jsonwebtoken');

// Verify env variables exist at startup
if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error('FATAL: JWT secrets not defined in .env file!');
  console.error('Please add the following to your .env file:');
  console.error('JWT_ACCESS_SECRET=your_access_secret_key_here_min_32_chars');
  console.error('JWT_REFRESH_SECRET=your_refresh_secret_key_here_different');
  process.exit(1);
}

// ✅ Log secret presence for debugging (runs if secrets present)
console.log('🔑 JWT Config loaded:', {
  hasAccessSecret: !!process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.length > 10,
  hasRefreshSecret: !!process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length > 10,
  accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d'
});


// Generate Access Token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' }
  );
};

// Generate Refresh Token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { userId: user._id, tokenVersion: user.tokenVersion || 0 },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d' }
  );
};

module.exports = { generateAccessToken, generateRefreshToken };
