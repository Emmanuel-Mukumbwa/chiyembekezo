const pool = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.warn('⚠️ isAdmin: No user ID in request');
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    console.log(`🔍 isAdmin: Checking user ${userId}`);

    const [rows] = await pool.query('SELECT is_admin FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      console.warn(`⚠️ isAdmin: User ${userId} not found`);
      return res.status(403).json({ error: 'User not found.' });
    }

    const isAdmin = rows[0].is_admin;
    console.log(`🔍 isAdmin: User ${userId} is_admin = ${isAdmin} (${typeof isAdmin})`);

    // Check both 1 and true
    if (isAdmin !== 1 && isAdmin !== true) {
      console.warn(`⚠️ isAdmin: User ${userId} is not an admin`);
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    console.log(`✅ isAdmin: User ${userId} is admin – access granted`);
    next();
  } catch (err) {
    console.error('❌ isAdmin error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};