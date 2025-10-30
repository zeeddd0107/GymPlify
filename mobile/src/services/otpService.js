import axios from 'axios';

// Firebase Cloud Functions URLs (works everywhere!)
const CLOUD_FUNCTIONS_URL = 'https://us-central1-gymplify-554c8.cloudfunctions.net';

/**
 * Send OTP to user's email
 * @param {string} email - User's email address
 * @param {string} mode - Mode (register, forgot-password, etc.)
 * @returns {Promise<object>} - Response with otpId and expiresAt
 */
export async function sendOTP(email, mode = null) {
  console.log('[OTP] Sending OTP via Firebase Functions');
  console.log('[OTP] Email:', email);
  console.log('[OTP] Mode:', mode);
  
  try {
    const response = await axios.post(`${CLOUD_FUNCTIONS_URL}/sendOTP`, {
      email: email.toLowerCase(),
      mode,
    });
    console.log('[OTP] OTP sent successfully!', response.data);
    return response.data;
  } catch (error) {
    // Log to console only (avoid error popup on screen)
    console.log('[OTP] Send error:', error.message);
    
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to send OTP');
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Verify OTP code
 * @param {string} email - User's email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} otpId - OTP document ID from sendOTP response
 * @param {string} mode - Mode (register, forgot-password, etc.)
 * @returns {Promise<object>} - Verification result
 */
export async function verifyOTP(email, otp, otpId, mode = null) {
  try {
    const response = await axios.post(`${CLOUD_FUNCTIONS_URL}/verifyOTP`, {
      email: email.toLowerCase(),
      otp: otp.trim(),
      otpId,
      mode,
    });
    return response.data;
  } catch (error) {
    // Log to console only (avoid error popup on screen)
    console.log('[OTP] Verify error:', error.response?.data?.error || error.message);
    
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to verify OTP');
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Resend OTP (invalidates previous OTP)
 * @param {string} email - User's email address
 * @param {string} otpId - Previous OTP document ID (optional)
 * @returns {Promise<object>} - Response with new otpId and expiresAt
 */
export async function resendOTP(email, otpId = null) {
  try {
    const response = await axios.post(`${CLOUD_FUNCTIONS_URL}/resendOTP`, {
      email: email.toLowerCase(),
      otpId,
    });
    return response.data;
  } catch (error) {
    // Log to console only (avoid error popup on screen)
    console.log('[OTP] Resend error:', error.response?.data?.error || error.message);
    
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to resend OTP');
    }
    throw new Error('Network error. Please check your connection.');
  }
}

