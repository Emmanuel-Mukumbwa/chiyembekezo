// backend/src/services/emailService.js
// For production, replace with nodemailer or a real email service.
// For now, we'll just log the token to the console.

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
  console.log(`🔐 Password reset for ${email}: ${resetLink}`);
  // In production, send actual email.
  return true;
};

module.exports = { sendPasswordResetEmail };