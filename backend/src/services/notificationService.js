const pool = require('../config/db');

/**
 * Send notification (log to DB and console)
 * Later integrate with real email/SMS providers.
 */
const sendNotification = async (userId, type, subject, message) => {
  try {
    await pool.query(
      'INSERT INTO notification_logs (user_id, type, subject, message) VALUES (?, ?, ?, ?)',
      [userId, type, subject, message]
    );
    console.log(`📧 ${type} sent to user ${userId}: ${subject}`);
  } catch (err) {
    console.error('Failed to log notification:', err);
  }
};

const sendEmail = async (userId, subject, html) => {
  await sendNotification(userId, 'email', subject, html);
};

const sendSMS = async (userId, message) => {
  await sendNotification(userId, 'sms', 'SMS', message);
};

const sendPush = async (userId, message) => {
  await sendNotification(userId, 'push', 'Push Notification', message);
};

module.exports = { sendEmail, sendSMS, sendPush, sendNotification };