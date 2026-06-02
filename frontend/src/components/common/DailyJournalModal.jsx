import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, X } from "lucide-react";

const DailyJournalModal = ({ onComplete }) => {
  const [journal, setJournal] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState(null);

  // ─── Convert Journal to Tasks (Simulated AI) ───
  const convertToTasks = () => {
    if (!journal.trim()) return;
    setLoading(true);

    // TODO: Replace with real AI call (Grok/NLP)
    setTimeout(() => {
      const extractedTasks = parseJournalToTasks(journal);
      setTasks(extractedTasks);
      setLoading(false);
    }, 1500);
  };

  // Simple parser — split by commas, periods, "and", "then"
  const parseJournalToTasks = (text) => {
    const parts = text
      .split(/[.,;]|\sand\s|\sthen\s/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    return parts.map((task, i) => ({
      id: Date.now() + i,
      title: task.charAt(0).toUpperCase() + task.slice(1),
      done: false,
      priority: i % 3 === 0 ? "high" : i % 3 === 1 ? "medium" : "low",
      createdAt: new Date().toISOString(),
    }));
  };

  // ─── Save and Continue ───
  const handleSave = () => {
    const today = new Date().toDateString();
    
    // Save journal
    localStorage.setItem(`journal_${today}`, journal);
    
    // Save tasks
    localStorage.setItem(`tasks_${today}`, JSON.stringify(tasks));
    
    // Mark daily check-in complete
    localStorage.setItem("lastJournalDate", today);
    
    onComplete();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm 
                 flex 