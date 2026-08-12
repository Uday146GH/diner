const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticateJWT = require('../middleware/auth');

// Public routes (no auth required)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (auth required)
router.post('/logout', authenticateJWT, authController.logout);
router.get('/me', authenticateJWT, authController.getCurrentUser);

module.exports = router;
