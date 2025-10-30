# 📧 Email OTP System - Complete Guide

## Overview
This system implements email-based One-Time Password (OTP) verification for user registration and login in the GymPlify mobile app.

---

## 🎯 Features

✅ **6-digit OTP codes** sent via email (using Resend)  
✅ **5-minute validity** period  
✅ **3 maximum attempts** per OTP  
✅ **Rate limiting** (1 OTP per minute per email)  
✅ **Secure hashing** (SHA-256)  
✅ **Beautiful email templates** with your branding  
✅ **Resend functionality** with countdown timer  
✅ **Auto-focus** and paste support for OTP input  

---

## 🏗️ Architecture

### Backend (Node.js + Express + Firebase)

**Files Created/Modified:**
1. `backend/src/services/emailService.js` - Resend email integration
2. `backend/src/utils/otpUtils.js` - OTP generation, hashing, validation
3. `backend/src/controllers/otpController.js` - Business logic
4. `backend/src/routes/otp.js` - API endpoints
5. `backend/src/index.js` - Route registration

**API Endpoints:**
- `POST /auth/send-otp` - Generate and send OTP
- `POST /auth/verify-otp` - Verify OTP code
- `POST /auth/resend-otp` - Resend new OTP

**Firestore Collection:**
```
otpCodes/
  {otpId}/
    - email: string (lowercase)
    - code: string (hashed)
    - createdAt: timestamp
    - expiresAt: timestamp
    - attempts: number (0-3)
    - verified: boolean
    - maxAttempts: number (3)
    - verifiedAt: timestamp (optional)
```

### Mobile (React Native + Expo)

**Files Created/Modified:**
1. `mobile/src/services/otpService.js` - API client
2. `mobile/src/constants/Config.js` - API URL configuration
3. `mobile/app/otp-verification.jsx` - OTP input screen
4. `mobile/app/auth/index.jsx` - Integration into auth flow

---

## 🚀 How It Works

### Registration Flow:
1. User enters email, name, password
2. System validates password requirements
3. Firebase creates user account
4. **Backend sends 6-digit OTP to email**
5. **User navigates to OTP verification screen**
6. **User enters OTP code (6 digits)**
7. **Backend verifies OTP**
8. User gains access to app

### Login Flow:
1. User enters email and password
2. Firebase authenticates credentials
3. **Backend sends 6-digit OTP to email**
4. **User navigates to OTP verification screen**
5. **User enters OTP code (6 digits)**
6. **Backend verifies OTP**
7. User gains access to app

---

## 🔧 Configuration

### Backend Environment Variables

Add these to `backend/.env`:

```env
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=noreply@gymplify.io
EMAIL_FROM_NAME=GymPlify Team
```

### Mobile API URL Configuration

Update `mobile/src/constants/Config.js` based on your environment:

**Android Emulator:**
```javascript
export const API_URL = 'http://10.0.2.2:4000';
```

**iOS Simulator:**
```javascript
export const API_URL = 'http://localhost:4000';
```

**Physical Device:** (use your computer's local IP)
```javascript
export const API_URL = 'http://192.168.1.100:4000'; // Replace with your IP
```

**Production:**
```javascript
export const API_URL = 'https://your-production-api.com';
```

---

## 🧪 Testing Guide

### Step 1: Start the Backend

```bash
cd backend
npm start
```

You should see: `Server listening on port 4000`

### Step 2: Start the Mobile App

```bash
cd mobile
npx expo run:android
# or
npx expo run:ios
```

### Step 3: Test Registration Flow

1. Open the app
2. Click **"Sign up"**
3. Enter:
   - Name: "Test User"
   - Email: Your real email address
   - Password: Create a strong password (meets all requirements)
4. Click **"Create account"**
5. Wait for OTP email (check inbox and spam folder)
6. Enter the 6-digit code from the email
7. Click **"Verify Code"**
8. ✅ You should be logged in!

### Step 4: Test Login Flow

1. Sign out from the app
2. Click **"Sign in"**
3. Enter your email and password
4. Click **"Login"**
5. Check your email for new OTP
6. Enter the 6-digit code
7. Click **"Verify Code"**
8. ✅ You should be logged in!

### Step 5: Test Error Scenarios

**Expired OTP:**
1. Request OTP
2. Wait 5+ minutes
3. Try to verify → Should show "OTP has expired"

**Wrong OTP:**
1. Request OTP
2. Enter wrong code (e.g., 000000)
3. Try 3 times → Should show "Maximum attempts exceeded"

**Resend OTP:**
1. Request OTP
2. Click "Resend" (after 1 minute)
3. Check email for new code
4. Verify with new code

---

## 📧 Email Template

Users receive this email:

```
Subject: Your GymPlify Verification Code

Hi there,

Your one-time verification code is:

🔐 123456

This code is valid for the next 5 minutes.

⚠️ Security Notice: If you did not request this verification code, 
please ignore this message or contact our support team immediately.

— The GymPlify Team
```

---

## 🔒 Security Features

1. **Hashed Storage** - OTP codes are hashed (SHA-256) before storage
2. **Rate Limiting** - Maximum 1 OTP per minute per email
3. **Attempt Limiting** - Maximum 3 verification attempts
4. **Auto-Expiration** - OTPs expire after 5 minutes
5. **One-Time Use** - Verified OTPs are marked and auto-deleted
6. **Case-Insensitive Email** - Prevents duplicate requests

---

## 🐛 Troubleshooting

### Issue: OTP email not received

**Check:**
1. Spam/junk folder
2. Email address is correct
3. Resend API key is valid
4. Domain is verified in Resend dashboard
5. Check backend logs for errors

### Issue: "Network error" on mobile

**Fix:**
1. Ensure backend is running (`npm start` in backend folder)
2. Check API_URL in `mobile/src/constants/Config.js`
3. For Android Emulator: Use `10.0.2.2:4000`
4. For iOS Simulator: Use `localhost:4000`
5. For Physical Device: Use your computer's IP address

### Issue: "Invalid OTP format"

**Fix:**
- OTP must be exactly 6 digits
- No spaces or special characters
- Try pasting directly from email

### Issue: "Maximum attempts exceeded"

**Fix:**
- Request a new OTP by clicking "Resend"
- Wait for the countdown timer

---

## 📊 Resend Dashboard

Monitor your OTP emails:
1. Login to https://resend.com/
2. Click **"Logs"** in sidebar
3. View sent emails, delivery status, and opens

**Free Tier Limits:**
- 100 emails/day
- 3,000 emails/month

---

## 🚀 Next Steps (Optional Enhancements)

1. **SMS OTP** - Add phone number verification
2. **Authenticator App** - Implement TOTP (Google Authenticator)
3. **Email Rate Limit UI** - Show countdown before allowing resend
4. **Analytics** - Track OTP conversion rates
5. **Custom Domain** - Use your own domain for professional emails
6. **Email Customization** - Add logo and brand colors

---

## 📝 Notes

- **Google Sign-In** bypasses OTP (already verified by Google)
- **Existing Users** will need OTP on their next login
- **OTP Codes** are deleted automatically after verification
- **Rate limiting** prevents spam and abuse

---

## 🎉 Success!

Your OTP system is now fully functional! Users will receive beautiful, branded OTP emails for secure authentication.

**Questions?** Check the backend logs and mobile console for debugging information.

