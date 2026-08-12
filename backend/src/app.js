const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware (these process every request)
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (to verify server is running)
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Backend is running ✅', 
    timestamp: new Date(),
    app: 'DineR'
  });
});

// Error handling middleware (catches all errors)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.statusCode || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

module.exports = app;
