import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Search, Pin, PinOff, Trash2, Edit3,
  StickyNote, X, Save, Loader2, BookOpen, FileText,
  Tag, Calendar, Filter, Grid3x3, List
} from "lucide-react";
import { getNotes, createNote, updateNote, deleteNote } from "../services/aiService";

const COLORS = [
  { name: "lavender", bg: "bg-lavender-100", border: "border-lavender-300", text: "text-lavender-500" },
  { name: "peach", bg: "bg-peach-100", border: "border-peach-300", text: "text-peach-500" },
  { name: "mint", bg: "bg-mint-100", border: "border-mint-300", text: "text-mint-500" },
  { name: "babyBlue", bg: "bg-babyBlue-100", border: "border-babyBlue-300", text: "text-babyBlue-500" },
  { name: "blush", bg: "bg-blush-100", border: "border-blush-300", text: "text-blush-500" },
  { name: "warning", bg: "bg-warning/30", border: "border-warning", text: "text-peach-500" },
];

const CATEGORIES = [
  { id: "all", label: "All Notes", icon: BookOpen },
  { id: "study", label: "Study", icon: BookOpen },
  { id: "ideas", label: "Ideas", icon: StickyNote },
  { id: "personal", label: "Personal", icon: FileText },
  { id: "work", label: "Work", icon: FileText },
  { id: "important", label: "Important", icon: Pin },
];

const NotesPage = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // grid | list

  // Form state
  const [form, setForm] = useState({
    title: "",
    content: "",
    category: "study",
    color: "lavender",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const data = await getNotes();
      setNotes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load notes:", e);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setForm({
      title: "",
      content: "",
      category: "study",
      color: "lavender",
      tags: [],
    });
    setEditingNote(null);
    setTagInput("");
    setShowEditor(true);
  };

  const openEditModal = (note) => {
    setForm({
      title: note.title,
      content: note.content || "",
      category: note.category || "study",
      color: note.color || "lavender",
      tags: note.tags || [],
    });
    setEditingNote(note);
    setTagInput("");
    setShowEditor(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      alert("Please add a title");
      return;
    }

    try {
      if (editingNote) {
        await updateNote(editingNote._id, form);
      } else {
        await createNote(form);
      }
      setShowEditor(false);
      await loadNotes();
    } catch (e) {
      alert("Save failed: " + e.message);
    }
  };

  const handleDelete = async (id, e) => {
    e?.stopPropagation();
    if (!confirm("Delete this note? This cannot be undone.")) return;
    try {
      await deleteNote(id);
      await loadNotes();
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handlePin = async (note, e) => {
    e?.stopPropagation();
    try {
      await updateNote(note._id, { ...note, pinned: !note.pinned });
      await loadNotes();
    } catch (e) {
      console.error("Pin failed:", e);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tagToRemove) });
  };

  // Filter & sort
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = activeCategory === "all" || note.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  // Format date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  // Category counts
  const getCategoryCount = (cat) => {
    if (cat === "all") return notes.length;
    return notes.filter((n) => n.category === cat).length;
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* HEADER */}
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ x: -3 }}
              onClick={() => navigate("/dashboard")}
              className="btn-icon"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>
            <div>
              <h1 className="text-lg font-bold text-gray-700 font-display">
                📓 My Notebook
              </h1>
              <p className="text-xs text-gray-400">
                {notes.length} {notes.length === 1 ? "note" : "notes"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="hidden md:flex bg-cream rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-white shadow-soft" : ""}`}
              >
                <Grid3x3 className="w-4 h-4 text-gray-600" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-white shadow-soft" : ""}`}
              >
                <List className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCreateModal}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Note
            </motion.button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto p-6">
        
        {/* Search + Filters */}
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-lavender-100">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notes by title, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const count = getCategoryCount(cat.id);
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-lavender-300 text-white shadow-soft"
                      : "bg-lavender-50 text-gray-600 hover:bg-lavender-100"
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  {cat.label}
                  <span className={`px-1.5 rounded-full text-xs ${
                    activeCategory === cat.id ? "bg-white/30" : "bg-white"
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notes Display */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-lavender-400 animate-spin" />
          </div>
        ) : sortedNotes.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-700 font-display mb-2">
              {searchQuery ? "No notes found" : notes.length === 0 ? "Start your notebook!" : "No notes in this category"}
            </h3>
            <p className="text-gray-500 mb-6">
              {notes.length === 0
                ? "Create your first note to organize your thoughts"
                : "Try a different category or create a new note"}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={openCreateModal}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Create New Note
            </motion.button>
          </div>
        ) : viewMode === "grid" ? (
          // GRID VIEW
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sortedNotes.map((note, i) => {
              const colorClass = COLORS.find((c) => c.name === note.color) || COLORS[0];
              return (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className={`${colorClass.bg} border-2 ${colorClass.border} rounded-3xl p-5 cursor-pointer relative group transition-all`}
                  onClick={() => openEditModal(note)}
                >
                  {/* Pin */}
                  {note.pinned && (
                    <Pin className="w-4 h-4 text-lavender-500 absolute top-4 right-4 fill-lavender-500" />
                  )}

                  {/* Category badge */}
                  <span className={`badge bg-white/60 ${colorClass.text} text-xs mb-2 inline-block`}>
                    {note.category || "study"}
                  </span>

                  {/* Title */}
                  <h3 className="font-bold text-gray-700 mb-2 line-clamp-2 font-display">
                    {note.title}
                  </h3>

                  {/* Content preview */}
                  <p className="text-xs text-gray-600 line-clamp-5 mb-3 whitespace-pre-wrap">
                    {note.content || "Empty note"}
                  </p>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-0.5 bg-white/60 rounded-full text-gray-600"
                        >
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{note.tags.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-white/50">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(note.updatedAt || note.createdAt)}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handlePin(note, e)}
                        className="p-1.5 bg-white/60 rounded-lg hover:bg-white"
                        title={note.pinned ? "Unpin" : "Pin"}
                      >
                        {note.pinned ? (
                          <PinOff className="w-3 h-3 text-gray-600" />
                        ) : (
                          <Pin className="w-3 h-3 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={(e) => handleDelete(note._id, e)}
                        className="p-1.5 bg-white/60 rounded-lg hover:bg-white text-blush-500"
                        title="Delete"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          // LIST VIEW
          <div className="space-y-3">
            {sortedNotes.map((note, i) => {
              const colorClass = COLORS.find((c) => c.name === note.color) || COLORS[0];
              return (
                <motion.div
                  key={note._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ x: 4 }}
                  className={`card cursor-pointer border-l-4 ${colorClass.border} group`}
                  onClick={() => openEditModal(note)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${colorClass.bg} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <FileText className={`w-5 h-5 ${colorClass.text}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-700 truncate">
                          {note.title}
                        </h3>
                        {note.pinned && (
                          <Pin className="w-4 h-4 text-lavender-500 fill-lavender-500 flex-shrink-0" />
                        )}
                      </div>

                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {note.content || "Empty note"}
                      </p>

                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`badge ${colorClass.bg} ${colorClass.text} text-xs`}>
                          {note.category || "study"}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(note.updatedAt || note.createdAt)}
                        </span>
                        {note.tags?.map((tag) => (
                          <span key={tag} className="text-xs text-gray-500">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button
                        onClick={(e) => handlePin(note, e)}
                        className="btn-icon"
                      >
                        {note.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => handleDelete(note._id, e)}
                        className="btn-icon text-blush-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* ═══════ NOTE EDITOR MODAL ═══════ */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-lavender-100">
                <h2 className="text-xl font-bold text-gray-700 font-display flex items-center gap-2">
                  {editingNote ? (
                    <>
                      <Edit3 className="w-5 h-5" />
                      Edit Note
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      New Note
                    </>
                  )}
                </h2>
                <button onClick={() => setShowEditor(false)} className="btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Title */}
                <div>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Note title..."
                    autoFocus
                    className="w-full text-2xl font-bold text-gray-700 bg-transparent focus:outline-none border-b-2 border-lavender-100 focus:border-lavender-300 pb-2 font-display"
                  />
                </div>

                {/* Category & Color */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="input"
                    >
                      {CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="label">Color</label>
                    <div className="flex gap-2 items-center h-10">
                      {COLORS.map((color) => (
                        <button
                          key={color.name}
                          onClick={() => setForm({ ...form, color: color.name })}
                          className={`w-8 h-8 rounded-full ${color.bg} border-2 transition-all ${
                            form.color === color.name 
                              ? `${color.border} scale-125` 
                              : "border-transparent hover:scale-110"
                          }`}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="label">Tags (optional)</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-lavender-100 text-lavender-500 rounded-full text-xs font-semibold flex items-center gap-1"
                      >
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="ml-1">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add a tag and press Enter"
                      className="input flex-1"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 py-2 bg-lavender-100 text-lavender-500 rounded-xl text-sm font-semibold hover:bg-lavender-200"
                    >
                      + Add
                    </button>
                  </div>
                </div>

                {/* Content (BIG TEXT AREA - the actual notebook!) */}
                <div>
                  <label className="label">
                    Your Notes 
                    <span className="text-gray-400 font-normal ml-2">
                      ({form.content.length} characters)
                    </span>
                  </label>
                  <textarea
                    rows={14}
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    placeholder="Start writing your notes here...

You can write:
• Study notes from your textbook
• Key concepts you learned
• Important formulas
• Ideas and thoughts
• Anything you want to remember!

This is YOUR personal notebook 📝"
                    className="textarea text-base font-mono leading-relaxed"
                    style={{ minHeight: "300px" }}
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-5 border-t border-lavender-100 bg-cream">
                <div className="text-xs text-gray-500">
                  {editingNote && (
                    <>Last edited: {formatDate(editingNote.updatedAt || editingNote.createdAt)}</>
                  )}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEditor(false)}
                    className="px-5 py-2.5 bg-white border border-lavender-200 text-gray-600 rounded-xl font-semibold hover:bg-lavender-50"
                  >
                    Cancel
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSave}
                    disabled={!form.title.trim()}
                    className={`px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 ${
                      form.title.trim()
                        ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    {editingNote ? "Update Note" : "Save Note"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotesPage;