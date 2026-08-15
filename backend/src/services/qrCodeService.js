const QRCode = require('qrcode');

// Generate QR code as data URL
async function generateQRCodeDataURL(text) {
  try {
    const dataURL = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return dataURL;
  } catch (err) {
    throw new Error('Failed to generate QR code: ' + err.message);
  }
}

// Generate QR code as buffer (for file download)
async function generateQRCodeBuffer(text) {
  try {
    const buffer = await QRCode.toBuffer(text, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      quality: 0.95,
      margin: 1,
      width: 300,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return buffer;
  } catch (err) {
    throw new Error('Failed to generate QR code: ' + err.message);
  }
}

// Generate QR code SVG
async function generateQRCodeSVG(text) {
  try {
    const svg = await QRCode.toString(text, {
      errorCorrectionLevel: 'H',
      type: 'text/plain',
      quality: 0.95,
      margin: 1,
      width: 300
    });
    return svg;
  } catch (err) {
    throw new Error('Failed to generate QR code: ' + err.message);
  }
}

module.exports = {
  generateQRCodeDataURL,
  generateQRCodeBuffer,
  generateQRCodeSVG
};
