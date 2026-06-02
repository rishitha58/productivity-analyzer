import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { signupUser, loginUser, completeOnboarding } from "../services/aiService";

const AuthPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Onboarding
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false);

  // Dynamic onboarding steps
  const getOnboardingSteps = () => {
    const steps = [
      {
        id: 1,
        question: "Are you a student?",
        field: "isStudent",
        type: "choice",
        options: ["Yes, I'm a student 🎓", "No, I'm a professional 💼"],
      },
    ];

    if (answers.isStudent === "Yes, I'm a student 🎓") {
      steps.push({
        id: 2,
        question: "What are you studying?",
        field: "studyField",
        type: "text",
        placeholder: "e.g. UPSC preparation, B.Tech CS...",
      });
    } else if (answers.isStudent === "No, I'm a professional 💼") {
      steps.push({
        id: 2,
        question: "What's your profession?",
        field: "profession",
        type: "text",
        placeholder: "e.g. Software Engineer, Designer...",
      });
    }

    steps.push({
      id: 3,
      question: "Do you have a long-term goal?",
      field: "hasGoal",
      type: "choice",
      options: ["Yes, I have a clear goal 🎯", "Not yet, just exploring 🌱"],
    });

    if (answers.hasGoal === "Yes, I have a clear goal 🎯") {
      steps.push({
        id: 4,
        question: "What is your long-term goal?",
        field: "goal",
        type: "text",
        placeholder: "e.g. Crack UPSC, Get into IIT...",
      });
      steps.push({
        id: 5,
        question: "How much time do you have?",
        field: "duration",
        type: "text",
        placeholder: "e.g. 6 months, 1 year, 2 years...",
      });
    }

    steps.push({
      id: 6,
      question: "What time do you sleep?",
      field: "sleepTime",
      type: "time",
      hint: "We'll enable Do Not Disturb mode",
    });
    steps.push({
      id: 7,
      question: "What time do you wake up?",
      field: "wakeTime",
      type: "time",
      hint: "Minimum 5 hours of sleep required",
    });

    return steps;
  };

  const onboardingSteps = getOnboardingSteps();
  const current = onboardingSteps[step];

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let userData;
      if (mode === "signup") {
        userData = await signupUser(form.name, form.email, form.password);
        // Save token and user
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
        // Go to onboarding
        setMode("onboarding");
      } else {
        userData = await loginUser(form.email, form.password);
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleChoice = (value) => {
    const newAnswers = { ...answers, [current.field]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (step < onboardingSteps.length - 1) setStep((s) => s + 1);
    }, 300);
  };

  const calculateSleepHours = () => {
    if (!answers.sleepTime || !answers.wakeTime) return null;
    const [sh, sm] = answers.sleepTime.split(":").map(Number);
    const [wh, wm] = answers.wakeTime.split(":").map(Number);
    let mins = wh * 60 + wm - (sh * 60 + sm);
    if (mins < 0) mins += 24 * 60;
    return (mins / 60).toFixed(1);
  };

  const handleOnboardingNext = async () => {
    if (step < onboardingSteps.length - 1) {
      setStep((s) => s + 1);
      return;
    }

    // FINAL STEP — Submit to backend
    setGeneratingRoadmap(true);

    try {
      const onboardingData = {
        isStudent: answers.isStudent === "Yes, I'm a student 🎓",
        studyField: answers.studyField || null,
        profession: answers.profession || null,
        hasGoal: answers.hasGoal === "Yes, I have a clear goal 🎯",
        goal: answers.goal || null,
        duration: answers.duration || null,
        sleepSchedule: {
          sleepTime: answers.sleepTime,
          wakeTime: answers.wakeTime,
          hours: calculateSleepHours(),
        },
      };

      console.log("📤 Sending onboarding:", onboardingData);

      const updatedUser = await completeOnboarding(onboardingData);
      
      console.log("✅ Onboarding complete:", updatedUser);

      // Update localStorage with full user data
      localStorage.setItem("user", JSON.stringify(updatedUser));

      navigate("/journal");
    } catch (err) {
      console.error("❌ Onboarding error:", err);
      setError(err.message);
    } finally {
      setGeneratingRoadmap(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dreamy flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-lavender-300 opacity-20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-peach-300 opacity-20 rounded-full blur-3xl" />

      <AnimatePresence mode="wait">
        
        {/* GENERATING ROADMAP */}
        {generatingRoadmap && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 bg-white rounded-3xl shadow-large p-12 text-center max-w-md"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-20 h-20 mx-auto mb-6"
            >
              <Sparkles className="w-full h-full text-lavender-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-700 font-display mb-3">
              AI is setting up your account...
            </h2>
            <p className="text-sm text-gray-500">
              {answers.hasGoal === "Yes, I have a clear goal 🎯"
                ? "Creating personalized roadmap with phases & milestones ✨"
                : "Preparing your workspace..."}
            </p>
          </motion.div>
        )}

        {/* AUTH */}
        {!generatingRoadmap && mode !== "onboarding" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="relative z-10 bg-white rounded-3xl shadow-large w-full max-w-md p-8"
          >
            <div className="flex flex-col items-center mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center text-3xl mb-3 shadow-soft"
              >
                🧠
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-700 font-display">
                Productivity Analyzer
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {mode === "login" ? "Welcome back 👋" : "Start your journey 🚀"}
              </p>
            </div>

            <div className="flex bg-cream rounded-2xl p-1 mb-6 gap-1">
              {["login", "signup"].map((m) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setError(""); }}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                    mode === m
                      ? "bg-white text-gray-700 shadow-soft"
                      : "text-gray-400"
                  }`}
                >
                  {m === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="label">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="input"
                  />
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="input"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-blush-500 bg-blush-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <motion.button
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {mode === "login" ? "Logging in..." : "Creating account..."}
                  </>
                ) : (
                  mode === "login" ? "Login →" : "Create Account 🚀"
                )}
              </motion.button>
            </form>
          </motion.div>
        )}

        {/* ONBOARDING */}
        {!generatingRoadmap && mode === "onboarding" && (
          <motion.div
            key="onboarding"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="relative z-10 w-full max-w-md"
          >
            <div className="text-center mb-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-4xl mb-3"
              >
                🌸
              </motion.div>
              <h2 className="text-lg font-bold text-gray-700 font-display">
                Let's personalize your experience
              </h2>
            </div>

            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Step {step + 1} of {onboardingSteps.length}</span>
                <span>{Math.round(((step + 1) / onboardingSteps.length) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-lavender-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-lavender-300 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / onboardingSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                className="card"
              >
                <h2 className="text-xl font-bold text-gray-700 font-display mb-2">
                  {current.question}
                </h2>
                {current.hint && (
                  <p className="text-xs text-gray-400 mb-5">{current.hint}</p>
                )}
                {!current.hint && <div className="mb-5" />}

                {current.type === "choice" && (
                  <div className="space-y-3">
                    {current.options.map((opt) => (
                      <motion.button
                        key={opt}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleChoice(opt)}
                        className={`w-full px-5 py-4 rounded-2xl border-2 text-left text-sm font-medium transition-all ${
                          answers[current.field] === opt
                            ? "border-lavender-300 bg-lavender-50 text-lavender-500"
                            : "border-lavender-100 text-gray-600 hover:border-lavender-200"
                        }`}
                      >
                        {opt}
                      </motion.button>
                    ))}
                  </div>
                )}

                {current.type === "text" && (
                  <div className="space-y-4">
                    <textarea
                      rows={3}
                      placeholder={current.placeholder}
                      value={answers[current.field] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [current.field]: e.target.value })
                      }
                      className="textarea"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleOnboardingNext}
                      disabled={!answers[current.field]?.trim()}
                      className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${
                        answers[current.field]?.trim()
                          ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {step === onboardingSteps.length - 1
                        ? "Complete Setup 🚀"
                        : "Next →"}
                    </motion.button>
                  </div>
                )}

                {current.type === "time" && (
                  <div className="space-y-4">
                    <input
                      type="time"
                      value={answers[current.field] || ""}
                      onChange={(e) =>
                        setAnswers({ ...answers, [current.field]: e.target.value })
                      }
                      className="input text-lg"
                    />

                    {current.field === "wakeTime" && answers.sleepTime && answers.wakeTime && (
                      <div className={`rounded-xl p-3 text-xs ${
                        parseFloat(calculateSleepHours()) < 5
                          ? "bg-blush-50 text-blush-500"
                          : "bg-mint-50 text-gray-600"
                      }`}>
                        💤 You'll sleep <strong>{calculateSleepHours()} hours</strong>
                        {parseFloat(calculateSleepHours()) < 5
                          ? " ⚠️ Less than 5 hours is unhealthy!"
                          : " ✨ Perfect sleep schedule!"}
                      </div>
                    )}

                    {error && (
                      <div className="flex items-center gap-2 text-xs text-blush-500 bg-blush-50 p-3 rounded-xl">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                      </div>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleOnboardingNext}
                      disabled={!answers[current.field]}
                      className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                        answers[current.field]
                          ? "bg-lavender-300 text-white hover:bg-lavender-400 shadow-soft"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {step === onboardingSteps.length - 1 ? (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Complete & Generate Roadmap
                        </>
                      ) : (
                        "Next →"
                      )}
                    </motion.button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default AuthPage;