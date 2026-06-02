import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  StickyNote,
  Plus,
  Search,
  Pin,
  PinOff,
  Trash2,
  Edit3,
  Save,
  X,
  Tag,
  Calendar,
  Sparkles,
  BookOpen,
  Lightbulb,
  Heart,
  Briefcase,
  Star,
} from 'lucide-react';
import { notesService } from '../../services/aiService';
import { useNotification } from '../../context/NotificationContext';
import { formatDate, getRelativeTime } from '../../utils/dateHelper';
import { ConfirmModal } from '../common/Modal';

const noteCategories = [
  { id: 'all', label: 'All', icon: StickyNote, color: 'lavender' },
  { id: 'study', label: 'Study', icon: BookOpen, color: 'babyBlue' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: 'yellow' },
  { id: 'personal', label: 'Personal', icon: Heart, color: 'blush' },
  { id: 'work', label: 'Work', icon: Briefcase, color: 'mint' },
  { id: 'important', label: 'Important', icon: Star, color: 'peach' },
];

const noteColors = [
  { name: 'lavender', bg: 'bg-lavender-100', border: 'border-lavender-200' },
  { name: 'peach', bg: 'bg-peach-100', border: 'border-peach-200' },
  { name: 'mint', bg: 'bg-mint-100', border: 'border-mint-200' },
  { name: 'babyBlue', bg: 'bg-babyBlue-100', border: 'border-babyBlue-200' },
  { name: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-200' },
  { name: 'blush', bg: 'bg-blush-100', border: 'border-blush-200' },
];

const NotesEditor = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingNote, setEditingNote] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  // Mock notes for initial display
  useEffect(() => {
    setNotes([
      {
        id: '1',
        title: 'React Hooks Notes',
        content: 'useState and useEffect are the most commonly used hooks. Remember to follow the rules of hooks - only call them at the top level.',
        category: 'study',
        color: 'lavender',
        pinned: true,
        tags: ['react', 'javascript'],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: '2',
        title: 'App Improvement Ideas',
        content: 'Add dark mode support. Implement keyboard shortcuts. Better mobile experience.',
        category: 'ideas',
        color: 'yellow',
        pinned: false,
        tags: ['ideas', 'design'],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: '3',
        title: 'Meeting Notes',
        content: 'Project deadline is next Friday. Need to finalize the design by Wednesday.',
        category: 'work',
        color: 'mint',
        pinned: false,
        tags: ['meeting', 'urgent'],
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ]);
  }, []);

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesCategory =
      selectedCategory === 'all' || note.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort - pinned first, then by date
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Create new note
  const handleCreate = () => {
    setEditingNote({
      title: '',
      content: '',
      category: 'study',
      color: 'lavender',
      pinned: false,
      tags: [],
    });
    setIsCreating(true);
  };

  // Save note
  const handleSave = async () => {
    if (!editingNote.title?.trim() && !editingNote.content?.trim()) {
      showToast('Note cannot be empty', 'error');
      return;
    }

    if (isCreating) {
      const newNote = {
        ...editingNote,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
      showToast('Note created! 📝', 'success');
    } else {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? editingNote : n))
      );
      showToast('Note updated! ✏️', 'success');
    }
    setEditingNote(null);
    setIsCreating(false);
  };

  // Pin/Unpin
  const togglePin = (id) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  // Delete
  const handleDelete = () => {
    if (deleteConfirm) {
      setNotes((prev) => prev.filter((n) => n.id !== deleteConfirm));
      showToast('Note deleted', 'success');
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
      >
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-300 to-peach-300 flex items-center justify-center shadow-soft">
              <StickyNote className="text-white" size={22} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-display font-bold text-gray-800">
                My Notes
              </h2>
              <p className="text-sm text-gray-500">
                {notes.length} {notes.length === 1 ? 'note' : 'notes'} •{' '}
                {notes.filter((n) => n.pinned).length} pinned
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleCreate}
            className="px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-peach-400 text-white font-medium rounded-xl shadow-soft hover:shadow-medium transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            New Note
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-11 pr-4 py-2.5 bg-lavender-50 border-2 border-transparent rounded-xl focus:border-lavender-300 focus:bg-white focus:outline-none text-sm transition-all"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {noteCategories.map((cat) => (
            <motion.button
              key={cat.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? `bg-${cat.color}-200 text-${cat.color}-600`
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <cat.icon size={12} />
              {cat.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Notes Grid */}
      {sortedNotes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 bg-white rounded-3xl border border-lavender-100"
        >
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-yellow-100 to-peach-100 flex items-center justify-center">
            <StickyNote size={32} className="text-yellow-500" />
          </div>
          <h3 className="text-lg font-display font-bold text-gray-700">
            {searchQuery ? 'No notes found' : 'No notes yet'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery ? 'Try a different search' : 'Create your first note!'}
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {sortedNotes.map((note, idx) => {
              const colorStyle =
                noteColors.find((c) => c.name === note.color) || noteColors[0];

              return (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  className={`group relative ${colorStyle.bg} rounded-2xl p-5 border-2 ${colorStyle.border} hover:shadow-medium transition-all`}
                >
                  {/* Pinned badge */}
                  {note.pinned && (
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-peach-400 to-blush-400 flex items-center justify-center shadow-medium">
                      <Pin size={12} className="text-white" />
                    </div>
                  )}

                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-display font-bold text-gray-800 line-clamp-2 flex-1 pr-2">
                      {note.title || 'Untitled'}
                    </h3>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => togglePin(note.id)}
                        className="p-1 rounded hover:bg-white/60 transition-colors"
                        title={note.pinned ? 'Unpin' : 'Pin'}
                      >
                        {note.pinned ? (
                          <PinOff size={12} className="text-gray-600" />
                        ) : (
                          <Pin size={12} className="text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => setEditingNote(note)}
                        className="p-1 rounded hover:bg-white/60 transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={12} className="text-babyBlue-500" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(note.id)}
                        className="p-1 rounded hover:bg-white/60 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={12} className="text-blush-500" />
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-4 mb-3">
                    {note.content}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 bg-white/60 text-gray-600 rounded-md font-medium flex items-center gap-1"
                        >
                          <Tag size={9} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-[10px] text-gray-500 pt-3 border-t border-white/40">
                    <span className="capitalize font-semibold">
                      {note.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={10} />
                      {getRelativeTime(note.createdAt)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Editor Modal */}
      <AnimatePresence>
        {editingNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setEditingNote(null);
                setIsCreating(false);
              }}
              className="absolute inset-0 bg-gradient-to-br from-lavender-900/30 to-babyBlue-900/30 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gradient-to-r from-yellow-100 to-peach-100 border-b border-lavender-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-peach-400 flex items-center justify-center">
                    {isCreating ? (
                      <Sparkles className="text-white" size={18} />
                    ) : (
                      <Edit3 className="text-white" size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-gray-800">
                      {isCreating ? 'Create Note' : 'Edit Note'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {isCreating ? 'Capture your thoughts' : 'Update your note'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setIsCreating(false);
                  }}
                  className="p-2 rounded-xl hover:bg-blush-100 transition-colors"
                >
                  <X size={18} className="text-gray-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* Title */}
                <input
                  type="text"
                  value={editingNote.title}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, title: e.target.value })
                  }
                  placeholder="Note title..."
                  className="w-full px-4 py-3 text-lg font-display font-bold bg-lavender-50 border-2 border-transparent rounded-xl focus:border-lavender-300 focus:bg-white focus:outline-none transition-all"
                  autoFocus
                />

                {/* Content */}
                <textarea
                  value={editingNote.content}
                  onChange={(e) =>
                    setEditingNote({ ...editingNote, content: e.target.value })
                  }
                  placeholder="Start writing your thoughts..."
                  rows={10}
                  className="w-full px-4 py-3 bg-lavender-50 border-2 border-transparent rounded-xl focus:border-lavender-300 focus:bg-white focus:outline-none resize-none text-gray-700 leading-relaxed transition-all"
                />

                {/* Category */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {noteCategories
                      .filter((c) => c.id !== 'all')
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() =>
                            setEditingNote({ ...editingNote, category: cat.id })
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                            editingNote.category === cat.id
                              ? `bg-${cat.color}-200 text-${cat.color}-600 border-2 border-${cat.color}-300`
                              : 'bg-gray-50 text-gray-500 border-2 border-transparent'
                          }`}
                        >
                          <cat.icon size={12} />
                          {cat.label}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-2 block">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {noteColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() =>
                          setEditingNote({ ...editingNote, color: color.name })
                        }
                        className={`w-9 h-9 rounded-xl ${color.bg} border-2 transition-all ${
                          editingNote.color === color.name
                            ? 'border-gray-700 scale-110'
                            : 'border-transparent hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Pinned toggle */}
                <button
                  onClick={() =>
                    setEditingNote({ ...editingNote, pinned: !editingNote.pinned })
                  }
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  {editingNote.pinned ? (
                    <Pin size={16} className="text-peach-500" />
                  ) : (
                    <PinOff size={16} className="text-gray-400" />
                  )}
                  Pin this note
                </button>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-lavender-100 flex items-center justify-end gap-2 bg-gradient-to-r from-lavender-50 to-babyBlue-50">
                <button
                  onClick={() => {
                    setEditingNote(null);
                    setIsCreating(false);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={16} />
                  Save Note
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete confirmation */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Note?"
        message="This note will be permanently removed."
        type="danger"
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default NotesEditor;