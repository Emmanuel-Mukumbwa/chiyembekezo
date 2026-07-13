const pool = require('../config/db');

/**
 * Log an action to the audit log (admin_logs table).
 *
 * @param {number} actorId - ID of the user performing the action
 * @param {string} actorType - 'user', 'admin', 'professional'
 * @param {string} actorEmail - Email of the actor (optional, for quick lookup)
 * @param {string} action - Description of the action
 * @param {string} targetType - Type of target (e.g., 'user', 'article', 'appointment')
 * @param {number|null} targetId - ID of the target entity
 * @param {object} details - Additional JSON details
 */
const logAuditAction = async (
  actorId,
  actorType = 'user',
  actorEmail = null,
  action,
  targetType = null,
  targetId = null,
  details = {}
) => {
  try {
    await pool.query(
      `INSERT INTO admin_logs
       (admin_user_id, actor_type, actor_email, action, target_type, target_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [actorId, actorType, actorEmail, action, targetType, targetId, JSON.stringify(details)]
    );
  } catch (err) {
    console.error('❌ Failed to log audit action:', err);
  }
};

module.exports = { logAuditAction };