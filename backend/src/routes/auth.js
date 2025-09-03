const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuth,
  listUsers,
  deleteUser,
  setAdminClaim,
} = require("../controllers/authController");
const isAdmin = require("../middleware/isAdmin");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/users", listUsers);
router.delete("/users/:uid", deleteUser);

// Admin-only routes
router.get("/admin/panel", isAdmin, (req, res) => {
  res.json({ message: "Welcome, admin! You have full control." });
});

// Set admin claim for a user (admin only)
router.post("/admin/set-admin", isAdmin, setAdminClaim);

module.exports = router;
