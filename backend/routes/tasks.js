const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTasks, getTodayTasks, createTask,
  updateTask, rescheduleTask, deleteTask
} = require('../controllers/taskController');

router.use(auth);
router.get('/', getTasks);
router.get('/today', getTodayTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.post('/:id/reschedule', rescheduleTask);
router.delete('/:id', deleteTask);

module.exports = router;