const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getInsights } = require('../controllers/insightController');

router.use(auth);
router.get('/', getInsights);

module.exports = router;