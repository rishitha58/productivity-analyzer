const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createGoal, getGoals, updateGoalProgress } = require('../controllers/goalController');

router.use(auth);
router.get('/', getGoals);
router.post('/', createGoal);
router.put('/:id/progress', updateGoalProgress);

module.exports = router;