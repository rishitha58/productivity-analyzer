import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import { 
  generateMockTest, 
  generateKeyPoints,
  generateKeyPointsFromNotes,
  generateKeyPointsFromFiles,
  getFoodRecommendation,
  generateTestFromNotes,
} from "../services/aiService.js";
import MockTest from "../models/MockTest.js";
import KeyPoint from "../models/KeyPoint.js";
import Note from "../models/Note.js";

// ═══════════════════════════════════════
//   📄 PDF PARSING HELPER (pdfjs-dist)
// ═══════════════════════════════════════
const extractPdfText = async (buffer) => {
  const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const uint8Array = new Uint8Array(buffer);
  const pdf = await pdfjsLib.getDocument({ 
    data: uint8Array,
    useSystemFonts: true,
    disableFontFace: true,
    useWorkerFetch: false,
    isEvalSupported: false,
  }).promise;
  
  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => item.str)
      .join(" ");
    fullText += pageText + "\n\n";
  }
  
  return fullText;
};

const router = express.Router();

// ═══════════════════════════════════════
//   📁 MULTER SETUP (File Uploads)
// ═══════════════════════════════════════
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["application/pdf", "text/plain"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  },
});

// ═══════════════════════════════════════
//   📝 GENERATE MOCK TEST (Standalone Topic)
// ═══════════════════════════════════════
router.post("/mocktest", protect, async (req, res) => {
  try {
    const { topic, numQuestions = 5 } = req.body;
    const questions = await generateMockTest(topic, numQuestions);
    
    const test = await MockTest.create({
      userId: req.user._id,
      topic,
      questions,
      totalQuestions: questions.length,
    });
    
    res.json(test);
  } catch (e) {
    console.error("❌ Mock test error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   📝 GENERATE MOCK TEST FROM NOTES
// ═══════════════════════════════════════
router.post("/mocktest-from-notes", protect, async (req, res) => {
  try {
    const { noteIds, numQuestions = 5 } = req.body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({ error: "Please select at least one note" });
    }

    const notes = await Note.find({
      _id: { $in: noteIds },
      userId: req.user._id,
    });

    if (notes.length === 0) {
      return res.status(404).json({ error: "Notes not found" });
    }

    const totalContent = notes
      .map((n) => (n.content || "").length)
      .reduce((a, b) => a + b, 0);

    if (totalContent < 50) {
      return res.status(400).json({ 
        error: "Selected notes don't have enough content" 
      });
    }

    const result = await generateTestFromNotes(notes, numQuestions);

    const test = await MockTest.create({
      userId: req.user._id,
      topic: result.topic,
      source: "notes",
      sourceNoteIds: noteIds,
      questions: result.questions,
      totalQuestions: result.questions.length,
    });

    console.log(`✅ Generated test from ${notes.length} notes`);
    res.json(test);
  } catch (error) {
    console.error("❌ Mock test from notes error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
//   💡 GENERATE KEY POINTS (Topic OR Text)
// ═══════════════════════════════════════
router.post("/keypoints", protect, async (req, res) => {
  try {
    const { topic, text, sourceType = "text" } = req.body;
    const input = sourceType === "topic" ? topic : text;
    
    if (!input || !input.trim()) {
      return res.status(400).json({ error: "Topic or text required" });
    }
    
    const result = await generateKeyPoints(input, sourceType);
    
    const saved = await KeyPoint.create({
      userId: req.user._id,
      topic: result.topic || topic || "Untitled",
      points: result.points,
      source: sourceType,
    });
    
    res.json({
      ...saved.toObject(),
      summary: result.summary,
    });
  } catch (e) {
    console.error("❌ Key points error:", e);
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   📋 GENERATE KEY POINTS FROM NOTES
// ═══════════════════════════════════════
router.post("/keypoints-from-notes", protect, async (req, res) => {
  try {
    const { noteIds } = req.body;

    if (!noteIds || !Array.isArray(noteIds) || noteIds.length === 0) {
      return res.status(400).json({ error: "Please select at least one note" });
    }

    const notes = await Note.find({
      _id: { $in: noteIds },
      userId: req.user._id,
    });

    if (notes.length === 0) {
      return res.status(404).json({ error: "Notes not found" });
    }

    const totalContent = notes
      .map((n) => (n.content || "").length)
      .reduce((a, b) => a + b, 0);

    if (totalContent < 50) {
      return res.status(400).json({ 
        error: "Selected notes don't have enough content to extract key points" 
      });
    }

    console.log(`💡 Extracting key points from ${notes.length} notes`);
    const result = await generateKeyPointsFromNotes(notes);

    const saved = await KeyPoint.create({
      userId: req.user._id,
      topic: result.topic,
      points: result.points,
      source: "notes",
    });

    console.log(`✅ Saved ${result.points.length} key points from notes`);
    res.json({
      ...saved.toObject(),
      summary: result.summary,
    });
  } catch (error) {
    console.error("❌ Key points from notes error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// ═══════════════════════════════════════
//   📄 GENERATE KEY POINTS FROM FILES
// ═══════════════════════════════════════
router.post(
  "/keypoints-from-files",
  protect,
  upload.array("files", 5),
  async (req, res) => {
    try {
      const { topic } = req.body;
      const files = req.files;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Please upload at least one file" });
      }

      console.log(`📄 Processing ${files.length} files...`);

      const filesContent = [];
      for (const file of files) {
        try {
          let content = "";
          
          if (file.mimetype === "application/pdf") {
            content = await extractPdfText(file.buffer);
            console.log(`  ✓ Parsed PDF: ${file.originalname} (${content.length} chars)`);
            console.log(`  📝 Preview:`, content.substring(0, 200));
          } else if (file.mimetype === "text/plain") {
            content = file.buffer.toString("utf-8");
            console.log(`  ✓ Parsed TXT: ${file.originalname} (${content.length} chars)`);
          }

          if (content.trim().length > 0) {
            filesContent.push({
              filename: file.originalname,
              content: content,
            });
          }
        } catch (parseError) {
          console.error(`  ✗ Failed to parse ${file.originalname}:`, parseError.message);
        }
      }

      if (filesContent.length === 0) {
        return res.status(400).json({ 
          error: "Could not extract text from any file" 
        });
      }

      const totalContent = filesContent
        .map((f) => f.content.length)
        .reduce((a, b) => a + b, 0);

      if (totalContent < 100) {
        return res.status(400).json({ 
          error: "Files don't have enough content" 
        });
      }

      console.log(`💡 Generating key points from ${filesContent.length} files (${totalContent} total chars)`);

      const result = await generateKeyPointsFromFiles(filesContent, topic);

      const saved = await KeyPoint.create({
        userId: req.user._id,
        topic: result.topic,
        points: result.points,
        source: "files",
      });

      console.log(`✅ Saved ${result.points.length} key points from files`);
      res.json({
        ...saved.toObject(),
        summary: result.summary,
        filesProcessed: filesContent.length,
      });
    } catch (error) {
      console.error("❌ Key points from files error:", error.message);
      
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large (max 10MB)" });
      }
      if (error.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({ error: "Too many files (max 5)" });
      }
      
      res.status(500).json({ error: error.message });
    }
  }
);

// ═══════════════════════════════════════
//   📚 GET ALL SAVED KEY POINTS
// ═══════════════════════════════════════
router.get("/keypoints", protect, async (req, res) => {
  try {
    const points = await KeyPoint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(points);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ═══════════════════════════════════════
//   🗑️ DELETE KEY POINT
// ═══════════════════════════════════════
router.delete("/keypoints/:id", protect, async (req, res) => {
  try {
    await KeyPoint.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;