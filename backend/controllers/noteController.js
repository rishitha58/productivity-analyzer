const Note = require('../models/Note');

exports.getNotes = async (req, res) => {
  try {
    const { category, subject } = req.query;
    const query = { userId: req.user._id };
    if (category) query.category = category;
    if (subject) query.subject = subject;

    const notes = await Note.find(query).sort({ isPinned: -1, updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createNote = async (req, res) => {
  try {
    const note = await Note.create({ ...req.body, userId: req.user._id });
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { ...req.body, updatedAt: new Date() },
      { new: true }
    );
    if (!note) return res.status(404).json({ error: 'Note not found' });
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMistakes = async (req, res) => {
  try {
    const mistakes = await Note.find({
      userId: req.user._id,
      category: 'mistakes'
    }).sort({ updatedAt: -1 });
    res.json(mistakes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};