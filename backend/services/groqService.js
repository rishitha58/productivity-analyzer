// ═══════════════════════════════════════════════════════
//   🚀 GROQ AI SERVICE
//   Used for: AI Chat + Focus Mode Doubts
// ═══════════════════════════════════════════════════════

import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;

if (!GROQ_API_KEY) {
  console.error("❌ GROQ_API_KEY missing in .env");
} else {
  console.log("✅ Groq Key loaded:", GROQ_API_KEY.substring(0, 10) + "...");
}

const groq = new Groq({ apiKey: GROQ_API_KEY });

// Models with fallback
const GROQ_MODELS = [
  "llama-3.3-70b-versatile",   // Best quality
  "llama-3.1-8b-instant",       // Fast fallback
  "gemma2-9b-it",                // Alternative
];

// ═══════════════════════════════════════
//   CORE GROQ CALL (with model fallback)
// ═══════════════════════════════════════
const callGroq = async (messages, options = {}) => {
  let lastError;

  for (const model of GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        messages,
        model,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1024,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error("Empty response");

      console.log(`✅ Groq success with: ${model}`);
      return response;
    } catch (error) {
      console.log(`⚠️  ${model} failed: ${error.message?.substring(0, 80)}`);
      lastError = error;
      continue;
    }
  }

  throw lastError;
};

// ═══════════════════════════════════════
//   💬 CHAT WITH ASSISTANT (AI Chat Page)
// ═══════════════════════════════════════
export const chatWithGroq = async (message, history, userContext) => {
  console.log("🤖 Groq chat for:", userContext?.name || "User");

  try {
    const systemMessage = `You are a helpful AI study & productivity assistant for ${userContext?.name || "the user"}.

USER PROFILE:
- Name: ${userContext?.name || "User"}
- Type: ${userContext?.isStudent ? "Student" : "Professional"}
- Long-term Goal: ${userContext?.goal || "Not set"}
- Current Phase: ${userContext?.currentPhase || "N/A"}
${userContext?.studyField ? `- Studying: ${userContext.studyField}` : ""}
${userContext?.profession ? `- Profession: ${userContext.profession}` : ""}

YOUR ROLE:
- Help with studies, productivity, motivation
- Answer questions about their goal
- Give specific, actionable advice
- Be encouraging and supportive
- Keep responses concise (2-5 sentences usually)
- Use markdown formatting (bold, lists, code blocks)
- Use emojis sparingly`;

    const messages = [
      { role: "system", content: systemMessage },
      ...(history || [])
        .slice(-10)
        .filter((m) => m && m.content && m.content.trim())
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          content: m.content,
        })),
      { role: "user", content: message },
    ];

    const response = await callGroq(messages, {
      temperature: 0.7,
      max_tokens: 1024,
    });

    return response.trim();
  } catch (error) {
    console.error("❌ Groq chat error:", error.message);
    throw error;
  }
};

// ═══════════════════════════════════════
//   📝 GENERATE CHAT TITLE
// ═══════════════════════════════════════
export const generateChatTitleGroq = async (firstMessage) => {
  try {
    const messages = [
      {
        role: "user",
        content: `Generate a short title (max 5 words) for a chat starting with: "${firstMessage}"

Return ONLY the title text, no quotes, no explanation.`,
      },
    ];

    const response = await callGroq(messages, {
      temperature: 0.5,
      max_tokens: 50,
    });

    return response.trim().replace(/^["']|["']$/g, "").substring(0, 50);
  } catch (error) {
    return firstMessage.substring(0, 30) + "...";
  }
};

// ═══════════════════════════════════════
//   🧠 ANSWER DOUBT (Focus Mode) - IMPROVED
// ═══════════════════════════════════════
export const answerDoubtWithGroq = async (question, topic, userContext) => {
  console.log("🧠 Groq answering doubt:", question.substring(0, 50));

  try {
    // ⭐ STEP 1: Get the ANSWER (plain markdown text)
    const answerSystemMessage = `You are an expert tutor helping a ${userContext?.isStudent ? "student" : "professional"}.

Answer the doubt clearly and helpfully:
- Use simple language
- Include examples when helpful
- Use markdown formatting: **bold**, bullet lists, \`code\`, code blocks
- Use ## for section headings if needed
- Keep answer focused but complete (4-8 sentences typically)
- If code-related, include working code examples
- Be encouraging

Just answer naturally with good markdown. Don't return JSON.`;

    const answerUserMessage = topic
      ? `Topic context: ${topic}\n\nMy doubt: ${question}`
      : `My doubt: ${question}`;

    const answer = await callGroq(
      [
        { role: "system", content: answerSystemMessage },
        { role: "user", content: answerUserMessage },
      ],
      { temperature: 0.7, max_tokens: 1200 }
    );

    // ⭐ STEP 2: Get metadata (JSON) in a separate call
    let metadata = {
      topic: topic || "General",
      difficulty: "medium",
      keyPoints: [],
      relatedQuestions: [],
    };

    try {
      const metaSystemMessage = `You analyze educational Q&A. Return ONLY valid JSON, no markdown, no extra text.

Format:
{
  "topic": "Short topic name (1-3 words)",
  "difficulty": "easy",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "relatedQuestions": ["Question 1?", "Question 2?"]
}`;

      const metaUserMessage = `Question: ${question}

Answer: ${answer.substring(0, 800)}

Analyze and return JSON with topic, difficulty (easy/medium/hard), 3 key points, and 2 related questions.`;

      const metaResponse = await callGroq(
        [
          { role: "system", content: metaSystemMessage },
          { role: "user", content: metaUserMessage },
        ],
        { temperature: 0.3, max_tokens: 500 }
      );

      // Clean & parse JSON
      const cleaned = metaResponse
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      // Find JSON object
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        metadata = {
          topic: parsed.topic || topic || "General",
          difficulty: parsed.difficulty || "medium",
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
          relatedQuestions: Array.isArray(parsed.relatedQuestions)
            ? parsed.relatedQuestions
            : [],
        };
      }
    } catch (metaError) {
      console.log("⚠️ Metadata extraction failed, using defaults");
    }

    return {
      answer: answer.trim(),
      topic: metadata.topic,
      difficulty: metadata.difficulty,
      keyPoints: metadata.keyPoints,
      relatedQuestions: metadata.relatedQuestions,
    };
  } catch (error) {
    console.error("❌ Groq doubt error:", error.message);
    throw error;
  }
};