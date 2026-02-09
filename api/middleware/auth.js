import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

/**
 * Middleware to verify JWT token from Authorization header
 */
export function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'No token provided' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user info to request
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please log in again.' 
      });
    }
    
    return res.status(401).json({ 
      error: 'Invalid token',
      message: 'Authentication failed' 
    });
  }
}

/**
 * Generate JWT token for a user
 */
export function generateToken(user) {
  return jwt.sign(
    { 
      userId: user.id, 
      email: user.email 
    }, 
    JWT_SECRET,
    { expiresIn: '30d' } // Token valid for 30 days
  );
}
