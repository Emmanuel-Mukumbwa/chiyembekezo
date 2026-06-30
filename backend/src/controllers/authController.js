const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { sendPasswordResetEmail } = require('../services/emailService');

// Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName || null, lastName || null, phone || null]
    );
    const userId = result[0].insertId;

    // Create profile record
    await pool.query(
      'INSERT INTO profiles (user_id, preferred_language) VALUES (?, ?)',
      [userId, 'en']
    );

    // Generate token
    const token = generateToken(userId);

    res.status(201).json({
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        phone,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const [rows] = await pool.query('SELECT id, email, password_hash, first_name, last_name, phone, is_admin FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        isAdmin: user.is_admin === 1,
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Forgot password – send reset link
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      // For security, still return success message
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate reset token (JWT or random string)
    const resetToken = jwt.sign(
      { id: rows[0].id, purpose: 'reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store token in DB (optional – we can also rely on JWT validation without storing)
    // For extra security, store hashed token. But JWT validation is fine.
    const expires = new Date(Date.now() + 3600000); // 1 hour
    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [resetToken, expires, rows[0].id]
    );

    // Send email
    await sendPasswordResetEmail(email, resetToken);

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Check token in DB (optional but adds extra validation)
    const [rows] = await pool.query(
      'SELECT id FROM users WHERE id = ? AND reset_token = ? AND reset_token_expires > NOW()',
      [decoded.id, token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token
    await pool.query(
      'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashedPassword, decoded.id]
    );

    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get current user profile (protected)
// @route   GET /api/auth/profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.date_of_birth, u.gender,
             p.bio, p.location, p.district, p.city, p.occupation, p.emergency_contact_name,
             p.emergency_contact_phone, p.preferred_language, p.preferences
      FROM users u
      LEFT JOIN profiles p ON u.id = p.user_id
      WHERE u.id = ?
    `, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Update user profile (protected)
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      firstName, lastName, phone, dateOfBirth, gender,
      bio, location, district, city, occupation,
      emergencyContactName, emergencyContactPhone,
      preferredLanguage, preferences
    } = req.body;

    // Update users table
    await pool.query(`
      UPDATE users
      SET first_name = COALESCE(?, first_name),
          last_name = COALESCE(?, last_name),
          phone = COALESCE(?, phone),
          date_of_birth = COALESCE(?, date_of_birth),
          gender = COALESCE(?, gender)
      WHERE id = ?
    `, [firstName, lastName, phone, dateOfBirth, gender, userId]);

    // Update profiles table (upsert)
    // Check if profile exists
    const [profileRows] = await pool.query('SELECT id FROM profiles WHERE user_id = ?', [userId]);
    if (profileRows.length > 0) {
      await pool.query(`
        UPDATE profiles
        SET bio = COALESCE(?, bio),
            location = COALESCE(?, location),
            district = COALESCE(?, district),
            city = COALESCE(?, city),
            occupation = COALESCE(?, occupation),
            emergency_contact_name = COALESCE(?, emergency_contact_name),
            emergency_contact_phone = COALESCE(?, emergency_contact_phone),
            preferred_language = COALESCE(?, preferred_language),
            preferences = COALESCE(?, preferences)
        WHERE user_id = ?
      `, [bio, location, district, city, occupation, emergencyContactName, emergencyContactPhone, preferredLanguage, preferences, userId]);
    } else {
      await pool.query(`
        INSERT INTO profiles (user_id, bio, location, district, city, occupation, emergency_contact_name, emergency_contact_phone, preferred_language, preferences)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, bio, location, district, city, occupation, emergencyContactName, emergencyContactPhone, preferredLanguage, preferences]);
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};