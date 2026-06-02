import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const KEY = process.env.GEMINI_API_KEY;

// 🤖 Same models as aiService.js
const MODELS = [
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-2.0-flash-lite",
];

// ─── Helper: Call any model ───
const tryModel = async (modelName, prompt = "Say hi in 3 words") => {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${KEY}`;
    const response = await axios.post(
      url,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      },
      { timeout: 15000 }
    );
    return {
      success: true,
      text: response.data.candidates[0].content.parts[0].text,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.error?.message || error.message,
    };
  }
};

// ─── TEST 1: Check API Key ───
const testAPIKey = async () => {
  console.log("\n═══════════════════════════════════════");
  console.log("📋 TEST 1: API Key Check");
  console.log("═══════════════════════════════════════");

  if (!KEY) {
    console.log("❌ GEMINI_API_KEY not found in .env file!");
    return false;
  }

  console.log(`✅ API Key loaded: ${KEY.substring(0, 10)}...${KEY.substring(KEY.length - 4)}`);
  return true;
};

// ─── TEST 2: List All Available Models ───
const testAvailableModels = async () => {
  console.log("\n═══════════════════════════════════════");
  console.log("📋 TEST 2: Available Models");
  console.log("═══════════════════════════════════════");

  try {
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${KEY}`
    );

    const generateModels = response.data.models.filter((m) =>
      m.supportedGenerationMethods?.includes("generateContent")
    );

    console.log(`✅ Found ${generateModels.length} text-generation models`);
    return true;
  } catch (error) {
    console.log("❌ Failed:", error.response?.data?.error?.message || error.message);
    return false;
  }
};

// ─── TEST 3: Test Each Model ───
const testEachModel = async () => {
  console.log("\n═══════════════════════════════════════");
  console.log("📋 TEST 3: Testing Each Model");
  console.log("═══════════════════════════════════════");

  const working = [];
  const failed = [];

  for (const model of MODELS) {
    process.stdout.write(`Testing ${model}... `);
    const result = await tryModel(model);
    if (result.success) {
      console.log(`✅ Works`);
      working.push(model);
    } else {
      console.log(`❌ ${result.error.substring(0, 60)}`);
      failed.push({ model, error: result.error });
    }
  }

  console.log(`\n✅ Working: ${working.length}/${MODELS.length}`);
  if (working.length > 0) {
    console.log(`🎯 Best model to use: ${working[0]}`);
  }
  return working;
};

// ─── TEST 4: Test JSON Task Extraction ───
const testTaskExtraction = async (workingModels) => {
  console.log("\n═══════════════════════════════════════");
  console.log("📋 TEST 4: Task Extraction (JSON)");
  console.log("═══════════════════════════════════════");

  if (workingModels.length === 0) {
    console.log("❌ No working models to test");
    return;
  }

  const prompt = `
Extract tasks from this journal. Return ONLY JSON array (no markdown):

JOURNAL: "Study React for 2 hours at 9am, meeting at 3pm in office"

Format:
[
  {
    "title": "task name",
    "time": "09:00",
    "priority": "high"
  }
]
`;

  for (const model of workingModels.slice(0, 3)) {
    console.log(`\nTesting JSON with ${model}:`);
    const result = await tryModel(model, prompt);

    if (result.success) {
      try {
        const cleaned = result.text.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        console.log(`✅ Valid JSON returned (${parsed.length} tasks)`);
        console.log("   Sample:", JSON.stringify(parsed[0], null, 2));
      } catch (e) {
        console.log(`⚠️  Got response but invalid JSON`);
        console.log(`   Raw: ${result.text.substring(0, 200)}...`);
      }
    } else {
      console.log(`❌ Failed: ${result.error.substring(0, 60)}`);
    }
  }
};

// ─── TEST 5: Test Speed ───
const testSpeed = async (workingModels) => {
  console.log("\n═══════════════════════════════════════");
  console.log("📋 TEST 5: Response Speed");
  console.log("═══════════════════════════════════════");

  for (const model of workingModels.slice(0, 5)) {
    const start = Date.now();
    const result = await tryModel(model, "Count from 1 to 5");
    const time = Date.now() - start;

    if (result.success) {
      console.log(`✅ ${model.padEnd(30)} ${time}ms`);
    } else {
      console.log(`❌ ${model.padEnd(30)} Failed`);
    }
  }
};

// ─── MAIN ───
const runAllTests = async () => {
  console.log("\n🤖 GEMINI AI TEST SUITE");
  console.log("══════════════════════════════════════════");
  console.log(`Started: ${new Date().toLocaleString()}`);

  // Test 1: Key
  const keyOk = await testAPIKey();
  if (!keyOk) {
    console.log("\n⛔ Cannot continue without API key. Add to .env file:");
    console.log("   GEMINI_API_KEY=your_key_here");
    return;
  }

  // Test 2: List models
  await testAvailableModels();

  // Test 3: Test each model
  const working = await testEachModel();

  if (working.length === 0) {
    console.log("\n⛔ No working models. Check your API key & quota.");
    return;
  }

  // Test 4: JSON
  await testTaskExtraction(working);

  // Test 5: Speed
  await testSpeed(working);

  // ─── Final Summary ───
  console.log("\n══════════════════════════════════════════");
  console.log("✨ FINAL RECOMMENDATIONS");
  console.log("══════════════════════════════════════════");
  console.log(`\n✅ Use this model in aiService.js:`);
  console.log(`   ${working[0]}\n`);
  console.log(`Update line in aiService.js to:`);
  console.log(`   "https://generativelanguage.googleapis.com/v1beta/models/${working[0]}:generateContent?key=..."\n`);
  
  console.log(`📌 Fallback chain (already in aiService.js):`);
  working.forEach((m, i) => console.log(`   ${i + 1}. ${m}`));
};

runAllTests().catch(console.error);