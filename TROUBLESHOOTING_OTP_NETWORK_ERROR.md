# 🔧 Troubleshooting: Network Error on Registration

## ❌ Error:
```
ERROR ❌ Authentication failed Network error. Please check your connection.
```

This error occurs when the mobile app cannot connect to your backend server.

---

## 🔍 Step-by-Step Fix

### **Step 1: Verify Backend is Running**

1. **Open a NEW terminal/command prompt**
2. Navigate to backend:
   ```bash
   cd C:\GymPlify\backend
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

4. **You should see this:**
   ```
   FIREBASE PROJECT ID: gymplify-554c8
   Server listening on port 4000
   ```

5. **Keep this terminal open!** The server must stay running while testing the mobile app.

---

### **Step 2: Test Backend is Accessible**

**Open a NEW terminal** (keep the backend running in the first terminal):

**Test with curl:**
```bash
curl http://localhost:4000
```

**Expected response:**
```
GymPlify API is running
```

**If this doesn't work:**
- Backend is not running properly
- Port 4000 might be in use by another app
- Firewall is blocking port 4000

---

### **Step 3: Determine Your Device Type**

**Are you testing on:**
- [ ] **Android Emulator** (AVD in Android Studio)
- [ ] **iOS Simulator** (Xcode Simulator)
- [ ] **Physical Android Device** (real phone connected via USB or WiFi)
- [ ] **Physical iPhone** (real phone connected)

---

### **Step 4: Update API URL Based on Device**

Edit: `mobile/src/constants/Config.js`

#### **Option A: Android Emulator** (Most Common)

```javascript
export const API_URL = 'http://10.0.2.2:4000'; // Android Emulator
```

**Why 10.0.2.2?** This is a special IP that Android Emulator uses to access your computer's localhost.

#### **Option B: iOS Simulator**

```javascript
export const API_URL = 'http://localhost:4000'; // iOS Simulator
```

#### **Option C: Physical Device (Android or iOS)**

**First, find your computer's local IP address:**

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active WiFi/Ethernet adapter (e.g., `192.168.1.100`)

**On Mac/Linux:**
```bash
ifconfig
```
Look for "inet" (e.g., `192.168.1.100`)

**Then update Config.js:**
```javascript
export const API_URL = 'http://192.168.1.100:4000'; // Replace with YOUR IP
```

**⚠️ IMPORTANT for Physical Devices:**
- Your phone and computer MUST be on the **same WiFi network**
- Your firewall must allow connections on port 4000

---

### **Step 5: Allow Firewall Access (If Using Physical Device)**

**Windows Firewall:**
1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" → Specific local ports: `4000` → Next
6. Select "Allow the connection" → Next
7. Check all profiles (Domain, Private, Public) → Next
8. Name: "GymPlify Backend" → Finish

**Mac Firewall:**
```bash
sudo ufw allow 4000
```

---

### **Step 6: Rebuild Mobile App**

After changing `Config.js`, you MUST rebuild:

```bash
cd mobile

# For Android
npx expo run:android

# For iOS
npx expo run:ios
```

**⚠️ Don't just refresh!** Configuration changes require a full rebuild.

---

### **Step 7: Test Registration Again**

1. Open mobile app
2. Click **"Sign up"**
3. Enter:
   - Name: Test User
   - Email: your-real-email@example.com
   - Password: Test123!@#
4. Click **"Create account"**
5. **Watch the backend terminal** - you should see:
   ```
   OTP sent to your-email@example.com, Document ID: xxxxx
   OTP email sent successfully: { id: 'xxxxx' }
   ```

6. Check your email for OTP code
7. Enter 6-digit code
8. ✅ Success!

---

## 🧪 Quick Network Test

**Test if mobile can reach backend:**

### **Method 1: Using Browser on Physical Device**

On your physical phone, open browser and go to:
```
http://YOUR_COMPUTER_IP:4000
```

Example: `http://192.168.1.100:4000`

**Should show:** "GymPlify API is running"

### **Method 2: Using Android Emulator Browser**

Open Chrome in emulator and go to:
```
http://10.0.2.2:4000
```

**Should show:** "GymPlify API is running"

---

## 🐛 Common Issues & Solutions

### Issue 1: Port 8081 already in use (Metro bundler)

**Error:**
```
Port 8081 is being used by another process
```

**Fix:**
```bash
# Kill the process using port 8081
netstat -ano | findstr :8081
taskkill /PID <PID_NUMBER> /F

# Or just use port 8082
npx expo start --port 8082
```

### Issue 2: Backend not starting

**Error:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Fix:**
```bash
# Kill process using port 4000
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F

# Then restart backend
npm start
```

### Issue 3: "Cannot find module 'resend'"

**Fix:**
```bash
cd backend
npm install
npm start
```

### Issue 4: Still getting network error after all fixes

**Check:**
1. ✅ Backend is running (terminal shows "Server listening on port 4000")
2. ✅ API_URL matches your device type (Android Emulator = 10.0.2.2:4000)
3. ✅ You rebuilt the mobile app after changing Config.js
4. ✅ Firewall allows port 4000 (for physical devices)
5. ✅ Phone and computer on same WiFi (for physical devices)

**Debug:**
Add console log to mobile app to see what URL it's using:

Edit `mobile/src/services/otpService.js`:
```javascript
export async function sendOTP(email) {
  console.log('🔍 Sending OTP to:', API_URL); // Add this line
  try {
    const response = await axios.post(`${API_URL}/auth/send-otp`, {
      email: email.toLowerCase(),
    });
    return response.data;
  } catch (error) {
    console.log('❌ OTP Error:', error); // Add this line
    // ... rest of code
  }
}
```

Check React Native console for the logs.

---

## ✅ Checklist Before Testing

- [ ] Backend server is running (`npm start` in backend folder)
- [ ] Backend shows: "Server listening on port 4000"
- [ ] `mobile/src/constants/Config.js` has correct API_URL for your device
- [ ] Mobile app rebuilt after changing Config.js (`npx expo run:android`)
- [ ] (Physical device only) Computer's firewall allows port 4000
- [ ] (Physical device only) Phone and computer on same WiFi
- [ ] (Physical device only) Using correct computer IP address

---

## 📞 Still Not Working?

**Share this information:**
1. Device type (Android Emulator / iOS Simulator / Physical Device)
2. API_URL in Config.js
3. Backend terminal output
4. Mobile app error (screenshot or full error message)
5. Can you access `http://localhost:4000` in your browser?

**Most Common Solution:**
- **Android Emulator** → Use `http://10.0.2.2:4000`
- **iOS Simulator** → Use `http://localhost:4000`  
- **Physical Device** → Use `http://YOUR_COMPUTER_IP:4000` (e.g., `192.168.1.100:4000`)

Then **rebuild** the app: `npx expo run:android`

---

## 🎯 Quick Fix Summary

1. **Start backend:** `cd backend && npm start`
2. **Identify device type:** Android Emulator / iOS Simulator / Physical Device
3. **Update API_URL** in `mobile/src/constants/Config.js`
4. **Rebuild mobile app:** `npx expo run:android`
5. **Test registration** with your real email

That's it! 🚀

