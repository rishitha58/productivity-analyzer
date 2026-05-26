const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  register, login, completeOnboarding, getMe, updateSettings
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.post('/onboarding', auth, completeOnboarding);
router.get('/me', auth, getMe);
router.put('/settings', auth, updateSettings);

module.exports = router;