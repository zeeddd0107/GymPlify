const QRCode = require('qrcode');

exports.createQRCodeForUser = async (uid) => {
  // Generate QR code with the same format as mobile app (uid_timestamp_random)
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  const qrValue = `${uid}_${timestamp}_${random}`;
  
  const qrDataUrl = await QRCode.toDataURL(qrValue); // Generates a base64 image
  return qrDataUrl;
};
