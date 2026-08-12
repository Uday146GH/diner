const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwtUtils');

// Register new user
async function register(req, res) {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await User.create(email, passwordHash, fullName);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, null); // No restaurant yet
    const refreshToken = generateRefreshToken(user.id);

    // Set httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      accessToken
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(400).json({ error: err.message });
  }
}

// Login user
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'User account is deactivated' });
    }

    // Compare password
    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, null);
    const refreshToken = generateRefreshToken(user.id);

    // Set httpOnly cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600000 // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600000 // 7 days
    });

    res.json({
      success: true,
      message: 'Logged in successfully',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      accessToken
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Logout user
async function logout(req, res) {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}

// Get current user
async function getCurrentUser(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
