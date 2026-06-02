import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center 
                    justify-center px-6 text-center">

      <motion.div
        animate={{ y: [0, -15, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="text-8xl mb-6"
      >
        🌸
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-5xl font-bold text-gray-700 mb-2"
      >
        404
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-gray-400 mb-8"
      >
        Oops! This page doesn't exist yet.
      </motion.p>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate("/dashboard")}
        className="px-8 py-3 bg-primary text-white rounded-2xl 
                   font-semibold text-sm shadow-soft"
      >
        Go to Dashboard 🏠
      </motion.button>
    </div>
  );
};

export default NotFoundPage;