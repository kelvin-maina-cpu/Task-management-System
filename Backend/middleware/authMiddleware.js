const jwt = require("jsonwebtoken");

const authMiddleware = function(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    
    // ✅ Success logging
    console.log('✅ Auth middleware success:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      exp: decoded.exp
    });
    
    req.user = decoded; // attach user info to request
    next();
  } catch (error) {
    console.log('🔴 JWT Verification failed:', {
      name: error.name,
      message: error.message,
      expiredAt: error.expiredAt,
      tokenHeader: !!req.headers.authorization
    });
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired', 
        code: 'TOKEN_EXPIRED',
        expiredAt: error.expiredAt 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token signature', 
        code: 'INVALID_SIGNATURE',
        errorName: error.name 
      });
    }
    
    return res.status(401).json({ 
      message: 'Invalid token', 
      code: 'INVALID_TOKEN',
      errorName: error.name 
    });
  }

};

module.exports = authMiddleware;
