const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Resend} = require("resend");
const crypto = require("crypto");

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Resend
const resend = new Resend(functions.config().resend.api_key);

/**
 * Cloud Function: sendPushNotification
 * Triggers when a new notification document is created in Firestore
 * Sends push notification via Firebase Cloud Messaging (FCM) V1 API
 */
exports.sendPushNotification = functions.firestore
  .document("notifications/{notificationId}")
  .onCreate(async (snap, context) => {
    try {
      const notification = snap.data();
      const {userId, title, message, type, priority} = notification;

      console.log(" New notification created:", {
        notificationId: context.params.notificationId,
        userId,
        title,
        type,
      });

      // Get user's FCM token from Firestore
      console.log(" Fetching user document...");
      const userDoc = await admin
        .firestore()
        .collection("users")
        .doc(userId)
        .get();

      if (!userDoc.exists) {
        console.log(" User document not found:", userId);
        return null;
      }

      console.log(" User document found");
      const userData = userDoc.data();
      const fcmToken = userData?.fcmToken;

      if (!fcmToken) {
        console.log(" No FCM token found for user:", userId);
        console.log("   User data keys:", Object.keys(userData || {}));
        return null;
      }

      console.log(" FCM token found:", fcmToken.substring(0, 30) + "...");

      // Prepare FCM message payload (V1 API format)
      const fcmMessage = {
        token: fcmToken,
        notification: {
          title: title,
          body: message,
        },
        data: {
          type: type || "",
          notificationId: context.params.notificationId,
          message: message || "",
          // Convert all notification fields to strings (FCM requirement)
          ...Object.entries(notification).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined && key !== "timestamp") {
              acc[key] = String(value);
            }
            return acc;
          }, {}),
        },
        android: {
          priority: priority === "high" ? "high" : "normal",
          notification: {
            channelId: "default",
            sound: "default",
            priority: priority === "high" ? "high" : "default",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
      };

      console.log(" Sending push notification via FCM V1 API...");
      console.log("   Message:", JSON.stringify(fcmMessage, null, 2));

      // Send using Firebase Admin SDK (FCM V1 API)
      const response = await admin.messaging().send(fcmMessage);

      console.log(" Push notification sent successfully!");
      console.log(" FCM Message ID:", response);

      return null;
    } catch (error) {
      console.error(" FATAL ERROR in Cloud Function:");
      console.error("   Error name:", error.name);
      console.error("   Error message:", error.message);
      console.error("   Error code:", error.code);
      
      // FCM-specific error handling
      if (error.code === "messaging/invalid-registration-token" ||
          error.code === "messaging/registration-token-not-registered") {
        console.error("    Invalid or expired FCM token - token may need to be refreshed");
      }
      
      console.error("   Error stack:", error.stack);
      return null;
    }
  });

// ============================================================================
// OTP FUNCTIONS (Email Verification)
// ============================================================================

/**
 * Utility: Generate 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Utility: Hash OTP for secure storage
 */
function hashOTP(otp) {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

/**
 * Utility: Verify OTP
 */
function verifyOTP(providedOTP, hashedOTP) {
  const hashedProvidedOTP = hashOTP(providedOTP);
  return hashedProvidedOTP === hashedOTP;
}

/**
 * Utility: Check if OTP expired
 */
function isOTPExpired(expiresAt) {
  return new Date() > expiresAt.toDate();
}

/**
 * Utility: Get OTP expiration (5 minutes from now)
 */
function getOTPExpiration() {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 5);
  return expiration;
}

/**
 * Cloud Function: sendOTP
 * HTTP endpoint to send OTP email
 */
exports.sendOTP = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {email, mode} = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({error: "Email is required"});
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({error: "Invalid email format"});
    }

    console.log(" Sending OTP to:", email);

    // For forgot-password mode, check if user exists in Firebase Auth
    if (mode === "forgot-password") {
      try {
        await admin.auth().getUserByEmail(email);
        console.log(" User exists in Firebase Auth");
      } catch (error) {
        if (error.code === "auth/user-not-found") {
          console.log(" User not found - returning generic success message for security");
          // Return success with a fake otpId to prevent email enumeration
          // Don't send OTP, just return a generic success response
          return res.status(200).json({
            message: "If this email is registered, you will receive a verification code",
            otpId: "security-placeholder",
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            userNotFound: true, // Internal flag (not shown to user)
          });
        }
        // For other errors, log but continue (don't reveal if user exists)
        console.error("Error checking user existence:", error);
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = getOTPExpiration();

    // Store OTP in Firestore
    const otpDoc = await admin.firestore().collection("otpCodes").add({
      email: email.toLowerCase(),
      code: hashedOTP,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      attempts: 0,
      verified: false,
      maxAttempts: 2, // Allow only 3 total attempts (attempts 0, 1, 2 before blocking at 3)
    });

    console.log("💾 OTP stored in Firestore:", otpDoc.id);

    // Send email using Resend
    const {data, error} = await resend.emails.send({
      from: `GymPlify Security <${functions.config().resend.from_email}>`,
      to: [email],
      reply_to: "support@gymplify.io",
      subject: "Your GymPlify Login Code",
      headers: {
        "X-Priority": "1",
        "X-Entity-Ref-ID": otpDoc.id,
      },
      // Plain text version (improves deliverability)
      text: `
Hello,

We received a request to verify your GymPlify account.

Your verification code is: ${otp}

This code will expire in 5 minutes.

For your security, never share this code with anyone. If you didn't request this, you can safely ignore this message.

Need help? Reply to this email or visit support@gymplify.io

Best regards,
GymPlify Security Team
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f3f4f6;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #2a4eff;
              margin-bottom: 10px;
            }
            .greeting {
              font-size: 18px;
              color: #374151;
              margin-bottom: 20px;
            }
            .otp-container {
              background-color: #f3f4f6;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-label {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 10px;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #2a4eff;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .lock-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .message {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 20px;
            }
            .validity {
              font-size: 14px;
              color: #6b7280;
              margin-top: 20px;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin-top: 30px;
              border-radius: 4px;
            }
            .warning-text {
              font-size: 14px;
              color: #92400e;
              margin: 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              font-size: 14px;
              color: #6b7280;
            }
            .brand {
              font-weight: bold;
              color: #2a4eff;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GymPlify</div>
            </div>
            
            <p class="greeting">Hi there,</p>
            
            <p class="message">Your one-time verification code is:</p>
            
            <div class="otp-container">
              <div class="lock-icon">🔐</div>
              <div class="otp-label">VERIFICATION CODE</div>
              <div class="otp-code">${otp}</div>
              <p class="validity">This code is valid for the next <strong>5 minutes</strong>.</p>
            </div>
            
            <div class="warning">
              <p class="warning-text">
                <strong> Security Notice:</strong> If you did not request this verification code, 
                please ignore this message or contact our support team immediately.
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                — The <span class="brand">GymPlify</span> Team
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error(" Resend error:", error);
      return res.status(500).json({error: "Failed to send email"});
    }

    console.log(" OTP email sent successfully:", data);

    return res.status(200).json({
      message: "OTP sent successfully",
      otpId: otpDoc.id,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error(" Error in sendOTP:", error);
    return res.status(500).json({
      error: "Failed to send OTP",
      details: error.message,
    });
  }
});

/**
 * Cloud Function: verifyOTP
 * HTTP endpoint to verify OTP code
 */
exports.verifyOTP = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {email, otp, otpId, mode} = req.body;

    // Validate inputs
    if (!email || !otp || !otpId) {
      return res.status(400).json({
        error: "Email, OTP code, and OTP ID are required",
      });
    }

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        error: "Invalid OTP format. Must be 6 digits.",
      });
    }

    console.log(" Verifying OTP for:", email);

    // Get OTP document
    const otpDoc = await admin.firestore().collection("otpCodes").doc(otpId).get();

    if (!otpDoc.exists) {
      return res.status(404).json({
        error: "OTP not found or expired",
      });
    }

    const otpData = otpDoc.data();

    // Check if email matches
    if (otpData.email !== email.toLowerCase()) {
      return res.status(403).json({
        error: "Invalid OTP request",
      });
    }

    // Check if already verified
    if (otpData.verified) {
      return res.status(400).json({
        error: "OTP already used",
      });
    }

    // Check if expired
    if (isOTPExpired(otpData.expiresAt)) {
      await admin.firestore().collection("otpCodes").doc(otpId).delete();
      return res.status(400).json({
        error: "OTP has expired. Please request a new one.",
      });
    }

    // Check max attempts
    if (otpData.attempts >= otpData.maxAttempts) {
      await admin.firestore().collection("otpCodes").doc(otpId).delete();
      return res.status(400).json({
        error: "Maximum verification attempts exceeded. Please request a new OTP.",
      });
    }

    // Verify OTP
    const isValid = verifyOTP(otp, otpData.code);

    if (!isValid) {
      // Increment attempts
      await admin.firestore()
          .collection("otpCodes")
          .doc(otpId)
          .update({
            attempts: admin.firestore.FieldValue.increment(1),
          });

      const remainingAttempts = otpData.maxAttempts - (otpData.attempts + 1);

      return res.status(400).json({
        error: "Invalid OTP code",
        remainingAttempts,
      });
    }

    // OTP is valid - mark as verified
    await admin.firestore().collection("otpCodes").doc(otpId).update({
      verified: true,
      verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Delete OTP after successful verification (for security)
    setTimeout(async () => {
      await admin.firestore().collection("otpCodes").doc(otpId).delete();
    }, 5000);

    console.log(" OTP verified successfully for:", email);

    // If forgot-password mode, generate password reset link
    if (mode === "forgot-password") {
      try {
        console.log(" Generating password reset link for:", email);
        
        // Generate password reset link
        const resetLink = await admin.auth().generatePasswordResetLink(email.toLowerCase());
        console.log(" Password reset link generated successfully");
        
        // Extract the reset code from the link
        const url = new URL(resetLink);
        const resetCode = url.searchParams.get('oobCode');
        
        return res.status(200).json({
          message: "OTP verified successfully",
          verified: true,
          resetCode: resetCode,
          resetLink: resetLink,
        });
      } catch (error) {
        console.error(" Error generating password reset link:", {
          code: error.code,
          message: error.message,
        });
        return res.status(500).json({
          error: "Failed to generate password reset link",
          details: error.message,
          code: error.code,
        });
      }
    }

    return res.status(200).json({
      message: "OTP verified successfully",
      verified: true,
    });
  } catch (error) {
    console.error(" Error in verifyOTP:", error);
    return res.status(500).json({
      error: "Failed to verify OTP",
      details: error.message,
    });
  }
});

/**
 * Cloud Function: resendOTP
 * HTTP endpoint to resend OTP
 */
exports.resendOTP = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {email, otpId} = req.body;

    // Validate inputs
    if (!email) {
      return res.status(400).json({error: "Email is required"});
    }

    // Delete old OTP if provided
    if (otpId) {
      try {
        await admin.firestore().collection("otpCodes").doc(otpId).delete();
        console.log(" Old OTP deleted:", otpId);
      } catch (error) {
        console.log("Old OTP not found or already deleted");
      }
    }

    console.log(" Resending OTP to:", email);

    // Generate new OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);
    const expiresAt = getOTPExpiration();

    // Store new OTP
    const otpDoc = await admin.firestore().collection("otpCodes").add({
      email: email.toLowerCase(),
      code: hashedOTP,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      attempts: 0,
      verified: false,
      maxAttempts: 2, // Allow only 3 total attempts (attempts 0, 1, 2 before blocking at 3)
    });

    console.log("💾 New OTP stored:", otpDoc.id);

    // Send email
    const {data, error} = await resend.emails.send({
      from: `GymPlify Security <${functions.config().resend.from_email}>`,
      to: [email],
      reply_to: "support@gymplify.io",
      subject: "Your GymPlify Login Code",
      headers: {
        "X-Priority": "1",
        "X-Entity-Ref-ID": otpDoc.id,
      },
      // Plain text version (improves deliverability)
      text: `
Hello,

We received a request to verify your GymPlify account.

Your verification code is: ${otp}

This code will expire in 5 minutes.

For your security, never share this code with anyone. If you didn't request this, you can safely ignore this message.

Need help? Reply to this email or visit support@gymplify.io

Best regards,
GymPlify Security Team
      `.trim(),
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f3f4f6;
            }
            .container {
              background-color: #ffffff;
              border-radius: 8px;
              padding: 40px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #2a4eff;
              margin-bottom: 10px;
            }
            .greeting {
              font-size: 18px;
              color: #374151;
              margin-bottom: 20px;
            }
            .otp-container {
              background-color: #f3f4f6;
              border-radius: 8px;
              padding: 30px;
              text-align: center;
              margin: 30px 0;
            }
            .otp-label {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 10px;
            }
            .otp-code {
              font-size: 36px;
              font-weight: bold;
              color: #2a4eff;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
            }
            .lock-icon {
              font-size: 48px;
              margin-bottom: 10px;
            }
            .message {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 20px;
            }
            .validity {
              font-size: 14px;
              color: #6b7280;
              margin-top: 20px;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 15px;
              margin-top: 30px;
              border-radius: 4px;
            }
            .warning-text {
              font-size: 14px;
              color: #92400e;
              margin: 0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
            }
            .footer-text {
              font-size: 14px;
              color: #6b7280;
            }
            .brand {
              font-weight: bold;
              color: #2a4eff;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">GymPlify</div>
            </div>
            
            <p class="greeting">Hi there,</p>
            
            <p class="message">Your one-time verification code is:</p>
            
            <div class="otp-container">
              <div class="lock-icon">🔐</div>
              <div class="otp-label">VERIFICATION CODE</div>
              <div class="otp-code">${otp}</div>
              <p class="validity">This code is valid for the next <strong>5 minutes</strong>.</p>
            </div>
            
            <div class="warning">
              <p class="warning-text">
                <strong> Security Notice:</strong> If you did not request this verification code, 
                please ignore this message or contact our support team immediately.
              </p>
            </div>
            
            <div class="footer">
              <p class="footer-text">
                — The <span class="brand">GymPlify</span> Team
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error(" Resend error:", error);
      return res.status(500).json({error: "Failed to send email"});
    }

    console.log(" OTP resent successfully:", data);

    return res.status(200).json({
      message: "OTP resent successfully",
      otpId: otpDoc.id,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error(" Error in resendOTP:", error);
    return res.status(500).json({
      error: "Failed to resend OTP",
      details: error.message,
    });
  }
});

// ============================================
// LOGIN ATTEMPT TRACKING & RATE LIMITING
// ============================================

/**
 * Cloud Function: checkLoginAttempts
 * Checks if a user is locked out due to too many failed login attempts
 * Returns lockout status and remaining lockout time
 */
exports.checkLoginAttempts = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {email} = req.body;

    if (!email) {
      return res.status(400).json({error: "Email is required"});
    }

    const normalizedEmail = email.toLowerCase();
    const attemptsRef = admin.firestore().collection("loginAttempts").doc(normalizedEmail);
    const attemptDoc = await attemptsRef.get();

    // If no attempts recorded, user is not locked out
    if (!attemptDoc.exists) {
      return res.status(200).json({
        isLockedOut: false,
        attempts: 0,
      });
    }

    const data = attemptDoc.data();
    const {failedAttempts, lockedUntil} = data;

    // Check if lockout period is still active
    if (lockedUntil && lockedUntil.toDate() > new Date()) {
      const remainingMinutes = Math.ceil((lockedUntil.toDate() - new Date()) / 60000);
      return res.status(200).json({
        isLockedOut: true,
        attempts: failedAttempts || 0,
        lockedUntilMinutes: remainingMinutes,
        lockedUntil: lockedUntil.toDate().toISOString(),
      });
    }

    // Lockout period expired, return current attempts
    return res.status(200).json({
      isLockedOut: false,
      attempts: failedAttempts || 0,
    });
  } catch (error) {
    console.error(" Error checking login attempts:", error);
    return res.status(500).json({
      error: "Failed to check login attempts",
      details: error.message,
    });
  }
});

/**
 * Cloud Function: recordLoginAttempt
 * Records a failed or successful login attempt
 * Locks account for 15 minutes after 5 failed attempts
 */
exports.recordLoginAttempt = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {email, success} = req.body;

    if (!email || success === undefined) {
      return res.status(400).json({error: "Email and success status are required"});
    }

    const normalizedEmail = email.toLowerCase();
    const attemptsRef = admin.firestore().collection("loginAttempts").doc(normalizedEmail);

    // If login was successful, clear all attempts
    if (success) {
      await attemptsRef.delete();
      console.log(" Login successful, attempts cleared for:", normalizedEmail);
      return res.status(200).json({
        message: "Login attempts cleared",
        attempts: 0,
      });
    }

    // Failed login: increment attempts
    const attemptDoc = await attemptsRef.get();
    const now = admin.firestore.Timestamp.now();

    if (!attemptDoc.exists) {
      // First failed attempt
      await attemptsRef.set({
        email: normalizedEmail,
        failedAttempts: 1,
        lastAttempt: now,
        createdAt: now,
      });
      console.log(" First failed login attempt for:", normalizedEmail);
      return res.status(200).json({
        message: "Failed attempt recorded",
        attempts: 1,
        remainingAttempts: 3,
      });
    }

    // Increment failed attempts
    const data = attemptDoc.data();
    const newAttempts = (data.failedAttempts || 0) + 1;

    // Lock account if 4 or more failed attempts (user gets 5 total tries)
    if (newAttempts >= 4) {
      const lockoutUntil = new Date();
      lockoutUntil.setMinutes(lockoutUntil.getMinutes() + 15); // 15 minute lockout

      await attemptsRef.update({
        failedAttempts: newAttempts,
        lastAttempt: now,
        lockedUntil: admin.firestore.Timestamp.fromDate(lockoutUntil),
      });

      console.log(" Account locked for 15 minutes:", normalizedEmail);
      return res.status(200).json({
        message: "Account locked due to too many failed attempts",
        attempts: newAttempts,
        remainingAttempts: 0, // Add this so mobile can show "One attempt left"
        lockedUntilMinutes: 15,
        lockedUntil: lockoutUntil.toISOString(),
      });
    }

    // Update failed attempts (not locked yet)
    await attemptsRef.update({
      failedAttempts: newAttempts,
      lastAttempt: now,
    });

    console.log(` Failed login attempt ${newAttempts} for:`, normalizedEmail);
    return res.status(200).json({
      message: "Failed attempt recorded",
      attempts: newAttempts,
      remainingAttempts: 4 - newAttempts,
    });
  } catch (error) {
    console.error(" Error recording login attempt:", error);
    return res.status(500).json({
      error: "Failed to record login attempt",
      details: error.message,
    });
  }
});

// ============================================================================
// SUBSCRIPTION EXPIRY NOTIFICATIONS (Daily Scheduled Check)
// ============================================================================

/**
 * Utility: Calculate remaining days for a subscription
 */
function calculateRemainingDays(endDate) {
  if (!endDate) return 0;
  const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
  const now = new Date();
  
  // Set both dates to start of day for accurate comparison
  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  );
  const nowOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  
  const diffTime = endDateOnly.getTime() - nowOnly.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
}

/**
 * Utility: Check if subscription is expired
 */
function isSubscriptionExpired(endDate) {
  if (!endDate) return false;
  const end = endDate.toDate ? endDate.toDate() : new Date(endDate);
  const now = new Date();
  
  // Set both dates to start of day for accurate comparison
  const endDateOnly = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  );
  const nowOnly = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );
  
  return endDateOnly < nowOnly;
}

/**
 * Cloud Function: checkSubscriptionExpiry
 * Runs daily at 9:00 AM to check subscription expiry and send notifications
 * Cron format: "0 9 * * *" (every day at 9:00 AM UTC)
 */
exports.checkSubscriptionExpiry = functions.pubsub
  .schedule("0 9 * * *") // Run daily at 9:00 AM UTC
  .timeZone("UTC")
  .onRun(async (context) => {
    try {
      console.log(" Starting daily subscription expiry check...");
      
      const db = admin.firestore();
      const now = admin.firestore.Timestamp.now();
      
      // Get all active subscriptions
      const subscriptionsSnapshot = await db
        .collection("subscriptions")
        .where("status", "==", "active")
        .get();
      
      console.log(` Found ${subscriptionsSnapshot.size} active subscriptions to check`);
      
      let notificationsSent = 0;
      let notificationsSkipped = 0;
      
      for (const subscriptionDoc of subscriptionsSnapshot.docs) {
        try {
          const subscription = subscriptionDoc.data();
          const subscriptionId = subscriptionDoc.id;
          const userId = subscription.userId;
          const endDate = subscription.endDate;
          
          if (!endDate || !userId) {
            console.log(` Skipping subscription ${subscriptionId}: missing endDate or userId`);
            continue;
          }
          
          // Calculate remaining days
          const remainingDays = calculateRemainingDays(endDate);
          const isExpired = isSubscriptionExpired(endDate);
          
          // Get user data
          const userDoc = await db.collection("users").doc(userId).get();
          if (!userDoc.exists) {
            console.log(` User ${userId} not found, skipping subscription ${subscriptionId}`);
            continue;
          }
          
          const userData = userDoc.data();
          const userName = userData.displayName || userData.name || "User";
          const planName = subscription.planName || "subscription";
          
          // Check if we've already sent a notification for this threshold
          const lastExpiryNotification = subscription.lastExpiryNotification || {};
          const lastNotifiedDays = lastExpiryNotification.daysRemaining;
          
          // Only send notification if:
          // 1. We haven't sent one for this threshold yet (lastNotifiedDays is undefined or different)
          // 2. OR if it's expired and we haven't sent expired notification yet
          const shouldSendForExpired = isExpired && (lastNotifiedDays === undefined || lastNotifiedDays !== 0);
          const shouldSendFor1Day = remainingDays === 1 && (lastNotifiedDays === undefined || lastNotifiedDays !== 1);
          const shouldSendFor2Days = remainingDays === 2 && (lastNotifiedDays === undefined || lastNotifiedDays !== 2);
          const shouldSendFor3Days = remainingDays === 3 && (lastNotifiedDays === undefined || lastNotifiedDays !== 3);
          
          let shouldSendNotification = false;
          let notificationType = "";
          let notificationTitle = "";
          let notificationMessage = "";
          
          if (shouldSendForExpired) {
            shouldSendNotification = true;
            notificationType = "subscription_expired";
            notificationTitle = "Subscription Expired ";
            notificationMessage = `Your ${planName} subscription has expired. Please renew to continue using gym services.`;
          } else if (shouldSendFor1Day) {
            shouldSendNotification = true;
            notificationType = "subscription_expiring_soon";
            notificationTitle = "Subscription Expiring Tomorrow ⏰";
            notificationMessage = `Your ${planName} subscription expires in 1 day. Renew now to avoid interruption.`;
          } else if (shouldSendFor2Days) {
            shouldSendNotification = true;
            notificationType = "subscription_expiring_soon";
            notificationTitle = "Subscription Expiring Soon ⏰";
            notificationMessage = `Your ${planName} subscription expires in 2 days. Renew now to continue enjoying gym services.`;
          } else if (shouldSendFor3Days) {
            shouldSendNotification = true;
            notificationType = "subscription_expiring_soon";
            notificationTitle = "Subscription Expiring Soon ⏰";
            notificationMessage = `Your ${planName} subscription expires in 3 days. Renew now to continue enjoying gym services.`;
          }
          
          console.log(` Checking subscription ${subscriptionId}:`, {
            userId,
            planName: subscription.planName,
            endDate: endDate.toDate ? endDate.toDate().toISOString() : endDate,
            remainingDays,
            isExpired,
            lastNotifiedDays,
            shouldSendNotification,
            notificationType,
          });
          
          if (shouldSendNotification) {
            // Create notification document (this will trigger FCM push via sendPushNotification)
            await db.collection("notifications").add({
              userId: userId,
              type: notificationType,
              title: notificationTitle,
              message: notificationMessage,
              subscriptionId: subscriptionId,
              priority: "high",
              actionUrl: "/subscriptions",
              read: false,
              timestamp: now,
            });
            
            // Update subscription to track that we've sent this notification
            await subscriptionDoc.ref.update({
              lastExpiryNotification: {
                daysRemaining: remainingDays,
                notifiedAt: now,
              },
              updatedAt: now,
            });
            
            // If expired, also update subscription status
            if (isExpired) {
              await subscriptionDoc.ref.update({
                status: "expired",
              });
            }
            
            notificationsSent++;
            console.log(` Sent ${notificationType} notification to user ${userId} (${remainingDays} days remaining)`);
          } else {
            notificationsSkipped++;
            console.log(` Skipped notification for subscription ${subscriptionId} (already notified for ${remainingDays} days)`);
          }
        } catch (error) {
          console.error(` Error processing subscription ${subscriptionDoc.id}:`, error);
          // Continue with next subscription
        }
      }
      
      console.log(` Subscription expiry check completed:`);
      console.log(`   - Notifications sent: ${notificationsSent}`);
      console.log(`   - Notifications skipped: ${notificationsSkipped}`);
      
      return null;
    } catch (error) {
      console.error(" Error in subscription expiry check:", error);
      throw error;
    }
  });

/**
 * Cloud Function: createStaff
 * Creates a staff account with Firebase Auth and Firestore
 */
exports.createStaff = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    console.log("=== CREATE STAFF REQUEST ===");
    console.log("Request body:", req.body);
    const {name, email, role, password} = req.body;

    if (!name || !email || !role || !password) {
      console.log("Validation failed - missing fields");
      return res.status(400).json({
        error: "Name, email, role, and password are required",
      });
    }

    console.log("Attempting to create staff account for:", email);

    // Check if user already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log("User already exists:", email);
      return res.status(400).json({
        error: "An account with this email already exists",
      });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        console.log("User not found, creating new user:", email);
        // User doesn't exist, create new user
        userRecord = await admin.auth().createUser({
          email,
          password,
          emailVerified: false,
        });
        console.log("User created successfully with UID:", userRecord.uid);
      } else {
        console.error("Error checking user:", error);
        throw error;
      }
    }

    // Set custom claims for admin role
    if (role.toLowerCase() === "admin") {
      console.log("Setting admin custom claims for:", email);
      await admin.auth().setCustomUserClaims(userRecord.uid, {admin: true});
    }

    // Write Firestore user document
    console.log("Writing to Firestore...");
    const db = admin.firestore();
    const userRef = db.collection("users").doc(userRecord.uid);
    await userRef.set(
      {
        uid: userRecord.uid,
        email,
        displayName: name,
        role: role.toLowerCase(), // Normalize to lowercase
        provider: "password",
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&bold=true`,
        lastLogout: null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );
    console.log("Firestore document created successfully");

    console.log("=== STAFF CREATED SUCCESSFULLY ===");
    return res.status(200).json({
      message: "Staff account created successfully",
      uid: userRecord.uid,
      email: userRecord.email,
      name: name,
      role: role,
    });
  } catch (error) {
    console.error("Error creating staff account:", error);
    console.error("Error details:", error.message);
    if (error.code === "auth/email-already-exists") {
      return res.status(400).json({
        error: "An account with this email already exists",
      });
    } else {
      return res.status(500).json({
        error: "Failed to create staff account",
      });
    }
  }
});

/**
 * Cloud Function: resetStaffPassword
 * Allows an admin to set a staff user's password by uid or email.
 * Body: { uid?: string, email?: string, newPassword: string }
 */
exports.resetStaffPassword = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({error: "Method not allowed"});
  }

  try {
    const {uid, email, newPassword} = req.body || {};

    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return res.status(400).json({error: "newPassword must be at least 6 characters"});
    }

    let targetUid = uid;
    if (!targetUid) {
      if (!email) {
        return res.status(400).json({error: "Provide uid or email"});
      }
      const userRecord = await admin.auth().getUserByEmail(String(email).toLowerCase());
      targetUid = userRecord.uid;
    }

    await admin.auth().updateUser(targetUid, {password: newPassword});

    // Optional: mark password change in Firestore
    try {
      await admin.firestore().collection("users").doc(targetUid).set(
        { lastPasswordChangeAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true },
      );
    } catch (_) {}

    return res.status(200).json({message: "Password updated"});
  } catch (error) {
    console.error(" Error in resetStaffPassword:", error);
    if (error.code === "auth/user-not-found") {
      return res.status(404).json({error: "User not found"});
    }
    return res.status(500).json({error: "Failed to update password"});
  }
});

/**
 * Cloud Function: checkSubscriptionExpiryManual (HTTP endpoint for testing)
 * Can be called manually to test subscription expiry notifications
 * Usage: POST https://[region]-[project].cloudfunctions.net/checkSubscriptionExpiryManual
 */
exports.checkSubscriptionExpiryManual = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET, POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  try {
    console.log(" Manual subscription expiry check triggered...");
    
    const db = admin.firestore();
    const now = admin.firestore.Timestamp.now();
    
    // Get all active subscriptions
    const subscriptionsSnapshot = await db
      .collection("subscriptions")
      .where("status", "==", "active")
      .get();
    
    console.log(` Found ${subscriptionsSnapshot.size} active subscriptions to check`);
    
    let notificationsSent = 0;
    let notificationsSkipped = 0;
    const results = [];
    
    for (const subscriptionDoc of subscriptionsSnapshot.docs) {
      try {
        const subscription = subscriptionDoc.data();
        const subscriptionId = subscriptionDoc.id;
        const userId = subscription.userId;
        const endDate = subscription.endDate;
        
        if (!endDate || !userId) {
          console.log(` Skipping subscription ${subscriptionId}: missing endDate or userId`);
          continue;
        }
        
        // Calculate remaining days
        const remainingDays = calculateRemainingDays(endDate);
        const isExpired = isSubscriptionExpired(endDate);
        
        // Get user data
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) {
          console.log(` User ${userId} not found, skipping subscription ${subscriptionId}`);
          continue;
        }
        
        const userData = userDoc.data();
        const userName = userData.displayName || userData.name || "User";
        const planName = subscription.planName || "subscription";
        
        // Check if we've already sent a notification for this threshold
        const lastExpiryNotification = subscription.lastExpiryNotification || {};
        const lastNotifiedDays = lastExpiryNotification.daysRemaining;
        
        // Only send notification if:
        // 1. We haven't sent one for this threshold yet (lastNotifiedDays is undefined or different)
        // 2. OR if it's expired and we haven't sent expired notification yet
        const shouldSendForExpired = isExpired && (lastNotifiedDays === undefined || lastNotifiedDays !== 0);
        const shouldSendFor1Day = remainingDays === 1 && (lastNotifiedDays === undefined || lastNotifiedDays !== 1);
        const shouldSendFor2Days = remainingDays === 2 && (lastNotifiedDays === undefined || lastNotifiedDays !== 2);
        const shouldSendFor3Days = remainingDays === 3 && (lastNotifiedDays === undefined || lastNotifiedDays !== 3);
        
        let shouldSendNotification = false;
        let notificationType = "";
        let notificationTitle = "";
        let notificationMessage = "";
        
        if (shouldSendForExpired) {
          shouldSendNotification = true;
          notificationType = "subscription_expired";
          notificationTitle = "Subscription Expired ";
          notificationMessage = `Your ${planName} subscription has expired. Please renew to continue using gym services.`;
        } else if (shouldSendFor1Day) {
          shouldSendNotification = true;
          notificationType = "subscription_expiring_soon";
          notificationTitle = "Subscription Expiring Tomorrow ⏰";
          notificationMessage = `Your ${planName} subscription expires in 1 day. Renew now to avoid interruption.`;
        } else if (shouldSendFor2Days) {
          shouldSendNotification = true;
          notificationType = "subscription_expiring_soon";
          notificationTitle = "Subscription Expiring Soon ⏰";
          notificationMessage = `Your ${planName} subscription expires in 2 days. Renew now to continue enjoying gym services.`;
        } else if (shouldSendFor3Days) {
          shouldSendNotification = true;
          notificationType = "subscription_expiring_soon";
          notificationTitle = "Subscription Expiring Soon ⏰";
          notificationMessage = `Your ${planName} subscription expires in 3 days. Renew now to continue enjoying gym services.`;
        }
        
        console.log(` Checking subscription ${subscriptionId}:`, {
          userId,
          planName: subscription.planName,
          endDate: endDate.toDate ? endDate.toDate().toISOString() : endDate,
          remainingDays,
          isExpired,
          lastNotifiedDays,
          shouldSendNotification,
          notificationType,
        });
        
        if (shouldSendNotification) {
          // Create notification document (this will trigger FCM push via sendPushNotification)
          await db.collection("notifications").add({
            userId: userId,
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            subscriptionId: subscriptionId,
            priority: "high",
            actionUrl: "/subscriptions",
            read: false,
            timestamp: now,
          });
          
          // Update subscription to track that we've sent this notification
          await subscriptionDoc.ref.update({
            lastExpiryNotification: {
              daysRemaining: remainingDays,
              notifiedAt: now,
            },
            updatedAt: now,
          });
          
          // If expired, also update subscription status
          if (isExpired) {
            await subscriptionDoc.ref.update({
              status: "expired",
            });
          }
          
          notificationsSent++;
          results.push({
            userId,
            userName,
            subscriptionId,
            remainingDays,
            notificationType,
            status: "sent",
          });
          console.log(` Sent ${notificationType} notification to user ${userId} (${remainingDays} days remaining)`);
        } else {
          notificationsSkipped++;
          results.push({
            userId,
            userName,
            subscriptionId,
            remainingDays,
            lastNotifiedDays,
            status: "skipped",
          });
          console.log(` Skipped notification for subscription ${subscriptionId} (already notified for ${remainingDays} days)`);
        }
      } catch (error) {
        console.error(` Error processing subscription ${subscriptionDoc.id}:`, error);
        results.push({
          subscriptionId: subscriptionDoc.id,
          status: "error",
          error: error.message,
        });
      }
    }
    
    console.log(` Subscription expiry check completed:`);
    console.log(`   - Notifications sent: ${notificationsSent}`);
    console.log(`   - Notifications skipped: ${notificationsSkipped}`);
    
    return res.status(200).json({
      success: true,
      message: "Subscription expiry check completed",
      notificationsSent,
      notificationsSkipped,
      results,
    });
  } catch (error) {
    console.error(" Error in subscription expiry check:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to check subscription expiry",
      details: error.message,
    });
  }
});

