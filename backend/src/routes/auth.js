const express = require("express");
const router = express.Router();
const {
  registerUser,
  listUsers,
  deleteUser,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.get("/users", listUsers);
router.delete("/delete", deleteUser);

module.exports = router;
