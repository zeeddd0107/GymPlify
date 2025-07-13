# Google OAuth Authentication Setup Guide for GymPlify

This guide will walk you through setting up Google OAuth authentication for your GymPlify application, allowing users to register and login using their legitimate Gmail accounts.

## Prerequisites

- Firebase project already configured
- Backend server running with Firebase Admin SDK
- Frontend React application with Firebase SDK

## Step 1: Firebase Console Configuration

### 1.1 Enable Google Sign-In Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your GymPlify project
3. Navigate to **Authentication** → **Sign-in method**
4. Click on **Google** provider
5. Enable it by toggling the switch
6. Add your **Project support email** (your email)
7. Click **Save**

### 1.2 Configure Authorized Domains

1. In the same Authentication section, go to **Settings** tab
2. Under **Authorized domains**, add:
   - `localhost` (for development)
   - Your production domain (e.g., `gymplify.com`)
3. Click **Save**

### 1.3 Get OAuth Client ID (Optional but Recommended)

1. Go to **Project Settings** → **General**
2. Scroll down to **Your apps** section
3. If you don't have a web app, click **Add app** → **Web**
4. Register your app and note the configuration

## Step 2: Environment Variables

Make sure your `.env` files are properly configured:

### Web App (.env in web/ directory)
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:4000
```

### Backend (.env in backend/ directory)
```env
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour Private Key\n-----END PRIVATE KEY-----\n"
```

## Step 3: Code Implementation

The following files have been updated to support Google authentication:

### Frontend Changes:
- `web/src/config/firebase.js` - Added Google Auth Provider
- `web/src/services/authService.js` - Added Google sign-in method
- `web/src/context/AuthProvider.jsx` - Added Google sign-in to context
- `web/src/components/LoginForm.jsx` - Added Google sign-in button
- `web/src/components/RegisterForm.jsx` - Added Google sign-in button

### Backend Changes:
- `backend/src/controllers/authController.js` - Added Google auth controller
- `backend/src/routes/auth.js` - Added Google auth route

### Mobile Changes:
- `mobile/src/firebase.js` - Added Google Auth Provider
- `mobile/src/authService.js` - Added Google sign-in method

## Step 4: Testing the Implementation

### 4.1 Start Your Servers

```bash
# Start backend server
cd backend
npm start

# Start frontend server (in another terminal)
cd web
npm run dev
```

### 4.2 Test Google Sign-In

1. Open your application in the browser
2. Go to the login or register page
3. Click the **"Continue with Google"** button
4. You should see a Google OAuth popup
5. Select your Gmail account
6. Grant permissions if prompted
7. You should be redirected back to your app and logged in

## Step 5: User Experience Features

### 5.1 What Users Get with Google Sign-In:

- **One-click authentication** - No need to remember passwords
- **Verified email addresses** - Google ensures email legitimacy
- **Profile information** - Name and profile picture automatically imported
- **Enhanced security** - Google's security measures protect users
- **Cross-platform consistency** - Same account works on web and mobile

### 5.2 User Flow:

1. User clicks "Continue with Google"
2. Google OAuth popup appears
3. User selects their Gmail account
4. User grants permissions to your app
5. Google returns user data to your app
6. Your backend creates/updates user record
7. User is automatically logged in
8. User is redirected to dashboard

## Step 6: Security Considerations

### 6.1 Best Practices:

- **Always verify tokens** on the backend
- **Store minimal user data** - only what you need
- **Implement proper session management**
- **Use HTTPS in production**
- **Regular security audits**

### 6.2 Data Privacy:

- Only request necessary permissions
- Clearly explain what data you're collecting
- Provide easy way to delete accounts
- Comply with GDPR/CCPA if applicable

## Step 7: Troubleshooting

### Common Issues:

1. **"popup_closed_by_user" error**
   - User closed the popup before completing sign-in
   - This is normal behavior, just show a message

2. **"auth/unauthorized-domain" error**
   - Domain not added to authorized domains in Firebase
   - Add your domain to Firebase Console

3. **"auth/popup-blocked" error**
   - Browser blocked the popup
   - Guide users to allow popups for your site

4. **Backend errors**
   - Check Firebase Admin SDK configuration
   - Verify environment variables
   - Check server logs for detailed errors

### Debug Mode:

To enable debug mode for Firebase Auth:

```javascript
// Add this to your Firebase config
firebase.auth().useDeviceLanguage();
firebase.auth().settings.appVerificationDisabledForTesting = true; // Only in development
```

## Step 8: Production Deployment

### 8.1 Update Authorized Domains:

1. Go to Firebase Console → Authentication → Settings
2. Add your production domain
3. Remove `localhost` if not needed

### 8.2 Environment Variables:

Update your production environment variables with production Firebase config.

### 8.3 SSL Certificate:

Ensure your production site uses HTTPS (required for OAuth).

## Step 9: Additional Features (Optional)

### 9.1 User Profile Management:

```javascript
// Get user profile data
const user = auth.currentUser;
console.log(user.displayName); // User's name
console.log(user.email); // User's email
console.log(user.photoURL); // User's profile picture
```

### 9.2 Account Linking:

Allow users to link multiple authentication methods to the same account.

### 9.3 Social Login Analytics:

Track which authentication methods users prefer.

## Step 10: Mobile Implementation

For React Native/Expo apps, you'll need additional setup:

1. Install `@react-native-google-signin/google-signin`
2. Configure Google Sign-In for iOS and Android
3. Update the mobile auth service to use native Google Sign-In

## Support and Resources

- [Firebase Authentication Documentation](https://firebase.google.com/docs/auth)
- [Google Identity Platform](https://developers.google.com/identity)
- [OAuth 2.0 Best Practices](https://tools.ietf.org/html/draft-ietf-oauth-security-topics)

## Conclusion

You now have a fully functional Google OAuth authentication system! Users can register and login using their legitimate Gmail accounts, providing a seamless and secure authentication experience.

The implementation includes:
- ✅ Google OAuth popup authentication
- ✅ Backend user management
- ✅ Frontend UI with Google sign-in buttons
- ✅ Mobile app support
- ✅ Error handling and user feedback
- ✅ Security best practices

Your users will now have a much better authentication experience with one-click Google sign-in! 