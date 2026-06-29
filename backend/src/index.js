require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chiyembekezo API is running' });
});

// Import routes (we'll add later)
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/moods', require('./routes/moods'));
// etc.

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});