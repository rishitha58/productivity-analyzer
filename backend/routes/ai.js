const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  chat, getImportantPoints, generateMockTest,
  submitMockTest, getFoodRecommendation
} = require('../controllers/aiController');

router.use(auth);
router.post('/chat', chat);
router.post('/important-points', getImportantPoints);
router.post('/mock-test/generate', generateMockTest);
router.post('/mock-test/:id/submit', submitMockTest);
router.post('/food-recommendation', getFoodRecommendation);

module.exports = router;