const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register user
exports.register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  db.query(sql, [username, email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error during registration:', err);
      return res.status(500).json({ message: 'Server error!' });
    }
    return res.status(201).json({ message: 'User registered successfully!' });
  });
};

// Login user and set a cookie
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required!' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ message: 'Server error!' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'User not found!' });
    }

    const user = results[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password!' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3600000, // 1 hour
      path: '/'
    });

    // Return success with redirect path
    res.json({
      success: true,
      message: 'Login successful!',
      redirect: '/my-account',
      user: {
        id: user.id,
        username: user.username
      }
    });
  });
};

// Get user data by auth token
exports.getUserData = (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required!' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const sql = 'SELECT id, username, email FROM users WHERE id = ?';
    db.query(sql, [decoded.id], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Server error!' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found!' });
      }

      res.status(200).json({ user: results[0] });
    });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token!' });
  }
};

// Logout user and clear the cookie
exports.logout = (req, res) => {
  res.clearCookie('authToken');
  res.status(200).json({ message: 'Logged out successfully!' });
};
