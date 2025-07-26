# Firestore Schema Guide

This document describes the recommended structure for Firestore collections, documents, and fields in the GymPlify project. Use this as a reference when designing and querying your Firestore database.

---

## 1. users (Collection)
Stores user profiles for all registered users (email/password, Google, etc).

**Document ID:** `uid` (Firebase Auth UID)

**Example Document:**
```json
{
  "uid": "abc123",
  "email": "user@example.com",
  "displayName": "John Doe",
  "photoURL": "https://...",
  "provider": "google", // or "password"
  "customMemberId": "MBR-00001", // Auto-generated for mobile users
  "qrCodeValue": "abc123", // Unique QR code value
  "createdAt": <timestamp>,
  "lastLogin": <timestamp>,
  "lastLogout": <timestamp>,
  "role": "client" // or "admin", "staff", etc.
}
```

---

## 2. gyms (Collection)
Stores information about gyms/locations.

**Document ID:** `gymId` (auto-generated or custom)

**Example Document:**
```json
{
  "name": "Downtown Gym",
  "address": "123 Main St, City, Country",
  "phone": "+1234567890",
  "createdAt": <timestamp>,
  "ownerId": "abc123" // Reference to users.uid
}
```

---

## 3. subscriptions (Collection)
Stores membership records for users at gyms.

**Document ID:** `membershipId` (auto-generated)

**Example Document:**
```json
{
  "userId": "abc123", // Reference to users.uid
  "gymId": "gym456", // Reference to gyms.gymId
  "type": "monthly", // or "annual", "day-pass"
  "startDate": <timestamp>,
  "endDate": <timestamp>,
  "status": "active" // or "expired", "cancelled"
}
```

---

## 4. sessions (Collection)
Stores workout or booking sessions for users.

**Document ID:** `sessionId` (auto-generated)

**Example Document:**
```json
{
  "userId": "abc123",
  "gymId": "gym456",
  "date": <timestamp>,
  "duration": 60, // in minutes
  "type": "workout", // or "class", "personal-training"
  "notes": "Leg day"
}
```

---

## 5. inventory (Collection)
Stores gym equipment or product inventory.

**Document ID:** `itemId` (auto-generated)

**Example Document:**
```json
{
  "gymId": "gym456",
  "name": "Treadmill",
  "quantity": 5,
  "status": "available" // or "maintenance"
}
```

---

## 6. requests (Collection)
Stores user requests (e.g., membership, support, etc).

**Document ID:** `requestId` (auto-generated)

**Example Document:**
```json
{
  "userId": "abc123",
  "type": "support", // or "membership", "equipment"
  "message": "I need help with my account.",
  "status": "open", // or "closed", "pending"
  "createdAt": <timestamp>
}
```

---

## 7. staff (Collection)
Stores staff member profiles for each gym.

**Document ID:** `staffId` (auto-generated or custom)

**Example Document:**
```json
{
  "userId": "abc123", // Reference to users.uid
  "gymId": "gym456", // Reference to gyms.gymId
  "role": "trainer", // or "manager", "receptionist"
  "hireDate": <timestamp>,
  "status": "active" // or "inactive"
}
```

---

## 8. subscriptions (Collection)
Stores user subscription/payment records.

**Document ID:** `subscriptionId` (auto-generated)

**Example Document:**
```json
{
  "userId": "abc123",
  "plan": "premium", // or "basic", "pro"
  "startDate": <timestamp>,
  "endDate": <timestamp>,
  "status": "active", // or "cancelled", "expired"
  "paymentMethod": "credit_card", // or "paypal"
  "amount": 29.99
}
```

---

## 9. notifications (Collection)
Stores notifications sent to users.

**Document ID:** `notificationId` (auto-generated)

**Example Document:**
```json
{
  "userId": "abc123",
  "title": "Welcome to GymPlify!",
  "body": "Your account has been created.",
  "read": false,
  "createdAt": <timestamp>
}
```

---

## 10. counters (Collection)
Stores auto-incrementing counters for generating unique IDs.

**Document ID:** `counterType` (e.g., "memberId", "subscriptionId")

**Example Document:**
```json
{
  "currentNumber": 42,
  "lastUpdated": <timestamp>
}
```

**Usage:**
- Used to generate sequential Member IDs (MBR-00001, MBR-00002, etc.)
- Ensures unique, human-readable IDs for mobile users
- Automatically incremented when new users register via mobile app

---

## 11. Example: Subcollections
You can nest subcollections under documents for more granular data organization.

**Example:**
- `users/{userId}/sessions/{sessionId}`
- `gyms/{gymId}/inventory/{itemId}`

**Example Document (users/{userId}/sessions/{sessionId}):**
```json
{
  "date": <timestamp>,
  "duration": 45,
  "type": "yoga",
  "notes": "Morning class"
}
```

---

## Best Practices & Tips
- Use server timestamps (`FieldValue.serverTimestamp()`) for all date fields.
- Use references (by storing IDs) to relate documents across collections.
- Use subcollections for data that is tightly coupled to a parent document (e.g., user sessions).
- Use consistent naming conventions for fields and collections.
- Secure your data with Firestore security rules.
- Index fields that you will query or sort on frequently.
- Avoid deeply nested subcollections unless necessary (Firestore is not a relational DB).
- Regularly review and update your schema as your app evolves.

---

**Keep this file updated as your Firestore schema grows!**
