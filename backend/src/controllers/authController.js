const admin = require("../../config/firebase");

// CREATE USER
exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Create user
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // 2. Create a custom token (to be exchanged on frontend)
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(201).json({
      message: "User registered successfully",
      uid: userRecord.uid,
      email: userRecord.email,
      token: customToken, // send the token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
};

// LOGIN USER
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // 2. Create a custom token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(200).json({
      message: "User logged in successfully",
      uid: userRecord.uid,
      email: userRecord.email,
      token: customToken,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ error: "Invalid email or password" });
  }
};

// GOOGLE AUTH
exports.googleAuth = async (req, res) => {
  const { email, displayName, photoURL, uid } = req.body;

  try {
    let userRecord;

    // Check if user already exists
    try {
      userRecord = await admin.auth().getUserByEmail(email);
    } catch (error) {
      // User doesn't exist, create new user
      userRecord = await admin.auth().createUser({
        email,
        displayName,
        photoURL,
        uid: uid, // Firebase will use this UID if provided
      });
    }

    // Create a custom token
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    res.status(200).json({
      message: "Google authentication successful",
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      photoURL: userRecord.photoURL,
      token: customToken,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    res.status(400).json({ error: error.message });
  }
};

// GET USER LISTS
const { getAllUsers } = require("../services/authService");

exports.listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /auth/delete
exports.deleteUser = async (req, res) => {
  const { uid } = req.body;

  if (!uid) {
    return res.status(400).json({ error: "UID is required" });
  }

  try {
    await admin.auth().deleteUser(uid);
    res
      .status(200)
      .json({ message: `User with UID ${uid} deleted successfully.` });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user." });
  }
};

// SET ADMIN CLAIM
exports.setAdminClaim = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);

    // Set admin custom claim
    await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });

    res.status(200).json({
      message: `Admin claim set successfully for ${email}`,
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    console.error("Error setting admin claim:", error);
    res.status(500).json({ error: "Failed to set admin claim." });
  }
};

// CREATE STAFF ACCOUNT
exports.createStaff = async (req, res) => {
  console.log("=== CREATE STAFF REQUEST ===");
  console.log("Request body:", req.body);
  const { name, email, role, password } = req.body;

  if (!name || !email || !role || !password) {
    console.log("Validation failed - missing fields");
    return res.status(400).json({ error: "Name, email, role, and password are required" });
  }

  try {
    console.log("Attempting to create staff account for:", email);
    // Check if user already exists
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log("User already exists:", email);
      // User already exists, return error
      return res.status(400).json({ error: "An account with this email already exists" });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
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
    if (role.toLowerCase() === 'admin') {
      console.log("Setting admin custom claims for:", email);
      await admin.auth().setCustomUserClaims(userRecord.uid, { admin: true });
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
      { merge: true },
    );
    console.log("Firestore document created successfully");

    console.log("=== STAFF CREATED SUCCESSFULLY ===");
    res.status(200).json({
      message: "Staff account created successfully",
      uid: userRecord.uid,
      email: userRecord.email,
      name: name,
      role: role,
    });
  } catch (error) {
    console.error("Error creating staff account:", error);
    console.error("Error details:", error.message);
    if (error.code === 'auth/email-already-exists') {
      res.status(400).json({ error: "An account with this email already exists" });
    } else {
      res.status(500).json({ error: "Failed to create staff account" });
    }
  }
};
