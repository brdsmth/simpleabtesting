import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import { generateApiKey, isValidEmail } from '../utils/auth.js';
import { generateToken, verifyToken } from '../middleware/auth.js';

const router = express.Router();

// POST /auth/signup - Create new user with email and password
router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing fields',
        message: 'Email and password are required'
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: 'Please provide a valid email address'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Weak password',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'User exists',
        message: 'This email is already registered. Please log in instead.'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate API key for SDK usage
    const apiKey = generateApiKey();

    // Create user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, api_key, created_at) 
       VALUES ($1, $2, $3, NOW()) 
       RETURNING id, email, api_key, created_at`,
      [email.toLowerCase(), passwordHash, apiKey]
    );

    const user = result.rows[0];
    console.log(`[AUTH] New user signed up: ${email}`);

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        apiKey: user.api_key,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('[AUTH] Signup error:', error);
    res.status(500).json({ 
      error: 'Signup failed',
      message: 'Failed to create account. Please try again.'
    });
  }
});

// POST /auth/login - Login with email and password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Missing fields',
        message: 'Email and password are required'
      });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, password_hash, api_key, created_at FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    console.log(`[AUTH] User logged in: ${email}`);

    // Generate JWT token
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        apiKey: user.api_key,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({ 
      error: 'Login failed',
      message: 'Failed to log in. Please try again.'
    });
  }
});

// GET /auth/me - Get current user info (protected route)
router.get('/me', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, api_key, created_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'User account not found'
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        apiKey: user.api_key,
        createdAt: user.created_at
      }
    });
  } catch (error) {
    console.error('[AUTH] Get user error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch user',
      message: error.message 
    });
  }
});

export default router;
