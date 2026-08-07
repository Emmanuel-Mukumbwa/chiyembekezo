const pool = require('../config/db');

const logAdminAction = async (adminUserId, action, targetType = null, targetId = null, details = {}, actorEmail = null) => {
  try {
    await pool.query(
      `INSERT INTO admin_logs (admin_user_id, actor_email, action, target_type, target_id, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [adminUserId, actorEmail, action, targetType, targetId, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('❌ Failed to log admin action:', err);
  }
};

module.exports = { logAdminAction };
