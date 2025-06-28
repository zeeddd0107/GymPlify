const QRCode = require('qrcode');

exports.createQRCodeForUser = async (uid) => {
  const payload = JSON.stringify({ uid }); // The QR code will encode this JSON object
  const qrDataUrl = await QRCode.toDataURL(payload); // Generates a base64 image
  return qrDataUrl;
};
