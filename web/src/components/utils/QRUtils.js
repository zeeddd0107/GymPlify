import QRCode from "qrcode";

/**
 * Generate QR code image data URL for a user
 * @param {string} qrValue - The QR code value to encode
 * @returns {Promise<string>} - Base64 data URL of the QR code image
 */
export const generateQRCodeImage = async (qrValue) => {
  try {
    const qrDataUrl = await QRCode.toDataURL(qrValue, {
      errorCorrectionLevel: "M",
      type: "image/png",
      quality: 0.92,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 300,
    });
    return qrDataUrl;
  } catch (error) {
    console.error("Error generating QR code:", error);
    throw new Error("Failed to generate QR code image");
  }
};
