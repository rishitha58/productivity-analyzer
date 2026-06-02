import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lightbulb,
  Upload,
  FileText,
  Sparkles,
  X,
  Download,
  Copy,
  Check,
  Loader2,
  Search,
  BookOpen,
  AlertCircle,
} from 'lucide-react';
import { useAI } from '../../hooks/useAI';

const ImportantPoints = () => {
  const { getImportantPoints, analyzePDF, loading } = useAI();
  const [topic, setTopic] = useState('');
  const [points, setPoints] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [missingPoints, setMissingPoints] = useState([]);
  const [activeTab, setActiveTab] = useState('topic'); // 'topic' | 'pdf'
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleGeneratePoints = async () => {
    if (!topic.trim()) return;
    const result = await getImportantPoints(topic);
    if (result.success) {
      // Mock data fallback
      const mockPoints = result.data?.points || [
        'Understanding the fundamental concepts is crucial for mastery',
        'Practice regularly with examples to reinforce learning',
        'Break complex topics into smaller, manageable parts',
        'Connect new knowledge with prior understanding',
        'Use visual aids and diagrams to enhance memory',
        'Test yourself frequently to identify gaps',
        'Teach concepts to others to solidify understanding',
      ];
      setPoints(mockPoints);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
    }
  };

  const handleAnalyzePDF = async () => {
    if (!pdfFile) return;
    const result = await analyzePDF(pdfFile, topic);
    if (result.success) {
      const mockMissing = result.data?.missingPoints || [
        'Real-world applications and case studies',
        'Common pitfalls and how to avoid them',
        'Advanced techniques for optimization',
        'Historical context and evolution',
        'Future trends and emerging research',
      ];
      setMissingPoints(mockMissing);
    }
  };

  const handleCopyAll = () => {
    const text = (activeTab === 'topic' ? points : missingPoints)
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = `Important Points: ${topic}\n\n${(activeTab === 'topic' ? points : missingPoints)
      .map((p, i) => `${i + 1}. ${p}`)
      .join('\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic || 'important-points'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayPoints = activeTab === 'topic' ? points : missingPoints;

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-300 to-peach-300 flex items-center justify-center shadow-soft">
            <Lightbulb className="text-white" size={22} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-display font-bold text-gray-800">
              Important Points Generator
            </h2>
            <p className="text-sm text-gray-500">
              AI extracts key points or finds missing ones in your PDF
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-lavender-50 p-1 rounded-2xl mb-4">
          <button
            onClick={() => setActiveTab('topic')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'topic'
                ? 'bg-gradient-to-r from-yellow-300 to-peach-300 text-white shadow-soft'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Sparkles size={14} />
            Generate from Topic
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'pdf'
                ? 'bg-gradient-to-r from-babyBlue-300 to-lavender-300 text-white shadow-soft'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FileText size={14} />
            Find Missing in PDF
          </button>
        </div>

        {/* Topic Input */}
        <div className="space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder={
                activeTab === 'topic'
                  ? 'e.g., Machine Learning fundamentals'
                  : 'Topic of your PDF (optional)'
              }
              className="input-field pl-11"
              onKeyDown={(e) =>
                e.key === 'Enter' &&
                activeTab === 'topic' &&
                handleGeneratePoints()
              }
            />
          </div>

          {/* PDF Upload (only for PDF tab) */}
          <AnimatePresence>
            {activeTab === 'pdf' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {!pdfFile ? (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full p-6 border-2 border-dashed border-lavender-300 rounded-2xl hover:border-lavender-400 hover:bg-lavender-50 transition-all flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-babyBlue-200 to-lavender-200 flex items-center justify-center">
                      <Upload size={20} className="text-babyBlue-500" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      Click to upload PDF
                    </p>
                    <p className="text-xs text-gray-500">
                      Max 10MB • AI will find missing important points
                    </p>
                  </motion.button>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-3 p-4 bg-gradient-to-r from-babyBlue-50 to-lavender-50 rounded-2xl border border-babyBlue-200"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-babyBlue-300 to-lavender-300 flex items-center justify-center flex-shrink-0">
                      <FileText size={18} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(pdfFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <button
                      onClick={() => setPdfFile(null)}
                      className="p-1.5 rounded-lg hover:bg-blush-100 text-blush-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={
              loading ||
              (activeTab === 'topic' && !topic.trim()) ||
              (activeTab === 'pdf' && !pdfFile)
            }
            onClick={
              activeTab === 'topic' ? handleGeneratePoints : handleAnalyzePDF
            }
            className={`w-full py-3 rounded-2xl font-semibold text-white shadow-soft hover:shadow-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              activeTab === 'topic'
                ? 'bg-gradient-to-r from-yellow-400 to-peach-400'
                : 'bg-gradient-to-r from-babyBlue-400 to-lavender-400'
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                {activeTab === 'topic' ? 'Generate Important Points' : 'Find Missing Points'}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {displayPoints.length > 0 && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-3xl p-5 md:p-6 shadow-soft border border-lavender-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    activeTab === 'topic'
                      ? 'bg-gradient-to-br from-yellow-300 to-peach-300'
                      : 'bg-gradient-to-br from-babyBlue-300 to-lavender-300'
                  }`}
                >
                  {activeTab === 'topic' ? (
                    <BookOpen className="text-white" size={18} />
                  ) : (
                    <AlertCircle className="text-white" size={18} />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-gray-800">
                    {activeTab === 'topic'
                      ? `📚 ${topic}`
                      : '🔍 Missing Important Points'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {displayPoints.length} key points found
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCopyAll}
                  className="p-2 rounded-lg bg-lavender-100 hover:bg-lavender-200 text-lavender-500 transition-colors"
                  title="Copy all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownload}
                  className="p-2 rounded-lg bg-mint-100 hover:bg-mint-200 text-mint-500 transition-colors"
                  title="Download"
                >
                  <Download size={16} />
                </motion.button>
              </div>
            </div>

            {/* Points List */}
            <div className="space-y-2">
              {displayPoints.map((point, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`flex items-start gap-3 p-4 rounded-2xl transition-all hover:shadow-soft ${
                    activeTab === 'topic'
                      ? 'bg-gradient-to-r from-yellow-50 to-peach-50 border border-yellow-100 hover:border-yellow-300'
                      : 'bg-gradient-to-r from-babyBlue-50 to-lavender-50 border border-babyBlue-100 hover:border-babyBlue-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
                      activeTab === 'topic'
                        ? 'bg-gradient-to-br from-yellow-400 to-peach-400'
                        : 'bg-gradient-to-br from-babyBlue-400 to-lavender-400'
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed flex-1">
                    {point}
                  </p>
                </motion.div>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-5 flex items-center justify-center gap-1">
              <Sparkles size={12} className="text-lavender-400" />
              You can save these points to your Notes section
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ImportantPoints;