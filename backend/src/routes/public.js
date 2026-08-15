const express = require('express');
const router = express.Router();
const qrCodeController = require('../controllers/qrCodeController');
const publicController = require('../controllers/publicController');
const authenticateJWT = require('../middleware/auth');

// QR Code routes (protected)
router.get('/qr-code', authenticateJWT, qrCodeController.getQRCode);
router.get('/qr-code/download', authenticateJWT, qrCodeController.downloadQRCode);

// Public restaurant routes (no auth)
router.get('/restaurants/:slug', publicController.getRestaurant);
router.get('/restaurants/:slug/menu', publicController.getRestaurantMenu);

module.exports = router;
