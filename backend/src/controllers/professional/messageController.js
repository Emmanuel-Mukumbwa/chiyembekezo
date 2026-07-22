const pool = require('../../config/db');
const { logAuditAction } = require('../../services/auditLogService');

exports.getConversations = async (req, res) => {
  try {
    const professionalId = req.professionalId;
    // Get distinct patients who have exchanged messages
    const [rows] = await pool.query(`
      SELECT DISTINCT u.id as user_id, u.first_name, u.last_name, u.email,
             (SELECT content FROM messages WHERE professional_id = ? AND ((sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id)) ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages WHERE professional_id = ? AND ((sender_id = u.id AND receiver_id = ?) OR (sender_id = ? AND receiver_id = u.id)) ORDER BY created_at DESC LIMIT 1) as last_message_time
      FROM messages m
      JOIN users u ON (m.sender_id = u.id OR m.receiver_id = u.id)
      WHERE m.professional_id = ? AND u.id != ?
      GROUP BY u.id
    `, [professionalId, req.user.id, req.user.id, professionalId, req.user.id, req.user.id, professionalId, req.user.id]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const professionalId = req.professionalId;
    const { patientId } = req.params;
    const [rows] = await pool.query(`
      SELECT m.*, u_sender.first_name as sender_first, u_sender.last_name as sender_last,
             u_receiver.first_name as receiver_first, u_receiver.last_name as receiver_last
      FROM messages m
      JOIN users u_sender ON m.sender_id = u_sender.id
      JOIN users u_receiver ON m.receiver_id = u_receiver.id
      WHERE m.professional_id = ? AND (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
      ORDER BY m.created_at ASC
    `, [professionalId, patientId, req.user.id, req.user.id, patientId]);
    // Mark as read (if receiver is the professional)
    await pool.query(
      'UPDATE messages SET is_read = TRUE WHERE professional_id = ? AND receiver_id = ? AND sender_id = ?',
      [professionalId, req.user.id, patientId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const professionalId = req.professionalId;
    const { patientId, content } = req.body;
    if (!content) return res.status(400).json({ error: 'Message content is required' });
    const [result] = await pool.query(`
      INSERT INTO messages (sender_id, receiver_id, professional_id, content)
      VALUES (?, ?, ?, ?)
    `, [req.user.id, patientId, professionalId, content]);
    await logAuditAction(req.user.id, 'professional', req.user.email, `Sent message to patient ${patientId}`, 'message', result.insertId);
    res.status(201).json({ message: 'Message sent', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};