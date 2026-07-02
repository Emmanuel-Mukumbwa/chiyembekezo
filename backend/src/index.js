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

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
app.use(helmet());
app.use(cors());
app.use(express.json());

// Custom request logger (replaces Morgan)
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

// ---- Error handling ----
app.use(errorLogger); // logs errors with full details

// Generic error handler (sends JSON response)
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