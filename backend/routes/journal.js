const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createJournal, getJournals, getTodayJournal, updateJournal } = require('../controllers/journalController');

router.use(auth);
router.post('/', createJournal);
router.get('/', getJournals);
router.get('/today', getTodayJournal);
router.put('/:id', updateJournal);

module.exports = router;