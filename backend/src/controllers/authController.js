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
