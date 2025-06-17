const express = require('express');
const router = express.Router();
const { registerUser } = require('../controllers/authController');
const { listUsers } = require('../controllers/authController');

router.post('/register', registerUser);
router.get('/users', listUsers);

module.exports = router;
