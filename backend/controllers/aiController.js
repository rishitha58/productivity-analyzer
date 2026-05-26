// backend/controllers/aiController.js
const axios = require('axios');
const AIConversation = require('../models/AIConversation');
const ImportantPoints = require('../models/ImportantPoints');
const MockTest = require('../models/MockTest');
const Mistake = require('../models/Mistake');
const { aiRateLimiter } = require('../middleware/rateLimiter');

const GROK_API_URL = 'https://api.x.ai/v1';
const GROK_API_KEY = process.env.GROK_API_KEY;

// Helper: Call Grok AI
async function callGrokAI(messages, systemPrompt, maxTokens = 2000) {
  const response = await axios.post(
    `${GROK_API_URL}/chat/completions`,
    {
      model: 'grok-beta',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  return response.data.choices[0].message.content;
}

// @desc Chat with AI assistant
exports.chat = async (req, res, next) => {
  try {
    const { message, sessionType = 'general', conversationId, topic, subject } = req.body;

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await AIConversation.findById(conversationId);
    }

    if (!conversation) {
      conversation = await AIConversation.create({
        userId: req.user._id,
        sessionType,
        topic,
        subject,
        messages: [],
      });
    }

    // Add user message
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Build system prompt based on session type
    const systemPrompt = buildSystemPrompt(sessionType, req.user, topic, subject);

    // Get conversation history (last 20 messages)
    const historyMessages = conversation.messages
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    // Call Grok AI
    let aiResponse;
    try {
      aiResponse = await callGrokAI(historyMessages, systemPrompt);
    } catch (error) {
      console.error('Grok AI error:', error.message);
      aiResponse = 'I apologize, but I am experiencing technical difficulties. Please try again in a moment.';
    }

    // Add AI response to conversation
    conversation.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      metadata: {
        isStudyRelated: sessionType === 'study' || sessionType === 'important-points',
        topic,
        hasImportantPoints: aiResponse.includes('important') || aiResponse.includes('key'),
      },
    });

    await conversation.save();

    // If study session, track for mock test generation
    if (sessionType === 'study' || sessionType === 'important-points') {
      await trackStudyTopics(conversation, topic, subject);
    }

    res.json({
      success: true,
      response: aiResponse,
      conversationId: conversation._id,
      sessionType,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Generate important points for a topic
exports.generateImportantPoints = async (req, res, next) => {
  try {
    const { topic, subject, pdfContent, pdfFileName, conversationId } = req.body;

    const systemPrompt = `You are an expert educator and study assistant. Your task is to generate comprehensive, well-organized important points on the given topic. 
    
    Structure your response as:
    1. Core Concepts (Critical)
    2. Key Formulas/Definitions/Theorems
    3. Important Examples and Applications
    4. Common Misconceptions
    5. Exam-Focused Points
    6. Advanced Concepts
    
    Be thorough, accurate, and educational. Use clear, concise language.`;

    let prompt = `Generate all important points for the topic: "${topic}"`;
    if (subject) prompt += ` in the subject: "${subject}"`;

    let pdfMissedPoints = [];

    // If PDF content provided, find gaps
    if (pdfContent) {
      const gapPrompt = `
      A student has a PDF on "${topic}" with the following content summary:
      "${pdfContent.substring(0, 2000)}"
      
      After generating all important points for "${topic}", also identify:
      - Points that are NOT covered in the PDF
      - Critical information missing from the PDF
      - Additional important aspects the student should know
      
      Mark PDF-missing points clearly.`;

      prompt = gapPrompt;
    }

    const aiResponse = await callGrokAI(
      [{ role: 'user', content: prompt }],
      systemPrompt,
      4000
    );

    // Parse response into structured points
    const structuredPoints = parseImportantPoints(aiResponse, pdfContent);

    // Save to database
    const importantPoints = await ImportantPoints.create({
      userId: req.user._id,
      topic,
      subject,
      points: structuredPoints,
      pdfContent: pdfContent || '',
      pdfFileName: pdfFileName || '',
      hasPdf: !!pdfContent,
      conversationId,
      generatedAt: new Date(),
    });

    // Track for mock test
    if (conversationId) {
      await AIConversation.findByIdAndUpdate(conversationId, {
        importantPointsGenerated: true,
        $addToSet: { mockTestReadyTopics: topic },
      });
    }

    res.json({
      success: true,
      importantPoints,
      rawResponse: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Generate mock test
exports.generateMockTest = async (req, res, next) => {
  try {
    const { topic, subject, conversationIds, difficulty = 'medium', questionCount = 10 } = req.body;

    // Gather context from conversations
    let conversationContext = '';
    if (conversationIds && conversationIds.length > 0) {
      const conversations = await AIConversation.find({
        _id: { $in: conversationIds },
        userId: req.user._id,
      });

      conversationContext = conversations
        .flatMap((c) => c.messages)
        .filter((m) => m.metadata?.isStudyRelated)
        .map((m) => m.content)
        .join('\n')
        .substring(0, 3000);
    }

    const systemPrompt = `You are an expert exam creator. Generate ${questionCount} high-quality ${difficulty} difficulty questions.
    
    Return ONLY valid JSON in this exact format:
    {
      "questions": [
        {
          "question": "question text",
          "type": "mcq",
          "options": ["A) option1", "B) option2", "C) option3", "D) option4"],
          "correctAnswer": "A) option1",
          "explanation": "explanation",
          "difficulty": "${difficulty}",
          "topic": "specific topic"
        }
      ]
    }`;

    let prompt = `Generate ${questionCount} ${difficulty} questions on "${topic}"`;
    if (subject) prompt += ` for ${subject}`;
    if (conversationContext) {
      prompt += `\n\nBased on these study sessions:\n${conversationContext}`;
    }
    prompt += '\n\nFocus on concepts discussed. Mix MCQ, true/false questions.';

    const aiResponse = await callGrokAI(
      [{ role: 'user', content: prompt }],
      systemPrompt,
      3000
    );

    let questions = [];
    try {
      const parsed = JSON.parse(aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, ''));
      questions = parsed.questions || [];
    } catch (parseError) {
      questions = extractQuestionsFromText(aiResponse);
    }

    const mockTest = await MockTest.create({
      userId: req.user._id,
      title: `Mock Test: ${topic}`,
      topic,
      subject,
      questions,
      totalQuestions: questions.length,
      timeLimit: questionCount * 2,
      conversationIds,
      status: 'pending',
    });

    res.json({ success: true, mockTest });
  } catch (error) {
    next(error);
  }
};

// @desc Submit mock test
exports.submitMockTest = async (req, res, next) => {
  try {
    const { testId, answers, timeTaken } = req.body;

    const mockTest = await MockTest.findOne({
      _id: testId,
      userId: req.user._id,
    });

    if (!mockTest) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    let correct = 0;
    let wrong = 0;
    const mistakes = [];

    mockTest.questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      q.userAnswer = userAnswer;
      q.timeTaken = timeTaken?.[idx];

      if (userAnswer === q.correctAnswer) {
        q.isCorrect = true;
        correct++;
      } else {
        q.isCorrect = false;
        wrong++;
        mistakes.push({
          question: q.question,
          userAnswer,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          topic: q.topic || mockTest.topic,
          subject: mockTest.subject,
          difficulty: q.difficulty,
        });
      }
    });

    const skipped = mockTest.totalQuestions - correct - wrong;

    mockTest.correctAnswers = correct;
    mockTest.wrongAnswers = wrong;
    mockTest.skippedAnswers = skipped;
    mockTest.score = correct;
    mockTest.maxScore = mockTest.totalQuestions;
    mockTest.percentage = Math.round((correct / mockTest.totalQuestions) * 100);
    mockTest.duration = timeTaken?.total || 0;
    mockTest.status = 'completed';
    mockTest.completedAt = new Date();

    await mockTest.save();

    // Save mistakes for review
    if (mistakes.length > 0) {
      await Mistake.insertMany(
        mistakes.map((m) => ({
          ...m,
          userId: req.user._id,
          mockTestId: mockTest._id,
        }))
      );
    }

    res.json({
      success: true,
      mockTest,
      mistakes: mistakes.length,
      percentage: mockTest.percentage,
    });
  } catch (error) {
    next(error);
  }
};

// Helper: Build system prompt
function buildSystemPrompt(sessionType, user, topic, subject) {
  const userName = user.name;
  const isStudent = user.onboardingData?.isStudent;

  const basePrompt = `You are a helpful AI assistant named ARIA (Adaptive Research & Intelligence Assistant) for ${userName}'s productivity app.`;

  const prompts = {
    general: `${basePrompt} Help with productivity, planning, and general queries. Be concise and actionable.`,
    study: `${basePrompt} You are in STUDY MODE for ${subject || 'academics'}${topic ? ` on topic: ${topic}` : ''}. 
    Help the student understand concepts, solve problems, and clarify doubts. 
    Be detailed and educational. After explanations, ask if they want practice questions.`,
    'important-points': `${basePrompt} Generate comprehensive important points and key concepts.
    Be thorough, well-structured, and exam-focused. Identify critical vs nice-to-know information.`,
    'mock-test-prep': `${basePrompt} Help prepare for mock tests. Focus on practice questions,
    weak areas, and exam strategies.`,
    'goal-planning': `${basePrompt} Help with goal setting and long-term planning.
    Break down goals into actionable steps and realistic timelines.`,
  };

  return prompts[sessionType] || prompts.general;
}

// Helper: Parse important points
function parseImportantPoints(text, hasPdf) {
  const lines = text.split('\n').filter((l) => l.trim());
  return lines.slice(0, 50).map((line, i) => ({
    point: line.replace(/^[\d\.\-\*]+\s*/, '').trim(),
    importance: i < 5 ? 'critical' : i < 15 ? 'high' : 'medium',
    source: 'ai-generated',
    pdfMissed: hasPdf && line.toLowerCase().includes('not in pdf'),
  }));
}

// Helper: Extract questions from text
function extractQuestionsFromText(text) {
  // Basic extraction fallback
  return [{
    question: 'Sample question from the topic',
    type: 'mcq',
    options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
    correctAnswer: 'A) Option 1',
    explanation: 'This is a generated question',
    difficulty: 'medium',
    topic: 'general',
  }];
}

// Helper: Track study topics
async function trackStudyTopics(conversation, topic, subject) {
  if (topic) {
    conversation.mockTestReadyTopics = [
      ...new Set([...(conversation.mockTestReadyTopics || []), topic]),
    ];
    await conversation.save();
  }
}

// @desc Get AI conversation history
exports.getConversations = async (req, res, next) => {
  try {
    const { sessionType, limit = 10 } = req.query;
    const query = { userId: req.user._id };
    if (sessionType) query.sessionType = sessionType;

    const conversations = await AIConversation.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select('-messages')
      .lean();

    res.json({ success: true, conversations });
  } catch (error) {
    next(error);
  }
};