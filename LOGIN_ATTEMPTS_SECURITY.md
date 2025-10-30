# 🔒 Login Attempts Security System

## ✅ **What Was Implemented**

A comprehensive login attempt tracking system that prevents brute force attacks by locking accounts after 4 failed login attempts for 15 minutes. Users see clear messages showing remaining attempts (Three/Two/One attempts left) before lockout.

---

## 🎯 **Key Features**

✅ **5-Attempt Limit** - Users have 5 attempts to enter correct credentials  
✅ **15-Minute Lockout** - Account locked for 15 minutes after 4 failed attempts  
✅ **Auto-Reset** - Successful login clears all failed attempts  
✅ **Real-Time Tracking** - Failed attempts tracked instantly via Firebase  
✅ **User-Friendly Messages** - Shows remaining attempts and lockout time  
✅ **Registration Exempt** - Rate limiting only applies to login, not registration

---

## 📱 **How It Works**

### **Login Flow:**

```
1. User enters email & password
   ↓
2. System checks if account is locked
   ↓
3a. IF LOCKED:
    → Show lockout message with remaining time
    → Prevent login attempt
   ↓
3b. IF NOT LOCKED:
    → Attempt Firebase authentication
    ↓
4a. IF LOGIN SUCCESSFUL:
    → Record success (clears all attempts)
    → Send OTP for verification
    → Proceed to OTP screen
    ↓
4b. IF LOGIN FAILED:
    → Record failed attempt
    → Show error message
    → Lock account if 5th failed attempt
```

---

## 🔐 **Security Details**

### **Failed Attempt Tracking:**
- **Storage**: Firestore `loginAttempts` collection
- **Document ID**: User's email (lowercase, normalized)
- **Data Stored**:
  ```javascript
  {
    email: "user@example.com",
    failedAttempts: 3,
    lastAttempt: Timestamp,
    lockedUntil: Timestamp (only if locked),
    createdAt: Timestamp
  }
  ```

### **Lockout Rules:**
- **Attempts 1-3**: User can retry immediately (sees remaining attempts)
- **Attempt 4**: Account locked for 15 minutes after this failed attempt
- **Attempt 5**: Blocked with lockout message
- **After 15 minutes**: Lockout expires, user can try again
- **Successful login**: All failed attempts cleared

---

## 📍 **Files Changed/Created**

### **1. Firebase Cloud Functions** (`functions/index.js`)
- ✅ **`checkLoginAttempts`** - Checks if user is locked out
- ✅ **`recordLoginAttempt`** - Records failed/successful attempts

**URLs:**
- `https://us-central1-gymplify-554c8.cloudfunctions.net/checkLoginAttempts`
- `https://us-central1-gymplify-554c8.cloudfunctions.net/recordLoginAttempt`

### **2. Mobile Service** (`mobile/src/services/loginAttemptsService.js`)
Created new service to interact with Cloud Functions:
- `checkLoginAttempts(email)` - Check lockout status
- `recordLoginAttempt(email, success)` - Record attempt

### **3. Authentication Screen** (`mobile/app/auth/index.jsx`)
- ✅ Added login attempts checking before login
- ✅ Added failed attempt recording on login failure
- ✅ Added success recording on successful login
- ✅ Added lockout error messages with remaining time

---

## 🔔 **User Experience**

### **1st Failed Attempt:**
```
User sees: "Incorrect email or password. Please try again."
```

### **2nd Failed Attempt:**
```
User sees: "Incorrect email or password. Three attempts left."
```

### **3rd Failed Attempt:**
```
User sees: "Incorrect email or password. Two attempts left."
```

### **4th Failed Attempt (Account Gets Locked):**
```
User sees: "Incorrect email or password. One attempt left before your account is locked."
(Account is now locked for 15 minutes)
```

### **5th Try (During Lockout):**
```
User sees: "Too many failed login attempts. Your account is locked for 15 minutes. Please try again later."
```

### **During Lockout Period:**
```
User sees: "Too many failed login attempts. Your account is locked for 12 minutes. Please try again later."
(Time updates based on remaining lockout time)
```

### **After Lockout Expires:**
```
User can attempt login again normally.
Failed attempts counter resets to 0.
```

### **Successful Login:**
```
All failed attempts cleared.
User proceeds to OTP verification.
```

---

## 🧪 **Testing Scenarios**

### **Test 1: Remaining Attempts Display**
1. Enter wrong password → See "Three attempts left"
2. Enter wrong password → See "Two attempts left"
3. Enter wrong password → See "One attempt left"
4. Verify messages display correctly

### **Test 2: Account Lockout (4 Failed Attempts)**
1. Enter wrong password 4 times
2. On 5th try, see lockout message
3. Try to login immediately - blocked with lockout message

### **Test 3: Lockout Expiration**
1. Get locked out (4 failed attempts)
2. Wait 15 minutes
3. Try to login - should work normally
4. Attempts counter reset to 0

### **Test 4: Successful Login Clears Attempts**
1. Enter wrong password 2 times (see "Two attempts left")
2. Enter correct password on 3rd attempt
3. Login succeeds, proceed to OTP
4. All attempts cleared
5. Next login: start fresh with full 4 attempts

### **Test 5: Registration Not Affected**
1. Try to register with an email
2. No rate limiting applied
3. No attempt counting for registration
4. Registration works normally

---

## 📊 **Firestore Data Structure**

### **Collection: `loginAttempts`**

**Document ID**: `user@example.com` (normalized email)

**Fields:**
```javascript
{
  email: "user@example.com",           // Normalized email
  failedAttempts: 3,                    // Number of failed attempts
  lastAttempt: Timestamp,               // Last attempt time
  lockedUntil: Timestamp,               // Lock expiration time (only if locked)
  createdAt: Timestamp                  // First failed attempt time
}
```

**Example (Locked Account):**
```javascript
{
  email: "john@example.com",
  failedAttempts: 5,
  lastAttempt: "2025-10-23T10:30:00Z",
  lockedUntil: "2025-10-23T10:45:00Z",  // 15 minutes after 5th attempt
  createdAt: "2025-10-23T10:15:00Z"
}
```

**Example (Not Locked, 2 Failed Attempts):**
```javascript
{
  email: "jane@example.com",
  failedAttempts: 2,
  lastAttempt: "2025-10-23T11:00:00Z",
  createdAt: "2025-10-23T10:55:00Z"
}
```

**After Successful Login:**
```
Document deleted (attempts cleared)
```

---

## 🔍 **Error Messages**

### **Login Errors (with attempts tracking):**

| Scenario | User Sees |
|----------|-----------|
| 1st failed attempt | "Incorrect email or password. Please try again." |
| 2nd failed attempt | "Incorrect email or password. Three attempts left." |
| 3rd failed attempt | "Incorrect email or password. Two attempts left." |
| 4th failed attempt (lockout) | "Incorrect email or password. One attempt left before your account is locked." |
| 5th try (during lockout) | "Too many failed login attempts. Your account is locked for 15 minutes. Please try again later." |
| Try to login while locked | "Too many failed login attempts. Your account is locked for [X] minutes. Please try again later." |
| Successful login | Proceeds to OTP verification (no error) |
| Network error | "Network error. Please check your connection." |

---

## ⚙️ **Configuration**

### **Current Settings:**
- **Max Failed Attempts**: 4 (locks on 4th attempt, blocks on 5th try)
- **Total Tries Allowed**: 5 (4 password attempts + 1 lockout message)
- **Lockout Duration**: 15 minutes
- **Applies To**: Login only (not registration)
- **Remaining Attempts Display**: Yes (Three/Two/One attempts left)

### **To Change Settings:**

1. **Change Max Attempts** - Edit `functions/index.js`:
   ```javascript
   if (newAttempts >= 4) {  // Change 4 to your desired limit
     // Lock account
   }
   
   // Also update these lines:
   remainingAttempts: 3,  // First attempt (change based on your limit)
   remainingAttempts: 4 - newAttempts,  // Calculation (change 4 to your limit)
   ```

2. **Change Lockout Duration** - Edit `functions/index.js`:
   ```javascript
   lockoutUntil.setMinutes(lockoutUntil.getMinutes() + 15);  // Change 15 to desired minutes
   ```

3. **Re-deploy Functions:**
   ```bash
   firebase deploy --only functions
   ```

---

## 🛡️ **Security Benefits**

✅ **Prevents Brute Force Attacks** - Attackers can't try unlimited passwords  
✅ **Protects User Accounts** - Alerts users of unauthorized access attempts  
✅ **No User Action Required** - Automatic protection for all accounts  
✅ **Minimal User Friction** - 5 attempts is enough for legitimate users  
✅ **Time-Limited Lockout** - Users aren't permanently blocked  
✅ **Cloud-Based Tracking** - Works across all devices and platforms

---

## 📝 **Console Logs for Debugging**

**Successful Login:**
```
🔍 Checking login attempts for: user@example.com
🔍 Lockout status: { isLockedOut: false, attempts: 0 }
✅ Login successful, recording success
✅ [Login Attempts] Login successful, attempts cleared for: user@example.com
```

**1st Failed Login:**
```
🔍 Checking login attempts for: user@example.com
🔍 Lockout status: { isLockedOut: false, attempts: 0 }
❌ Login failed, recording failed attempt
📊 Attempt result: { attempts: 1, remainingAttempts: 3 }
❌ First failed login attempt for: user@example.com
```

**2nd Failed Login:**
```
🔍 Checking login attempts for: user@example.com
🔍 Lockout status: { isLockedOut: false, attempts: 1 }
❌ Login failed, recording failed attempt
📊 Attempt result: { attempts: 2, remainingAttempts: 2 }
❌ Failed login attempt 2 for: user@example.com
```

**4th Failed Login (Lockout Triggered):**
```
🔍 Checking login attempts for: user@example.com
🔍 Lockout status: { isLockedOut: false, attempts: 3 }
❌ Login failed, recording failed attempt
📊 Attempt result: { attempts: 4, lockedUntilMinutes: 15 }
🔒 Account locked for 15 minutes: user@example.com
```

**5th Attempted Login (While Locked):**
```
🔍 Checking login attempts for: user@example.com
🔍 Lockout status: { isLockedOut: true, attempts: 4, lockedUntilMinutes: 12 }
🔒 Account is locked
```

---

## 🚀 **Deployment Status**

✅ **Firebase Cloud Functions**: Deployed  
✅ **Mobile Service**: Created  
✅ **Auth Screen Integration**: Complete  
✅ **Error Messages**: Implemented  
✅ **Testing**: Ready for user testing

---

## ✅ **Status: COMPLETE**

The login attempts security system is fully implemented and deployed. Users are now protected from brute force attacks with automatic account lockouts after 5 failed login attempts.

**Last Updated:** October 2025  
**Version:** 1.0


