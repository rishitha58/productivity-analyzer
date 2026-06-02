import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Search,
  Trash2,
  Edit3,
  ChevronDown,
  ChevronUp,
  Clock,
} from 'lucide-react';
import { useJournal } from '../../hooks/useJournal';
import { formatFullDate, getRelativeTime, getSmartDateLabel } from '../../utils/dateHelper';
import { ConfirmModal } from '../common/Modal';
import { SkeletonCard } from '../common/Loader';

const JournalHistory = () => {
  const { journals, loading, fetchJournals, deleteJournal } = useJournal();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  // Filter journals
  const filteredJournals = journals.filter((j) =>
    j.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group by month
  const groupedJournals = filteredJournals.reduce((acc, journal) => {
    const date = new Date(journal.createdAt || journal.date);
    const month = date.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
    if (!acc[month]) acc[month] = [];
    acc[month].push(journal);
    return acc;
  }, {});

  const handleDelete = async () => {
    if (deleteConfirm) {
      await deleteJournal(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  if (loading && journals.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-gradient-primary">
            📚 Journal History
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            {journals.length} {journals.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search journals..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border-2 border-lavender-100 rounded-xl focus:border-lavender-300 focus:outline-none text-sm"
          />
        </div>
      </motion.div>

      {/* Empty State */}
      {filteredJournals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-lavender-100 to-peach-100 flex items-center justify-center">
            <BookOpen size={36} className="text-lavender-400" />
          </div>
          <h3 className="text-lg font-display font-bold text-gray-700">
            {searchQuery ? 'No matching journals' : 'No journals yet'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {searchQuery
              ? 'Try a different search term'
              : 'Start writing your first journal entry!'}
          </p>
        </motion.div>
      )}

      {/* Journal Entries Grouped by Month */}
      {Object.entries(groupedJournals).map(([month, entries], groupIdx) => (
        <motion.div
          key={month}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIdx * 0.1 }}
          className="space-y-3"
        >
          {/* Month Header */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-gradient-to-r from-lavender-200 to-transparent flex-1" />
            <h3 className="px-3 py-1 bg-lavender-100 text-lavender-500 text-xs font-semibold rounded-full uppercase tracking-wider">
              {month}
            </h3>
            <div className="h-px bg-gradient-to-l from-lavender-200 to-transparent flex-1" />
          </div>

          {/* Entries */}
          <div className="space-y-3">
            {entries.map((journal, idx) => {
              const isExpanded = expandedId === journal.id;
              const preview = journal.content?.slice(0, 150) || '';
              const needsExpand = (journal.content?.length || 0) > 150;

              return (
                <motion.div
                  key={journal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-soft hover:shadow-medium transition-all border border-lavender-100 overflow-hidden group"
                >
                  {/* Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-peach-200 to-blush-200 flex items-center justify-center">
                          <BookOpen size={18} className="text-peach-500" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">
                            {getSmartDateLabel(journal.createdAt || journal.date)}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Clock size={11} />
                            {getRelativeTime(journal.createdAt || journal.date)}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          className="p-1.5 rounded-lg hover:bg-babyBlue-100 transition-colors"
                          title="Edit"
                        >
                          <Edit3 size={14} className="text-babyBlue-500" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(journal.id)}
                          className="p-1.5 rounded-lg hover:bg-blush-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-blush-500" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                      {isExpanded ? journal.content : preview}
                      {!isExpanded && needsExpand && '...'}
                    </div>

                    {/* Expand button */}
                    {needsExpand && (
                      <button
                        onClick={() =>
                          setExpandedId(isExpanded ? null : journal.id)
                        }
                        className="mt-3 text-xs text-lavender-500 font-semibold flex items-center gap-1 hover:text-lavender-600 transition-colors"
                      >
                        {isExpanded ? (
                          <>
                            Show less <ChevronUp size={14} />
                          </>
                        ) : (
                          <>
                            Read more <ChevronDown size={14} />
                          </>
                        )}
                      </button>
                    )}

                    {/* Tasks count */}
                    {journal.tasksCount > 0 && (
                      <div className="mt-3 pt-3 border-t border-lavender-50 flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-mint-100 text-mint-500 rounded-full font-medium">
                          ✓ {journal.tasksCount} tasks extracted
                        </span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Journal?"
        message="This action cannot be undone. The journal entry will be permanently removed."
        type="danger"
        confirmText="Yes, Delete"
      />
    </div>
  );
};

export default JournalHistory;