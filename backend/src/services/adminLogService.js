const pool = require('../config/db');

/**
 * Log an admin action into the admin_logs table.
 *
 * @param {number} adminUserId - ID of the admin user performing the action
 * @param {string} action - Description of the action (e.g., "User deleted", "Article published")
 * @param {string} [targetType] - Type of target (e.g., "user", "article", "appointment")
 * @param {number|null} [targetId] - ID of the target entity, if applicable
 * @param {object} [details] - Additional JSON details (e.g., changes made, reason, IP)
 */
const logAdminAction = async (adminUserId, action, targetType = null, targetId = null, details = {}) => {
  try {
    await pool.query(
      `INSERT INTO admin_logs (admin_user_id, action, target_type, target_id, details)
       VALUES (?, ?, ?, ?, ?)`,
      [adminUserId, action, targetType, targetId, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('❌ Failed to log admin action:', err);
  }
};

module.exports = { logAdminAction };