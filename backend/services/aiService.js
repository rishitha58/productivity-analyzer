
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY not found in .env!");
} else {
  console.log("✅ Gemini Key loaded:", GEMINI_API_KEY.substring(0, 10) + "...");
}

const MODELS = [
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",      
  "gemini-2.0-flash",
];

// ─── Call AI for JSON response ───
const callAI = async (prompt, systemMessage = "", options = {}) => {
  const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt;
  let lastError;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: options.temperature || 0.7,
            maxOutputTokens: options.maxOutputTokens || 2000, // ⭐ Increased default + customizable
            responseMimeType: "application/json",
          },
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 60000, // ⭐ Increased timeout for longer generations
        }
      );

      console.log(`✅ AI call successful using: ${model}`);
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.log(`⚠️  ${model} failed: ${errorMsg.substring(0, 80)}`);
      lastError = error;
      if (errorMsg.includes("quota") || errorMsg.includes("demand")) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      continue;
    }
  }

  throw lastError;
};

// ─── Call AI for TEXT (no JSON forcing) ───
const callAIText = async (prompt, systemMessage = "") => {
  const fullPrompt = systemMessage ? `${systemMessage}\n\n${prompt}` : prompt;
  let lastError;

  for (const model of MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
            // NO responseMimeType - allow text response
          },
        },
        {
          headers: { "Content-Type": "application/json" },
          timeout: 30000,
        }
      );

      console.log(`✅ AI text call successful using: ${model}`);
      return response.data.candidates[0].content.parts[0].text;
    } catch (error) {
      const errorMsg = error.response?.data?.error?.message || error.message;
      console.log(`⚠️  ${model} failed: ${errorMsg.substring(0, 80)}`);
      lastError = error;
      if (errorMsg.includes("quota") || errorMsg.includes("demand")) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
      continue;
    }
  }

  throw lastError;
};

const cleanJSON = (text) => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .replace(/^[^[{]*/, "")
    .replace(/[^}\]]*$/, "")
    .trim();
};

const safeParse = (text, fallback = null) => {
  if (!text) return fallback;

  try {
    const cleaned = cleanJSON(text);
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("❌ JSON parse error:", e.message);
    console.error("Raw text preview:", text.substring(0, 300));

    // ⭐ TRY 1: Extract valid JSON array/object using regex
    try {
      // Match outermost JSON array or object
      const arrayMatch = text.match(/\[[\s\S]*\]/);
      const objectMatch = text.match(/\{[\s\S]*\}/);
      
      const match = arrayMatch || objectMatch;
      if (match) {
        return JSON.parse(match[0]);
      }
    } catch (e2) {
      console.log("⚠️ Regex extraction failed");
    }

    // ⭐ TRY 2: Parse array of objects individually (for question lists)
    try {
      const cleaned = cleanJSON(text);
      
      // Find all complete objects in array
      const objects = [];
      let depth = 0;
      let start = -1;
      let inString = false;
      let escape = false;

      for (let i = 0; i < cleaned.length; i++) {
        const char = cleaned[i];
        
        if (escape) {
          escape = false;
          continue;
        }
        if (char === "\\") {
          escape = true;
          continue;
        }
        if (char === '"' && !escape) {
          inString = !inString;
          continue;
        }
        if (inString) continue;
        
        if (char === "{") {
          if (depth === 0) start = i;
          depth++;
        } else if (char === "}") {
          depth--;
          if (depth === 0 && start !== -1) {
            try {
              const obj = JSON.parse(cleaned.substring(start, i + 1));
              objects.push(obj);
            } catch (e3) {
              // Skip malformed object
            }
            start = -1;
          }
        }
      }

      if (objects.length > 0) {
        console.log(`✅ Recovered ${objects.length} objects from malformed JSON`);
        return objects;
      }
    } catch (e4) {
      console.log("⚠️ Object-by-object parsing failed");
    }

    console.error("❌ All recovery attempts failed");
    return fallback;
  }
};
// ═══════════════════════════════════════
//   1. EXTRACT TASKS FROM JOURNAL
// ═══════════════════════════════════════
export const extractTasksFromJournal = async (journalText, userContext) => {
  const prompt = `
You are a smart productivity coach. Analyze this journal entry.

USER CONTEXT:
- Goal: ${userContext.goal || "Not set"}
- Phase: ${userContext.currentPhase || "N/A"}
- Type: ${userContext.isStudent ? "Student" : "Professional"}

JOURNAL:
"${journalText}"

Extract actionable tasks. Return ONLY valid JSON:
{
  "tasks": [
    {
      "title": "Clear task name max 60 chars",
      "priority": "high",
      "category": "study",
      "time": "15:00",
      "location": null,
      "estimatedDuration": "2 hours",
      "goalAligned": true,
      "goalContribution": "How this helps the goal"
    }
  ],
  "missingGoalTasks": [
    {
      "title": "Suggested task",
      "reason": "Why important",
      "priority": "high"
    }
  ],
  "motivation": "Short motivational message"
}

Rules:
- category: "study" | "work" | "personal" | "health" | "travel"
- priority: "high" | "medium" | "low"
- time: HH:MM format or null
- goalAligned: true if task helps goal
- missingGoalTasks: 1-3 important tasks user forgot
`;

  const response = await callAI(prompt);
  console.log("🤖 AI Response preview:", response.substring(0, 150) + "...");

  return safeParse(response, {
    tasks: [],
    missingGoalTasks: [],
    motivation: "Keep going! 🌸",
  });
};

// ═══════════════════════════════════════
//   2. GOAL ROADMAP
// ═══════════════════════════════════════
export const generateGoalRoadmap = async (goal, duration, isStudent) => {
  const prompt = `
Create roadmap for:
GOAL: "${goal}"
DURATION: "${duration}"
USER TYPE: ${isStudent ? "Student" : "Professional"}

Return ONLY valid JSON:
{
  "goal": "${goal}",
  "totalDuration": "${duration}",
  "phases": [
    {
      "name": "Phase name",
      "duration": "2 months",
      "focus": "Focus area",
      "milestones": ["Milestone 1"],
      "dailyHabits": ["Habit 1"]
    }
  ],
  "criticalSuccess": ["Factor 1"],
  "warningSign": "Falling behind sign"
}
`;

  try {
    const response = await callAI(prompt);
    return safeParse(response, null);
  } catch (error) {
    return null;
  }
};

// ═══════════════════════════════════════
//   3. MOCK TEST
// ═══════════════════════════════════════
export const generateMockTest = async (topic, numQuestions = 5) => {
  const prompt = `
Generate ${numQuestions} MCQs about: "${topic}"

Return ONLY valid JSON array:
[
  {
    "question": "Question?",
    "options": ["A", "B", "C", "D"],
    "correctIndex": 0,
    "explanation": "Why correct"
  }
]
`;

  const response = await callAI(prompt);
  return safeParse(response, []);
};
// ═══════════════════════════════════════
//   📝 GENERATE TEST FROM NOTES (FIXED)
// ═══════════════════════════════════════
export const generateTestFromNotes = async (notes, numQuestions = 5) => {
  console.log(`📝 Generating test from ${notes.length} notes`);

  // Combine all notes content (limit content size to avoid hitting limits)
  const combinedContent = notes
    .map((note, i) => {
      const content = (note.content || "").substring(0, 2000); // Cap each note
      return `
=== Note ${i + 1}: ${note.title} ===
Category: ${note.category || "general"}
Content:
${content}
`;
    })
    .join("\n\n");

  const topicName = notes.length === 1
    ? notes[0].title
    : `${notes[0].title} & ${notes.length - 1} more`;

  const prompt = `You are an expert test creator. Generate exactly ${numQuestions} multiple-choice questions based on these notes.

USER'S NOTES:
${combinedContent}

RULES:
- Generate exactly ${numQuestions} questions
- Each question has 4 options
- Keep questions concise but clear
- Keep explanations brief (1-2 sentences max)
- If notes contain code, test understanding of concepts (not memorization of exact syntax)
- Cover different aspects of the notes

Return ONLY this JSON (no markdown, no extra text):
{
  "questions": [
    {
      "question": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "Brief explanation"
    }
  ]
}`;

  try {
    // ⭐ Use higher token limit for this specific call
    const response = await callAI(prompt, "", { maxOutputTokens: 4000 });
    const parsed = safeParse(response, { questions: [] });

    if (!parsed.questions || parsed.questions.length === 0) {
      console.error("Parsed result:", parsed);
      console.error("Raw response length:", response?.length);
      throw new Error("AI couldn't generate questions from these notes. Try fewer questions or shorter notes.");
    }

    console.log(`✅ Generated ${parsed.questions.length} questions`);

    return {
      topic: topicName,
      questions: parsed.questions,
      source: "notes",
    };
  } catch (error) {
    console.error("❌ Test from notes error:", error.message);
    throw error;
  }
};

// ═══════════════════════════════════════
//   4. KEY POINTS
// ═══════════════════════════════════════
export const generateKeyPoints = async (input, sourceType = "text") => {
  let prompt;

  if (sourceType === "topic") {
    prompt = `
Generate important key points about: "${input}"

Return ONLY valid JSON:
{
  "topic": "${input}",
  "points": ["Point 1", "Point 2"],
  "summary": "Brief summary"
}

Generate 7-10 important points.
`;
  } else {
    prompt = `
Extract key points from this text.

CONTENT:
${input}

Return ONLY valid JSON:
{
  "topic": "Detect topic",
  "points": ["Point 1", "Point 2"],
  "summary": "Brief summary"
}
`;
  }

  const response = await callAI(prompt);
  return safeParse(response, { topic: input.substring(0, 50), points: [], summary: "" });
};

export const extractKeyPoints = async (text) => {
  const result = await generateKeyPoints(text, "text");
  return result.points || [];
};

// ═══════════════════════════════════════
//   5. FOOD
// ═══════════════════════════════════════
export const getFoodRecommendation = async () => {
  const hour = new Date().getHours();
  let mealType = "snack";
  if (hour < 10) mealType = "breakfast";
  else if (hour < 14) mealType = "lunch";
  else if (hour < 17) mealType = "snack";
  else if (hour < 21) mealType = "dinner";

  const prompt = `
Suggest 3 healthy ${mealType} options for someone in India.

Return ONLY valid JSON:
{
  "mealType": "${mealType}",
  "suggestions": [
    {
      "name": "Food name",
      "emoji": "🥗",
      "description": "Brief description",
      "benefits": "Why good"
    }
  ]
}
`;

  try {
    const response = await callAI(prompt);
    return safeParse(response, {
      mealType,
      suggestions: [{ name: "Nuts", emoji: "🥜", description: "Healthy", benefits: "Brain food" }],
    });
  } catch (e) {
    return {
      mealType,
      suggestions: [{ name: "Nuts", emoji: "🥜", description: "Healthy", benefits: "Brain food" }],
    };
  }
};

// ═══════════════════════════════════════
//   6. ANSWER DOUBT
// ═══════════════════════════════════════
export const answerDoubt = async (question, topic, userContext) => {
  const prompt = `
A ${userContext.isStudent ? "student" : "professional"} is studying ${topic || "general"}.

Their question: "${question}"

Return ONLY valid JSON:
{
  "answer": "Clear answer (2-4 sentences)",
  "topic": "Topic name",
  "difficulty": "medium",
  "keyPoints": ["Key point 1", "Key point 2"],
  "relatedQuestions": ["Question 1", "Question 2"]
}
`;

  const response = await callAI(prompt);
  return safeParse(response, {
    answer: "Sorry, couldn't process. Try rephrasing!",
    topic: topic || "General",
    difficulty: "medium",
    keyPoints: [],
    relatedQuestions: [],
  });
};

// ═══════════════════════════════════════
//   7. GENERATE TEST FROM DOUBTS
// ═══════════════════════════════════════
export const generateTestFromDoubts = async (doubts, numQuestions = 5) => {
  console.log(`📝 Generating test from ${doubts.length} doubts`);

  // Truncate each doubt's answer to avoid token overflow
  const doubtsContent = doubts
    .slice(0, 15) // Max 15 doubts
    .map((d, i) => {
      const answer = (d.answer || "").substring(0, 500); // Cap answer length
      return `
Doubt ${i + 1} (Topic: ${d.topic || "General"}):
Q: ${d.question}
A: ${answer}
`;
    })
    .join("\n");

  const prompt = `Based on these student doubts and answers, generate exactly ${numQuestions} multiple-choice questions to test their understanding.

DOUBTS:
${doubtsContent}

RULES:
- Generate exactly ${numQuestions} MCQs
- Each question has 4 options
- Keep questions clear and concise
- DO NOT use special characters like backticks or quotes inside question/option text
- Use simple punctuation only
- Keep explanations brief (1-2 sentences)
- Test concepts from the doubts above

Return ONLY this JSON array (no markdown, no extra text):
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Brief explanation"
  }
]`;

  try {
    const response = await callAI(prompt, "", { maxOutputTokens: 4000 });
    const parsed = safeParse(response, []);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error("Failed to parse questions");
      return [];
    }

    // Validate each question
    const validQuestions = parsed.filter(
      (q) =>
        q.question &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        typeof q.correctIndex === "number"
    );

    console.log(`✅ Got ${validQuestions.length}/${parsed.length} valid questions`);
    return validQuestions;
  } catch (error) {
    console.error("❌ Test from doubts error:", error.message);
    return [];
  }
};

// ═══════════════════════════════════════
//   8. CHAT WITH ASSISTANT 🤖
// ═══════════════════════════════════════
export const chatWithAssistant = async (message, history, userContext) => {
  const conversationHistory = history
    .slice(-10)
    .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
    .join("\n");

  const systemPrompt = `You are a helpful AI study & productivity assistant for ${userContext.name || "the user"}.

USER PROFILE:
- Name: ${userContext.name || "User"}
- Type: ${userContext.isStudent ? "Student" : "Professional"}
- Long-term Goal: ${userContext.goal || "Not set"}
- Current Phase: ${userContext.currentPhase || "N/A"}
${userContext.studyField ? `- Studying: ${userContext.studyField}` : ""}
${userContext.profession ? `- Profession: ${userContext.profession}` : ""}

YOUR ROLE:
- Help with studies, productivity, motivation
- Answer questions about their goal
- Give specific, actionable advice
- Be encouraging and supportive
- Keep responses concise (2-5 sentences usually)
- Use markdown formatting (bold, lists, code blocks)
- Use emojis sparingly

Previous conversation:
${conversationHistory || "(This is the start of conversation)"}`;

  const prompt = `${systemPrompt}

User just said: "${message}"

Respond helpfully and concisely.`;

  try {
    const response = await callAIText(prompt);
    return response.trim();
  } catch (error) {
    console.error("❌ Chat error:", error.message);
    throw error;
  }
};

// ─── Generate chat title ───
export const generateChatTitle = async (firstMessage) => {
  const prompt = `Generate a short title (max 5 words) for a chat starting with: "${firstMessage}"

Return ONLY the title, no quotes.`;

  try {
    const response = await callAIText(prompt);
    return response.trim().replace(/^["']|["']$/g, "").substring(0, 50);
  } catch (error) {
    return firstMessage.substring(0, 30) + "...";
  }
};
// ═══════════════════════════════════════
//   📝 GENERATE KEY POINTS FROM NOTES
// ═══════════════════════════════════════
export const generateKeyPointsFromNotes = async (notes) => {
  console.log(`💡 Generating key points from ${notes.length} notes`);

  // Combine notes content
  const combinedContent = notes
    .map((note, i) => {
      const content = (note.content || "").substring(0, 2500);
      return `
=== Note ${i + 1}: ${note.title} ===
Category: ${note.category || "general"}
Content:
${content}
`;
    })
    .join("\n\n");

  const topicName = notes.length === 1
    ? notes[0].title
    : `${notes[0].title} & ${notes.length - 1} more notes`;

  const prompt = `You are an expert at extracting key learning points. Analyze these notes and extract the MOST important points to remember.

USER'S NOTES:
${combinedContent}

RULES:
- Extract 7-12 key points (more if content is rich)
- Each point should be concise (1-2 sentences max)
- Focus on facts, concepts, and important details
- If notes contain code, extract conceptual takeaways
- Cover different aspects across all notes
- Use clear, simple language

Return ONLY this JSON (no markdown, no extra text):
{
  "topic": "${topicName}",
  "points": [
    "First important point",
    "Second important point"
  ],
  "summary": "Brief 1-2 sentence summary of all notes"
}`;

  try {
    const response = await callAI(prompt, "", { maxOutputTokens: 3000 });
    const parsed = safeParse(response, { topic: topicName, points: [], summary: "" });

    if (!parsed.points || parsed.points.length === 0) {
      throw new Error("AI couldn't extract key points from these notes");
    }

    console.log(`✅ Extracted ${parsed.points.length} key points`);

    return {
      topic: parsed.topic || topicName,
      points: parsed.points,
      summary: parsed.summary || "",
    };
  } catch (error) {
    console.error("❌ Key points from notes error:", error.message);
    throw error;
  }
};

// ═══════════════════════════════════════
//   📄 GENERATE KEY POINTS FROM FILES
// ═══════════════════════════════════════
export const generateKeyPointsFromFiles = async (filesContent, topicHint = "") => {
  console.log(`💡 Generating key points from ${filesContent.length} files`);

  // Combine all files content
  const combinedContent = filesContent
    .map((file, i) => {
      const content = (file.content || "").substring(0, 3000);
      return `
=== File ${i + 1}: ${file.filename} ===
${content}
`;
    })
    .join("\n\n");

  const topicName = topicHint || (filesContent.length === 1
    ? filesContent[0].filename.replace(/\.[^/.]+$/, "")
    : `${filesContent[0].filename} & ${filesContent.length - 1} more files`);

  const prompt = `You are an expert at extracting key learning points from documents. Analyze these files and extract the MOST important points.

DOCUMENT CONTENT:
${combinedContent}

RULES:
- Extract 8-15 key points (based on content depth)
- Each point should be clear and concise (1-2 sentences)
- Focus on key concepts, facts, and important details
- Cover different sections/topics from the documents
- Use simple, clear language
- If documents contain technical content, capture important formulas/concepts

Return ONLY this JSON (no markdown, no extra text):
{
  "topic": "${topicName}",
  "points": [
    "First key point",
    "Second key point"
  ],
  "summary": "Brief 1-2 sentence summary"
}`;

  try {
    const response = await callAI(prompt, "", { maxOutputTokens: 4000 });
    const parsed = safeParse(response, { topic: topicName, points: [], summary: "" });

    if (!parsed.points || parsed.points.length === 0) {
      throw new Error("AI couldn't extract key points from these files");
    }

    console.log(`✅ Extracted ${parsed.points.length} key points from files`);

    return {
      topic: parsed.topic || topicName,
      points: parsed.points,
      summary: parsed.summary || "",
    };
  } catch (error) {
    console.error("❌ Key points from files error:", error.message);
    throw error;
  }
};
export const cleanupDuplicateTasks = async () => {
  const res = await fetch(`${API_URL}/journal/cleanup-duplicates`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleResponse(res);
};