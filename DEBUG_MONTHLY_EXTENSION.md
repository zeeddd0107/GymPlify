# Debug: Monthly Extension Issue

## Quick Debug Steps

### Step 1: Check Web Console When Approving

When you approve a monthly→monthly extension:

1. **Open browser console (F12)** before approving
2. **Approve the subscription**
3. **Look for this log**:
   ```
   📊 Monthly Extension Summary: {
     originalMonthlyEndDate: "2025-XX-XX...",
     newMonthlyEndDate: "2025-XX-XX...",
     currentRemainingDays: X,
     newMonthlyDays: ~30,
     totalExtensionDays: X + 30,
     ...
   }
   ```

4. **Share these values:**
   - `currentRemainingDays`: ?
   - `newMonthlyDays`: ?
   - `totalExtensionDays`: ?

### Step 2: Check Firestore Database

1. Go to **Firebase Console** → **Firestore Database**
2. Find `subscriptions` collection
3. Find the user's subscription document
4. **BEFORE approving extension**:
   - Note the `endDate`
   - Note the `daysRemaining`

5. **AFTER approving extension**:
   - Check if `endDate` changed
   - Check if `daysRemaining` changed
   - Should see new fields: `extensionType`, `extensionDate`, etc.

### Step 3: Check Mobile App Logs

When mobile app fetches subscription data:
- Look for logs about fetching membership data
- Check what `endDate` value is being received

---

## Possible Issues

### Issue A: Update not saving to Firestore
**Symptom**: Firestore shows old endDate after approval
**Cause**: `updateDoc` failed silently
**Fix**: Check for errors in web console

### Issue B: Wrong subscription being updated
**Symptom**: Different subscription is updated
**Cause**: Multiple subscriptions exist
**Fix**: Verify correct subscription ID

### Issue C: Calculation is wrong
**Symptom**: totalExtensionDays = 31 instead of (current + 30)
**Cause**: Logic error in calculation
**Fix**: Check the math in console logs

---

## What to Share

Please provide:
1. **Web console log** (the Monthly Extension Summary)
2. **Firestore screenshot** (before and after approval)
3. **Mobile app current subscription details**:
   - How many days showing?
   - What was it before?
   - What should it be?

This will help me identify the exact issue!

