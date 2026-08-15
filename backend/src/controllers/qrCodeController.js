const Restaurant = require('../models/Restaurant');
const { generateQRCodeDataURL, generateQRCodeBuffer } = require('../services/qrCodeService');

// Generate QR code for restaurant
async function getQRCode(req, res) {
  try {
    const userId = req.userId;

    // Get restaurant
    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Generate QR code URL
    const qrUrl = `${process.env.API_URL}/r/${restaurant.slug}`;

    // Generate QR code as data URL
    const qrDataURL = await generateQRCodeDataURL(qrUrl);

    res.json({
      success: true,
      qrCode: {
        restaurantSlug: restaurant.slug,
        qrUrl: qrUrl,
        qrImage: qrDataURL  // Data URL for display
      }
    });
  } catch (err) {
    console.error('Generate QR code error:', err);
    res.status(400).json({ error: err.message });
  }
}

// Download QR code as PNG file
async function downloadQRCode(req, res) {
  try {
    const userId = req.userId;

    // Get restaurant
    const restaurant = await Restaurant.findByOwnerId(userId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    // Generate QR code URL
    const qrUrl = `${process.env.API_URL}/r/${restaurant.slug}`;

    // Generate QR code as buffer
    const buffer = await generateQRCodeBuffer(qrUrl);

    // Send file
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="${restaurant.slug}-qr-code.png"`);
    res.send(buffer);
  } catch (err) {
    console.error('Download QR code error:', err);
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  getQRCode,
  downloadQRCode
};
