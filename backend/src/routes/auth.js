const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  googleAuth,
  listUsers,
  deleteUser,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleAuth);
router.get("/users", listUsers);
router.delete("/users/:uid", deleteUser);

module.exports = router;
