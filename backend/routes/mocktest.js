const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MockTest = require('../models/MockTest');

router.use(auth);

router.get('/', async (req, res) => {
  try {
    const tests = await MockTest.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(tests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const test = await MockTest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;