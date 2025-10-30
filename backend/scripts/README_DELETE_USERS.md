# 🗑️ User Deletion Script by Member ID Range

This script allows you to delete users by their `customMemberId` range and clean up all their associated data. It's the opposite of the `populateRealUsers.js` script.

## 🚀 Quick Start

```bash
# Delete users from MBR-00147 to MBR-00150
node scripts/deleteUsersByRange.js MBR-00147 MBR-00150

# Delete users from MBR-00001 to MBR-00010
node scripts/deleteUsersByRange.js MBR-00001 MBR-00010

# Delete a single user
node scripts/deleteUsersByRange.js MBR-00100 MBR-00100
```

## ⚠️ Important Safety Features

- **Double confirmation required** - You must type "DELETE" twice to confirm
- **Shows users before deletion** - Lists all users that will be deleted
- **Comprehensive cleanup** - Removes all associated data
- **Member ID counter update** - Automatically updates the counter
- **Detailed logging** - Shows exactly what was deleted

## 📊 What Gets Deleted

For each user in the range, the script removes:

### 🔐 Firebase Auth
- **User account** - Completely removed from Firebase Auth

### 📄 Firestore Documents
- **User document** - From `users` collection
- **Subscriptions** - All user's subscription records
- **Attendance records** - All gym check-in/check-out records
- **Notifications** - All user notifications
- **Requests** - All user requests (support, membership, etc.)
- **Sessions** - All user workout sessions (if in subcollection)

### 🔄 Counter Updates
- **Member ID counter** - Automatically updated to reflect deletions

## 🎯 Usage Examples

### Delete a Range of Users
```bash
# Delete users MBR-00147 through MBR-00150 (4 users)
node scripts/deleteUsersByRange.js MBR-00147 MBR-00150
```

### Delete a Single User
```bash
# Delete just MBR-00100
node scripts/deleteUsersByRange.js MBR-00100 MBR-00100
```

### Delete Many Users
```bash
# Delete users MBR-00001 through MBR-00050 (50 users)
node scripts/deleteUsersByRange.js MBR-00001 MBR-00050
```

## 🔒 Safety Confirmations

The script requires **two confirmations** before proceeding:

1. **First confirmation**: "Are you sure you want to delete these users? Type 'DELETE' to confirm:"
2. **Second confirmation**: After showing the list of users to be deleted

This prevents accidental deletions.

## 📋 Sample Output

```
==================================================
🗑️  GYMPLIFY USER DELETION BY MEMBER ID RANGE
==================================================
🎯 Deleting users from MBR-00147 to MBR-00150
📊 Range: 4 users
⚠️  This action cannot be undone!
==================================================

🔍 Finding users in the specified range...
✅ Found 4 users in range MBR-00147 to MBR-00150

👥 Users that will be deleted:
   1. Maria Santos (MBR-00147) - maria.santos@gmail.com
   2. Jose Reyes (MBR-00148) - jose.reyes@yahoo.com
   3. Ana Cruz (MBR-00149) - ana.cruz@outlook.com
   4. Pedro Bautista (MBR-00150) - pedro.bautista@gmail.com

⚠️  This will delete 4 users and all their associated data!

🗑️  Proceeding with deletion...

🗑️  Deleting user: Maria Santos (MBR-00147)
   ✅ Deleted Firebase Auth account for maria.santos@gmail.com
   ✅ Deleted 15 Firestore documents for Maria Santos

🗑️  Deleting user: Jose Reyes (MBR-00148)
   ✅ Deleted Firebase Auth account for jose.reyes@yahoo.com
   ✅ Deleted 12 Firestore documents for Jose Reyes

...

==================================================
📊 DELETION SUMMARY
==================================================
✅ Successfully deleted: 4 users
❌ Failed to delete: 0 users
📄 Total Firestore documents deleted: 58
🎯 Range: MBR-00147 to MBR-00150

✅ Deletion process completed!
🔄 Member ID counter has been updated
💡 You can now use the populate script to add new users
```

## 🛠️ Error Handling

The script handles various error scenarios:

- **User not found** - Continues with other users
- **Firebase Auth deletion fails** - Logs error but continues
- **Firestore deletion fails** - Logs error but continues
- **Invalid member ID format** - Exits with error message
- **Invalid range** - Exits with error message

## 🔄 Member ID Counter Management

The script automatically updates the member ID counter:

- **If deleting users at the end of range** - Updates counter to last remaining user
- **If deleting users in the middle** - Leaves counter unchanged
- **Maintains sequential numbering** - Ensures new users get proper IDs

## 🚨 Important Notes

### ⚠️ Irreversible Action
- **Cannot be undone** - Once deleted, data is permanently removed
- **Backup recommended** - Consider backing up data before deletion
- **Test with small ranges first** - Start with 1-2 users to test

### 🔒 Permissions Required
- **Firebase Admin SDK** - Requires service account with admin privileges
- **Firestore write access** - Needs permission to delete documents
- **Firebase Auth admin** - Needs permission to delete user accounts

### 📊 Data Integrity
- **Maintains referential integrity** - Removes all related data
- **Updates counters** - Keeps member ID counter accurate
- **Clean deletion** - No orphaned records left behind

## 🎯 Use Cases

### 🧹 Clean Up Test Data
```bash
# Delete test users created during development
node scripts/deleteUsersByRange.js MBR-00001 MBR-00050
```

### 🔄 Reset User Range
```bash
# Delete specific users to make room for new ones
node scripts/deleteUsersByRange.js MBR-00100 MBR-00199
```

### 🗑️ Remove Problematic Users
```bash
# Delete users with issues or invalid data
node scripts/deleteUsersByRange.js MBR-00200 MBR-00200
```

## 🔧 Troubleshooting

### Common Issues

1. **"No users found in range"**
   - Check if member IDs exist
   - Verify the range is correct
   - Users might have been already deleted

2. **"Permission denied"**
   - Check Firebase service account permissions
   - Ensure admin SDK is properly configured

3. **"Invalid member ID format"**
   - Use format: MBR-XXXXX (e.g., MBR-00147)
   - Ensure 5-digit number with leading zeros

### Getting Help

If you encounter issues:
1. Check the error messages in the console
2. Verify your Firebase configuration
3. Ensure you have proper permissions
4. Test with a single user first

## 📞 Support

This script is designed to be safe and comprehensive. Always test with small ranges first and ensure you have proper backups before running on production data.
