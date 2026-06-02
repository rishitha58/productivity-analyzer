import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

const PlaceholderPage = ({ title, emoji, description }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      
      {/* Top Bar */}
      <header className="bg-white border-b border-lavender-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05, x: -3 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="btn-icon"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </motion.button>
          <h1 className="text-lg font-bold text-gray-700 font-display">
            {emoji} {title}
          </h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <motion.div
            animate={{ y: [0, -15, 0] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="text-8xl mb-6"
          >
            {emoji}
          </motion.div>

          <h2 className="text-3xl font-bold text-gray-700 font-display mb-3">
            {title}
          </h2>

          <p className="text-sm text-gray-500 mb-6">
            {description}
          </p>

          <div className="card bg-gradient-dreamy">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Construction className="w-5 h-5" />
              <p className="text-sm font-semibold">
                Coming soon — under construction! 🚧
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="btn-primary mt-6"
          >
            ← Back to Dashboard
          </motion.button>
        </motion.div>
      </main>
    </div>
  );
};

export default PlaceholderPage;