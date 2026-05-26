const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const { getFoodRecommendation } = require('../controllers/aiController');

router.use(auth);

router.put('/preferences', async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { foodPreferences: req.body });
    res.json({ message: 'Food preferences updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/recommend', getFoodRecommendation);

module.exports = router;