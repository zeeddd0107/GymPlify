const admin = require('../../config/firebase');

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    res.status(201).json({
      message: "User registered successfully",
      uid: userRecord.uid,
      email: userRecord.email,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
};
