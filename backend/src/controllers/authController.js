const admin = require('../../config/firebase');

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
      token: customToken, // 🔐 send the token
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
};

const { getAllUsers } = require('../services/authService');

exports.listUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

