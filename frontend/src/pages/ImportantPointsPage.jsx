import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Plus, Sparkles, Trash2, Loader2, Lightbulb, X,
  Brain, FileText, BookOpen, StickyNote, Upload, Search, Check, File
} from "lucide-react";
import { 
  generateKeyPoints, 
  generateKeyPointsFromNotes,
  generateKeyPointsFromFiles,
  getAllKeyPoints, 
  deleteKeyPoint,
  getNotes
} from "../services/aiService";

const ImportantPointsPage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [keyPoints, setKeyPoints] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Form state
  const [sourceType, setSourceType] = useState("topic"); // topic | text | notes | files
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  
  // Notes selection
  const [selectedNoteIds, setSelectedNoteIds] = useState([]);
  const [noteSearch, setNoteSearch] = useState("");
  
  // File upload
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [pointsData, notesData] = await Promise.all([
        getAllKeyPoints(),
        getNotes(),
      ]);
      setKeyPoints(Array.isArray(pointsData) ? pointsData : []);
      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch (e) {
      console.error("Load failed:", e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTopic("");
    setText("");
    setSelectedNoteIds([]);
    setNoteSearch("");
    setUploadedFiles([]);
  };

  const handleGenerate = async () => {
    // Validations
    if (sourceType === "topic" && !topic.trim()) {
      alert("Please enter a topic");
      return;
    }
    if (sourceType === "text" && !text.trim()) {
      alert("Please paste some content");
      return;
    }
    if (sourceType === "notes" && selectedNoteIds.length === 0) {
      alert("Please select at least one note");
      return;
    }
    if (sourceType === "files" && uploadedFiles.length === 0) {
      alert("Please upload at least one file");
      return;
    }

    setGenerating(true);
    try {
      if (sourceType === "notes") {
        await generateKeyPointsFromNotes(selectedNoteIds);
      } else if (sourceType === "files") {
        await generateKeyPointsFromFiles(uploadedFiles, topic);
      } else {
        await generateKeyPoints(topic, text, sourceType);
      }
      
      setShowModal(false);
      resetForm();
      await loadData();
    } catch (e) {
      alert("Failed: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this?")) return;
    await deleteKeyPoint(id);
    await loadData();
  };

  // ─── Notes selection helpers ───
  const toggleNoteSelection = (noteId) => {
    setSelectedNoteIds((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const filteredNotes = notes.filter((note) => {
    const search = noteSearch.toLowerCase();
    return (
      note.title?.toLowerCase().includes(search) ||
      note.content?.toLowerCase().includes(search) ||
      note.category?.toLowerCase().includes(search)
    );
  });

  const selectedContentLength = notes
    .filter((n) => selectedNoteIds.includes(n._id))
    .reduce((sum, n) => sum + (n.content?.length || 0), 0);

  const getNoteColor = (color) => {
    const colors = {
      lavender: "bg-lavender-50 border-lavender-200",
      peach: "bg-peach-50 border-peach-200",
      mint: "bg-mint-50 border-mint-200",
      babyBlue: "bg-babyBlue-50 border-babyBlue-200",
      yellow: "bg-yellow-50 border-yellow-200",
    };
    return colors[color] || colors.lavender;
  };

  // ─── File upload helpers ───
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    addFiles(files);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter((file) => {
      const isValid = 
        file.type === "application/pdf" || 
        file.type === "text/plain";
      const isSmall = file.size <= 10 * 1024 * 1024; // 10MB
      
      if (!isValid) {
        alert(`${file.name} is not a PDF or TXT file`);
        return false;
      }
      if (!isSmall) {
        alert(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    const total = uploadedFiles.length + validFiles.length;
    if (total > 5) {
      alert("Maximum 5 files allowed");
      return;
    }

    setUploadedFiles((prev) => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // ─── Source icon helper for key point cards ───
  const getSourceIcon = (source) => {
    switch (source) {
      case "notes":
        return <StickyNote className="w-5 h-5 text-white" />;
      case "files":
        return <Upload className="w-5 h-5 text-white" />;
      case "topic":
        return <Brain className="w-5 h-5 text-white" />;
      default:
        return <Lightbulb className="w-5 h-5 text-white" />;
    }
  };

  const getSourceGradient = (source) => {
    switch (source) {
      case "notes":
        return "bg-gradient-to-br from-mint-300 to-lavender-300";
      case "files":
        return "bg-gradient-to-br from-peach-300 to-blush-300";
      case "topic":
        return "bg-gradient-to-br from-lavender-300 to-babyBlue-300";
      default:
        return "bg-gradient-primary";
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-white border-b border-lavender-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/dashboard")} className="btn-icon">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-700 font-display">💡 Important Points</h1>
              <p className="text-xs text-gray-400">
                {keyPoints.length} topics • {notes.length} notes available
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generate Points
          </motion.button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-lavender-400 animate-spin" />
          </div>
        ) : keyPoints.length === 0 ? (
          <div className="card text-center py-16">
            <div className="text-6xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-gray-700 font-display mb-2">
              No key points yet
            </h3>
            <p className="text-gray-500 mb-6">
              Generate from a topic, text, your notes, or upload files!
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              <Sparkles className="w-4 h-4 inline mr-2" />
              Generate Your First
            </motion.button>
          </div>
        ) : (
          <div className="space-y-6">
            {keyPoints.map((kp, i) => (
              <motion.div
                key={kp._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${getSourceGradient(kp.source)}`}>
                      {getSourceIcon(kp.source)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-700 font-display">
                        {kp.topic}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {kp.points?.length} points • From: {kp.source || "AI"}
                        {kp.source === "notes" && " 📝"}
                        {kp.source === "files" && " 📄"}
                        {kp.source === "topic" && " 🧠"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(kp._id)}
                    className="btn-icon text-blush-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  {kp.points?.map((point, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: j * 0.05 }}
                      className="flex items-start gap-3 p-3 bg-lavender-50 rounded-xl"
                    >
                      <span className="text-lavender-500 font-bold text-sm">
                        {j + 1}.
                      </span>
                      <p className="text-sm text-gray-700 flex-1">{point}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-700 font-display">
                  ✨ Generate Key Points
                </h2>
                <button onClick={() => { setShowModal(false); resetForm(); }} className="btn-icon">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ⭐ UPDATED: 4 Source Options */}
              <div className="mb-4">
                <label className="label">Choose Source</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <button
                    onClick={() => setSourceType("topic")}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      sourceType === "topic"
                        ? "border-lavender-300 bg-lavender-50"
                        : "border-lavender-100"
                    }`}
                  >
                    <Brain className="w-5 h-5 mx-auto mb-1 text-lavender-500" />
                    <p className="text-xs font-semibold text-gray-700">Topic</p>
                    <p className="text-[10px] text-gray-400">AI generates</p>
                  </button>
                  
                  <button
                    onClick={() => setSourceType("text")}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      sourceType === "text"
                        ? "border-lavender-300 bg-lavender-50"
                        : "border-lavender-100"
                    }`}
                  >
                    <FileText className="w-5 h-5 mx-auto mb-1 text-lavender-500" />
                    <p className="text-xs font-semibold text-gray-700">Text</p>
                    <p className="text-[10px] text-gray-400">Paste content</p>
                  </button>
                  
                  {/* ⭐ NEW: Notes Option */}
                  <button
                    onClick={() => setSourceType("notes")}
                    disabled={notes.length === 0}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      notes.length === 0
                        ? "opacity-50 cursor-not-allowed border-gray-200"
                        : sourceType === "notes"
                        ? "border-lavender-300 bg-lavender-50"
                        : "border-lavender-100"
                    }`}
                  >
                    <StickyNote className="w-5 h-5 mx-auto mb-1 text-mint-500" />
                    <p className="text-xs font-semibold text-gray-700">Notes</p>
                    <p className="text-[10px] text-gray-400">{notes.length} saved</p>
                  </button>
                  
                  {/* ⭐ NEW: Files Option */}
                  <button
                    onClick={() => setSourceType("files")}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      sourceType === "files"
                        ? "border-lavender-300 bg-lavender-50"
                        : "border-lavender-100"
                    }`}
                  >
                    <Upload className="w-5 h-5 mx-auto mb-1 text-peach-500" />
                    <p className="text-xs font-semibold text-gray-700">Files</p>
                    <p className="text-[10px] text-gray-400">PDF / TXT</p>
                  </button>
                </div>
              </div>

              {/* ─── TOPIC INPUT ─── */}
              {sourceType === "topic" && (
                <div>
                  <label className="label">Topic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Binary Search Trees, Photosynthesis, French Revolution"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="input"
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    💡 AI will generate 7-10 important points about this topic
                  </p>
                </div>
              )}

              {/* ─── TEXT INPUT ─── */}
              {sourceType === "text" && (
                <>
                  <div className="mb-4">
                    <label className="label">Topic Name (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Binary Search Trees"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Paste Content / Notes</label>
                    <textarea
                      rows={8}
                      placeholder="Paste your notes, article, textbook chapter, or any study material here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="textarea"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      💡 AI will extract the most important points from your content
                    </p>
                  </div>
                </>
              )}

              {/* ⭐ NEW: NOTES SELECTOR ─── */}
              {sourceType === "notes" && (
                <div>
                  <label className="label">
                    Select Notes ({selectedNoteIds.length} selected)
                  </label>

                  {/* Search bar */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      className="input pl-10"
                    />
                  </div>

                  {/* Selected info */}
                  {selectedNoteIds.length > 0 && (
                    <div className="mb-2 p-2 bg-lavender-50 rounded-xl flex items-center justify-between">
                      <p className="text-xs text-gray-600">
                        ✓ {selectedNoteIds.length} notes • ~{selectedContentLength} chars
                      </p>
                      <button
                        onClick={() => setSelectedNoteIds([])}
                        className="text-xs text-blush-500 hover:underline font-semibold"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {/* Notes list */}
                  <div className="max-h-72 overflow-y-auto space-y-2 border border-lavender-100 rounded-xl p-2">
                    {filteredNotes.length === 0 ? (
                      <p className="text-center text-xs text-gray-400 py-4">
                        {notes.length === 0 ? "No notes available" : "No notes match your search"}
                      </p>
                    ) : (
                      filteredNotes.map((note) => {
                        const isSelected = selectedNoteIds.includes(note._id);
                        return (
                          <motion.button
                            key={note._id}
                            whileHover={{ x: 2 }}
                            onClick={() => toggleNoteSelection(note._id)}
                            className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                              isSelected
                                ? "border-lavender-300 bg-lavender-50"
                                : `border-transparent ${getNoteColor(note.color)} hover:border-lavender-200`
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isSelected
                                ? "bg-lavender-400 border-lavender-400"
                                : "border-gray-300 bg-white"
                            }`}>
                              {isSelected && <Check className="w-3 h-3 text-white" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-700 truncate">
                                {note.pinned && "📌 "}{note.title}
                              </p>
                              <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                                {note.content || "(empty)"}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] px-2 py-0.5 bg-white/60 rounded-full text-gray-500">
                                  {note.category}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  {note.content?.length || 0} chars
                                </span>
                              </div>
                            </div>
                          </motion.button>
                        );
                      })
                    )}
                  </div>

                  {selectedContentLength > 0 && selectedContentLength < 100 && (
                    <p className="text-xs text-yellow-600 mt-2">
                      ⚠️ Selected notes are short — consider selecting more
                    </p>
                  )}
                </div>
              )}

              {/* ⭐ NEW: FILES UPLOAD ─── */}
              {sourceType === "files" && (
                <div>
                  <div className="mb-3">
                    <label className="label">Topic Name (optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Database Concepts"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="input"
                    />
                  </div>

                  <label className="label">Upload Files ({uploadedFiles.length}/5)</label>
                  
                  {/* Drag & Drop area */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                      dragActive
                        ? "border-lavender-400 bg-lavender-50"
                        : "border-lavender-200 hover:border-lavender-300 hover:bg-lavender-50/50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.txt,application/pdf,text/plain"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-10 h-10 mx-auto mb-2 text-lavender-400" />
                    <p className="text-sm font-semibold text-gray-700">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PDF or TXT files • Max 5 files • 10MB each
                    </p>
                  </div>

                  {/* Uploaded files list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-600">
                        Selected Files:
                      </p>
                      {uploadedFiles.map((file, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 p-3 bg-peach-50 border border-peach-200 rounded-xl"
                        >
                          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                            <File className="w-4 h-4 text-peach-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-700 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {file.type === "application/pdf" ? "PDF" : "TXT"} • {formatFileSize(file.size)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(i);
                            }}
                            className="btn-icon text-blush-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs text-gray-400 mt-3">
                    💡 AI will extract key points from your uploaded documents
                  </p>
                </div>
              )}

              {/* GENERATE BUTTON */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleGenerate}
                disabled={
                  generating ||
                  (sourceType === "topic" && !topic.trim()) ||
                  (sourceType === "text" && !text.trim()) ||
                  (sourceType === "notes" && selectedNoteIds.length === 0) ||
                  (sourceType === "files" && uploadedFiles.length === 0)
                }
                className={`w-full mt-4 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2 ${
                  !generating &&
                  ((sourceType === "topic" && topic.trim()) ||
                    (sourceType === "text" && text.trim()) ||
                    (sourceType === "notes" && selectedNoteIds.length > 0) ||
                    (sourceType === "files" && uploadedFiles.length > 0))
                    ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    AI Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Key Points
                  </>
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImportantPointsPage;