import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Target,
  Brain,
  TrendingUp,
  MessageCircle,
  StickyNote,
  Lightbulb,
  XCircle,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      path: '/',
      color: 'from-lavender-300 to-babyBlue-300',
      bgColor: 'bg-lavender-100',
      textColor: 'text-lavender-500',
    },
    {
      label: 'Journal',
      icon: BookOpen,
      path: '/journal',
      color: 'from-peach-300 to-blush-300',
      bgColor: 'bg-peach-100',
      textColor: 'text-peach-500',
    },
    {
      label: 'Tasks',
      icon: CheckSquare,
      path: '/tasks',
      color: 'from-mint-300 to-softGreen-300',
      bgColor: 'bg-mint-100',
      textColor: 'text-mint-500',
    },
    {
      label: 'Goals',
      icon: Target,
      path: '/goals',
      color: 'from-babyBlue-300 to-lavender-300',
      bgColor: 'bg-babyBlue-100',
      textColor: 'text-babyBlue-500',
    },
    {
      label: 'Study Mode',
      icon: Brain,
      path: '/study',
      color: 'from-lavender-300 to-mint-300',
      bgColor: 'bg-lavender-100',
      textColor: 'text-lavender-500',
    },
    {
      label: 'Insights',
      icon: TrendingUp,
      path: '/insights',
      color: 'from-yellow-300 to-peach-300',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      label: 'AI Assistant',
      icon: MessageCircle,
      path: '/ai',
      color: 'from-babyBlue-300 to-mint-300',
      bgColor: 'bg-babyBlue-100',
      textColor: 'text-babyBlue-500',
    },
  ];

  const studyTools = [
    {
      label: 'Important Points',
      icon: Lightbulb,
      path: '/important-points',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      label: 'Notes',
      icon: StickyNote,
      path: '/notes',
      textColor: 'text-mint-500',
      bgColor: 'bg-mint-50',
    },
    {
      label: 'Mistakes Review',
      icon: XCircle,
      path: '/mistakes',
      textColor: 'text-blush-500',
      bgColor: 'bg-blush-50',
    },
    {
      label: 'Mock Tests',
      icon: FileText,
      path: '/mocktest',
      textColor: 'text-peach-500',
      bgColor: 'bg-peach-50',
    },
  ];

  const SidebarContent = () => (
    <>
      {/* Logo (visible only in mobile drawer) */}
      <div className="lg:hidden flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-300 to-babyBlue-300 flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <h2 className="font-display font-bold text-gradient-primary">
            Productivity
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-lavender-100 transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Main Menu */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Main Menu
        </p>
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} text-white shadow-soft`
                      : 'text-gray-600 hover:bg-lavender-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                        isActive
                          ? 'bg-white/20'
                          : `${item.bgColor} group-hover:scale-110`
                      }`}
                    >
                      <item.icon
                        size={18}
                        className={isActive ? 'text-white' : item.textColor}
                      />
                    </div>
                    <span className="font-medium text-sm">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white"
                      />
                    )}
                  </>
                )}
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Study Tools */}
      <div className="mb-6">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
          Study Tools
        </p>
        <div className="space-y-1">
          {studyTools.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (menuItems.length + index) * 0.05 }}
            >
              <NavLink
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
                    isActive
                      ? `${item.bgColor} ${item.textColor} font-semibold`
                      : 'text-gray-600 hover:bg-lavender-50'
                  }`
                }
              >
                <item.icon size={16} className={item.textColor} />
                <span className="text-sm">{item.label}</span>
              </NavLink>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom card - Pro tip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-lavender-100 via-peach-100 to-mint-100 border border-white/40"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-lavender-500" />
          <p className="text-xs font-semibold text-gray-700">Pro Tip</p>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">
          Start your day by writing in your journal to get personalized tasks! ✨
        </p>
      </motion.div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white/60 backdrop-blur-md border-r border-lavender-100 h-[calc(100vh-65px)] sticky top-[65px] p-4 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-50"
            />

            {/* Drawer */}
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-72 bg-white z-50 p-4 overflow-y-auto flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;