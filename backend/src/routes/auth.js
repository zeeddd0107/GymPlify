const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  listUsers,
  deleteUser,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", listUsers);
router.delete("/delete", deleteUser);

module.exports = router;
