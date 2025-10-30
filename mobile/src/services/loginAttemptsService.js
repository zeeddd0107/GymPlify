import axios from 'axios';

// Firebase Cloud Functions URL
const CLOUD_FUNCTIONS_URL = 'https://us-central1-gymplify-554c8.cloudfunctions.net';

/**
 * Check if user is locked out due to failed login attempts
 * @param {string} email - User's email address
 * @returns {Promise<{isLockedOut: boolean, attempts: number, lockedUntilMinutes?: number}>}
 */
export async function checkLoginAttempts(email) {
  try {
    console.log('[Login Attempts] Checking login status for:', email);
    
    const response = await axios.post(`${CLOUD_FUNCTIONS_URL}/checkLoginAttempts`, {
      email: email.toLowerCase(),
    });
    
    console.log('[Login Attempts] Check result:', response.data);
    return response.data;
  } catch (error) {
    // Log to console only (avoid error popup on screen)
    console.log('[Login Attempts] Check error:', error.message);
    
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to check login attempts');
    }
    throw new Error('Network error. Please check your connection.');
  }
}

/**
 * Record a login attempt (failed or successful)
 * @param {string} email - User's email address
 * @param {boolean} success - Whether the login was successful
 * @returns {Promise<{message: string, attempts: number, remainingAttempts?: number}>}
 */
export async function recordLoginAttempt(email, success) {
  try {
    console.log(`[Login Attempts] Recording ${success ? 'successful' : 'failed'} login for:`, email);
    
    const response = await axios.post(`${CLOUD_FUNCTIONS_URL}/recordLoginAttempt`, {
      email: email.toLowerCase(),
      success,
    });
    
    console.log('[Login Attempts] Record result:', response.data);
    return response.data;
  } catch (error) {
    // Log to console only (avoid error popup on screen)
    console.log('[Login Attempts] Record error:', error.message);
    
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to record login attempt');
    }
    throw new Error('Network error. Please check your connection.');
  }
}


