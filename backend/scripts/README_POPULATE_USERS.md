# 🏋️ Real User Data Population Script

This script populates your Firebase with realistic Filipino users who appear to have registered through your mobile app with the "client" role.

## 🚀 Quick Start

```bash
# Create 50 users (default)
node scripts/populateRealUsers.js

# Create specific number of users
node scripts/populateRealUsers.js 100
```

## 🔐 What It Creates

### 🔐 Firebase Authentication
- **Real Firebase Auth users** - Complete authentication accounts
- **Email/password authentication** - Users can actually log in
- **Email verified** - All users marked as verified
- **Realistic credentials** - Generated passwords for each user

### 📄 Firestore Collections

#### 👥 Users Collection
- **Realistic Filipino names** (Maria Santos, Jose Reyes, etc.)
- **Realistic email addresses** (maria.santos@gmail.com, etc.)
- **Client role** for all users
- **Custom Member IDs** (MBR-00001, MBR-00002, etc.)
- **QR codes** for gym check-ins
- **Profile photos** using UI Avatars
- **Proper timestamps** (createdAt, lastLogin, etc.)

#### 📋 Subscriptions Collection
- **Realistic subscription data** for each user
- **Mix of subscription plans** (Walk-in, Monthly, Coaching)
- **Various subscription statuses** (active, expired)
- **Realistic start/end dates**
- **Linked to gym locations**

#### 🏃 Attendance Collection
- **Realistic gym visit records**
- **Check-in/check-out times** (6 AM to 6 PM)
- **Session durations** (30-150 minutes)
- **Proper QR code values**
- **Linked to users and subscriptions**

### 🏢 Gyms Collection
- **Multiple gym locations** (Main Branch, Ortigas, Quezon City)
- **Realistic addresses** in Metro Manila
- **Phone numbers**

## 🎯 Data Structure

The script creates data that exactly matches your mobile app's registration flow:

```javascript
// User document structure
{
  uid: "firebase_uid",
  email: "maria.santos@gmail.com",
  displayName: "Maria Santos",
  name: "Maria Santos",
  role: "client",
  provider: "password",
  photoURL: "https://ui-avatars.com/api/?name=Maria%20Santos&background=0D8ABC&color=fff&bold=true",
  qrCodeValue: "firebase_uid",
  customMemberId: "MBR-00001",
  createdAt: Timestamp,
  lastLogin: Timestamp,
  lastLogout: null
}
```

## 🔧 Features

- **Realistic Filipino Names**: Uses common Filipino first and last names
- **Proper Member IDs**: Sequential MBR-00001, MBR-00002, etc.
- **Subscription Variety**: Mix of all subscription plans
- **Attendance Patterns**: Realistic gym visit patterns
- **Gym Locations**: Multiple realistic gym locations
- **Error Handling**: Continues if individual users fail
- **Batch Operations**: Efficient Firestore operations

## 📱 Mobile App Compatibility

All generated data is compatible with your mobile app:
- ✅ Users can log in with generated credentials
- ✅ QR codes work for gym check-ins
- ✅ Subscriptions display correctly
- ✅ Attendance history shows properly
- ✅ Profile photos display correctly

## 🎨 Sample Output

```
==================================================
🏋️  GYMPLIFY REAL USER DATA POPULATION
==================================================
📊 Creating 50 realistic Filipino users
🎯 All users will have 'client' role
📱 Data structure matches mobile app registration
==================================================

🏢 Setting up gym locations...
✅ Created gym: GymPlify Main Branch
✅ Created gym: GymPlify Ortigas
✅ Created gym: GymPlify Quezon City

🚀 Creating 50 realistic Filipino users...
✅ Created user 1/50: Maria Santos (MBR-00001)
✅ Created user 2/50: Jose Reyes (MBR-00002)
✅ Created user 3/50: Ana Cruz (MBR-00003)
...

🎉 User population complete!
📊 Summary:
   🔐 Firebase Auth users created: 50
   📄 Firestore user documents: 50
   📋 Subscriptions created: 50
   🏃 Attendance records created: 1,250

👥 Sample users created:
   1. Maria Santos (MBR-00001) - maria.santos@gmail.com
   2. Jose Reyes (MBR-00002) - jose.reyes@yahoo.com
   3. Ana Cruz (MBR-00003) - ana.cruz@outlook.com
   ... and 47 more users

🔑 Login credentials for first 3 users:
   1. Email: maria.santos@gmail.com | Password: [generated]
   2. Email: jose.reyes@yahoo.com | Password: [generated]
   3. Email: ana.cruz@outlook.com | Password: [generated]

✅ All done! Your Firebase now has realistic user data.
🚀 You can now test your mobile app with real-looking data.
```

## 🔒 Security Notes

- All users are created with **client role only**
- Passwords are randomly generated and secure
- Email addresses are realistic but not real
- No personal data is used
- All users are marked as email verified

## 🚨 Important

- **Backup your data** before running this script
- **Test with small numbers first** (e.g., 5 users)
- **Check Firebase quotas** if creating many users
- **Review generated data** to ensure it meets your needs

## 🛠️ Customization

You can modify the script to:
- Add more Filipino names
- Change gym locations
- Adjust subscription patterns
- Modify attendance patterns
- Add more realistic data variations

## 📞 Support

If you encounter any issues:
1. Check Firebase permissions
2. Verify service account key
3. Check Firebase quotas
4. Review error messages in console
