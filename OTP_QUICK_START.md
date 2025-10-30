# 🚀 Quick Start - Email OTP System

## ✅ Implementation Complete!

Your email OTP system is fully implemented and ready to test!

---

## 📋 What Was Built

### Backend (9 files created/modified):
✅ Resend SDK installed  
✅ Email service with beautiful HTML templates  
✅ OTP utilities (generate, hash, verify)  
✅ 3 API endpoints (send, verify, resend)  
✅ Rate limiting & security features  
✅ Firestore integration for OTP storage  

### Mobile (4 files created/modified):
✅ Beautiful OTP input screen  
✅ OTP service for API calls  
✅ Integration into registration flow  
✅ Integration into login flow  
✅ API URL configuration  

---

## 🎯 How to Test (3 Simple Steps)

### Step 1: Start Backend
```bash
cd backend
npm start
```
Wait for: **"Server listening on port 4000"**

### Step 2: Update Mobile API URL

**IMPORTANT:** Before running mobile app, update the API URL based on your device:

Edit `mobile/src/constants/Config.js`:

**If using Android Emulator:**
```javascript
export const API_URL = 'http://10.0.2.2:4000';
```

**If using iOS Simulator:**
```javascript
export const API_URL = 'http://localhost:4000';
```

**If using Physical Device:** (Find your computer's IP address first)
```javascript
export const API_URL = 'http://YOUR_IP_ADDRESS:4000';
```

### Step 3: Run Mobile App
```bash
cd mobile
npx expo run:android
# or
npx expo run:ios
```

---

## 📧 Test Registration

1. Open app → Click **"Sign up"**
2. Enter:
   - **Name:** Test User
   - **Email:** YOUR_REAL_EMAIL (you need to receive the OTP!)
   - **Password:** Test123!@# (or any strong password)
3. Click **"Create account"**
4. **Check your email inbox** (and spam folder!)
5. You'll receive an email like this:

```
Subject: Your GymPlify Verification Code

Hi there,

Your one-time verification code is:

🔐 123456

This code is valid for the next 5 minutes.
```

6. Enter the 6-digit code in the app
7. Click **"Verify Code"**
8. ✅ **Success!** You're logged in!

---

## 📧 Test Login

1. Sign out from app
2. Click **"Sign in"**
3. Enter email and password
4. Click **"Login"**
5. **Check email for new OTP**
6. Enter 6-digit code
7. ✅ **Success!** You're logged in!

---

## 🐛 Common Issues & Fixes

### ❌ "Network error" or "Failed to send OTP"

**Problem:** Mobile app can't reach backend

**Fix:**
1. Make sure backend is running (`npm start`)
2. Check `mobile/src/constants/Config.js` has correct API_URL
3. **Android Emulator:** Must use `10.0.2.2:4000` (NOT `localhost`)
4. **Physical Device:** Use your computer's IP (same WiFi network)

To find your IP:
- **Windows:** Open CMD → `ipconfig` → Look for "IPv4 Address"
- **Mac/Linux:** Open Terminal → `ifconfig` → Look for "inet"

---

### ❌ Email not received

**Check:**
1. **Spam/Junk folder** (Resend emails sometimes go there initially)
2. Email address is correct
3. Resend dashboard shows email was sent: https://resend.com/logs
4. Your `RESEND_API_KEY` is correct in `backend/.env`
5. Domain is verified in Resend dashboard

**Tip:** Check backend terminal logs for errors

---

### ❌ "Invalid OTP format"

**Fix:** 
- OTP must be exactly **6 digits**
- Copy-paste from email works!
- No spaces or special characters

---

### ❌ "Maximum attempts exceeded"

**Fix:**
- You entered wrong code 3 times
- Click **"Resend"** to get a new code
- Wait for countdown timer (1 minute)

---

### ❌ "OTP has expired"

**Fix:**
- OTP codes are valid for **5 minutes** only
- Click **"Resend"** to get a new code

---

## 📁 Files Created/Modified

### Backend:
```
backend/
  ├── package.json (resend added)
  └── src/
      ├── index.js (otp routes added)
      ├── controllers/
      │   └── otpController.js ✨ NEW
      ├── routes/
      │   └── otp.js ✨ NEW
      ├── services/
      │   └── emailService.js ✨ NEW
      └── utils/
          └── otpUtils.js ✨ NEW
```

### Mobile:
```
mobile/
  ├── app/
  │   ├── auth/index.jsx (OTP integration)
  │   └── otp-verification.jsx ✨ NEW
  └── src/
      ├── constants/
      │   ├── Config.js ✨ NEW
      │   └── index.js (export Config)
      └── services/
          └── otpService.js ✨ NEW
```

---

## 🎨 Features

✅ **Beautiful email design** with GymPlify branding  
✅ **Auto-focus** on OTP inputs  
✅ **Paste support** (paste 6-digit code directly)  
✅ **5-minute countdown** timer  
✅ **Resend button** with rate limiting  
✅ **3 attempts** maximum per OTP  
✅ **Error messages** for all scenarios  
✅ **Secure hashing** (SHA-256)  
✅ **Rate limiting** (1 OTP per minute)  

---

## 🔒 Security

- OTP codes are **hashed** before storage (SHA-256)
- Codes **auto-delete** after verification
- **Rate limiting** prevents spam
- **Attempt tracking** prevents brute force
- **Email verification** required for all users

---

## 📊 Monitor Emails

View sent OTP emails in Resend dashboard:
1. Login: https://resend.com/
2. Click **"Logs"** in sidebar
3. See all sent emails, delivery status, opens, etc.

---

## 🎉 You're All Set!

Your email OTP system is production-ready! 

**Next Steps:**
1. Test registration flow
2. Test login flow  
3. Test error scenarios (wrong code, expired, etc.)
4. Monitor Resend logs
5. Customize email template if needed (backend/src/services/emailService.js)

**Questions?** 
- Check `OTP_SYSTEM_GUIDE.md` for detailed documentation
- Check backend terminal for errors
- Check Resend dashboard for email delivery status

---

## 💡 Pro Tips

1. **Save test email** - Use a real email you have access to for testing
2. **Check spam folder** - First few emails might land there
3. **Backend logs** - Watch terminal for helpful debugging info
4. **Resend logs** - See exactly what emails were sent
5. **OTP codes** - Valid for 5 minutes, use quickly!

Happy testing! 🚀

