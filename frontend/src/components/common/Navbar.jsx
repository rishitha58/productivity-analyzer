import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Search,
  Sun,
  Moon,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Menu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log('Searching:', searchQuery);
      // TODO: implement search
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-40 bg-white/70 backdrop-blur-lg border-b border-lavender-100 px-4 md:px-8 py-3"
    >
      <div className="flex items-center justify-between">
        {/* Left - Logo & Menu */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-lavender-100 transition-colors"
          >
            <Menu size={22} className="text-lavender-500" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-lavender-300 to-babyBlue-300 flex items-center justify-center shadow-soft"
            >
              <Sparkles className="text-white" size={20} />
            </motion.div>
            <div className="hidden md:block">
              <h1 className="text-xl font-display font-bold text-gradient-primary">
                Productivity Analyzer
              </h1>
            </div>
          </Link>
        </div>

        {/* Center - Search bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-md mx-8"
        >
          <div className="relative w-full">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, notes, goals..."
              className="w-full pl-11 pr-4 py-2.5 bg-lavender-50 border-2 border-transparent rounded-xl focus:border-lavender-300 focus:outline-none focus:bg-white transition-all text-sm"
            />
          </div>
        </form>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <motion.button
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-yellow-100 hover:bg-yellow-200 transition-colors"
            title="Toggle theme"
          >
            {isDark ? (
              <Sun size={18} className="text-yellow-600" />
            ) : (
              <Moon size={18} className="text-lavender-500" />
            )}
          </motion.button>

          {/* Notification Bell */}
          <NotificationBell />

          {/* Profile dropdown */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-xl bg-gradient-to-r from-lavender-100 to-babyBlue-100 hover:from-lavender-200 hover:to-babyBlue-200 transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender-400 to-babyBlue-400 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">
                {user?.name || 'User'}
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${
                  showProfileMenu ? 'rotate-180' : ''
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-large border border-lavender-100 overflow-hidden z-50"
                >
                  {/* User info */}
                  <div className="px-4 py-3 bg-gradient-to-br from-lavender-50 to-babyBlue-50 border-b border-lavender-100">
                    <p className="text-sm font-semibold text-gray-800">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || 'user@example.com'}
                    </p>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        navigate('/profile');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 hover:bg-lavender-50 transition-colors"
                    >
                      <User size={16} className="text-lavender-400" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate('/settings');
                        setShowProfileMenu(false);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-gray-700 hover:bg-lavender-50 transition-colors"
                    >
                      <Settings size={16} className="text-babyBlue-400" />
                      Settings
                    </button>
                    <hr className="my-1 border-lavender-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 flex items-center gap-3 text-sm text-blush-500 hover:bg-blush-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;