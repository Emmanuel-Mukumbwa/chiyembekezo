// Global error handlers for uncaught exceptions/rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
  process.exit(1);
});

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Import custom logger and middlewares
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');
const errorLogger = require('./middleware/errorLogger');

// Import route modules
const authRoutes = require('./routes/auth');
const assessmentRoutes = require('./routes/assessments');
const moodRoutes = require('./routes/moods');
const journalRoutes = require('./routes/journal');
const goalsRoutes = require('./routes/goals');
const safetyPlanRoutes = require('./routes/safetyPlan');
const wellnessRoutes = require('./routes/wellness');
const professionalsPublicRoutes = require('./routes/professionals');
const professionalPortalRoutes = require('./routes/professional');
const appointmentRoutes = require('./routes/appointments');
const communityRoutes = require('./routes/community');
const habitRoutes = require('./routes/habits');
const emergencyRoutes = require('./routes/emergency');
const achievementRoutes = require('./routes/achievements');
const resourceRoutes = require('./routes/resources');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const organizationRoutes = require('./routes/organization');
const peerSupportRoutes = require('./routes/peerSupport');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ---- Test route ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chiyembekezo API is running' });
});

// ---- API routes ----
app.use('/api/auth', authRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/mood', moodRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/safety-plan', safetyPlanRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/professionals', professionalsPublicRoutes);
app.use('/api/professional', professionalPortalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organization', organizationRoutes);
app.use('/api/peer-support', peerSupportRoutes);

// ---- Error handling ----
app.use(errorLogger);

app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

// ---- Start server ----
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
});