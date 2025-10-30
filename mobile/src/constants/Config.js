// API Configuration
// Backend API URL for local development
// Note: OTP functions run in Firebase Cloud Functions (no local setup needed!)

// For Android Emulator: Use 10.0.2.2
// For iOS Simulator: Use localhost or 127.0.0.1
// For Physical Device: Use your computer's local IP address

// Local Backend API (for QR, auth, notifications)
export const API_URL = 'http://10.0.2.2:4000'; // Android Emulator
// export const API_URL = 'http://localhost:4000'; // iOS Simulator
// export const API_URL = 'http://192.168.1.55:4000'; // Physical Device

// Note: OTP endpoints are handled by otpService.js using Firebase Cloud Functions
// No need to configure OTP URL here!

