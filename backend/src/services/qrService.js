const QRCode = require('qrcode');

exports.createQRCodeForUser = async (uid) => {
  const payload = JSON.stringify({ uid }); // You can also include a token, timestamp, etc.
  const qrDataUrl = await QRCode.toDataURL(payload); // base64-encoded image
  return qrDataUrl;
};
