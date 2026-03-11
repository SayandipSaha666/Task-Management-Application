const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  userAuthVerification
} = require('../controllers/user-controller');

// Gateway strips /api/user and forwards to this service.
// So /api/user/register → hits /register here.
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/auth', userAuthVerification);
router.post('/logout', logoutUser);

module.exports = router;
