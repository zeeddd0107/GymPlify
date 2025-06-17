const { createQRCodeForUser } = require('../services/qrService');

exports.generateQRCode = async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "UID is required" });
  }

  try {
    const qrCodeDataUrl = await createQRCodeForUser(uid);
    res.status(200).json({ qrCode: qrCodeDataUrl });
  } catch (err) {
    console.error("QR Generation failed:", err);
    res.status(500).json({ error: "Failed to generate QR code" });
  }
};
