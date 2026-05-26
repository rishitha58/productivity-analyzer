const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getNotes, createNote, updateNote, deleteNote, getMistakes } = require('../controllers/notesController');

router.use(auth);
router.get('/', getNotes);
router.get('/mistakes', getMistakes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

module.exports = router;