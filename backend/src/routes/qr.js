const express = require('express');
const router = express.Router();
const { generateQRCode } = require('../controllers/qrController');

// POST /qr/generate
router.post('/generate', generateQRCode);

module.exports = router;
