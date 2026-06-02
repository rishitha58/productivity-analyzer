// 🎨 Pastel Color Theme for Productivity Analyzer

export const colors = {
  // Primary Colors
  lavender: {
    50: '#F5F0FB',
    100: '#E8DCF5',
    200: '#D5C2EB',
    300: '#C3B1E1',  // Main Lavender
    400: '#A98FD1',
    500: '#8F6DC1',
  },

  // Secondary Colors
  peach: {
    50: '#FFF5EE',
    100: '#FFE8D6',
    200: '#FFDCC0',
    300: '#FFD5B8',  // Main Peach
    400: '#FFB890',
    500: '#FF9B68',
  },

  // Accent Colors
  mint: {
    50: '#EFFCF6',
    100: '#D9F7E9',
    200: '#C2F0DD',
    300: '#B5EAD7',  // Main Mint
    400: '#8FDCC0',
    500: '#69CEA9',
  },

  // Warning
  yellow: {
    50: '#FFFCEB',
    100: '#FFF8D1',
    200: '#FFF5B8',
    300: '#FFF3B0',  // Main Yellow
    400: '#FFE780',
    500: '#FFD94D',
  },

  // Info
  babyBlue: {
    50: '#EFF6FE',
    100: '#D9EAFC',
    200: '#C8E0FA',
    300: '#B8D8F8',  // Main Baby Blue
    400: '#8FBEEF',
    500: '#66A4E6',
  },

  // Success
  softGreen: {
    50: '#F1FBF1',
    100: '#DDF6DD',
    200: '#D2F4D2',
    300: '#C7F2C7',  // Main Soft Green
    400: '#A0E5A0',
    500: '#79D879',
  },

  // Error
  blush: {
    50: '#FFF1F1',
    100: '#FFD9D9',
    200: '#FFC6C6',
    300: '#FFB3B3',  // Main Blush
    400: '#FF8C8C',
    500: '#FF6565',
  },

  // Neutrals
  cream: '#FAFAFA',
  white: '#FFFFFF',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Dark mode background
  darkBg: '#1a1625',
  darkCard: '#252136',
};

// Gradient Combinations
export const gradients = {
  primary: 'bg-gradient-to-br from-lavender-300 to-babyBlue-300',
  secondary: 'bg-gradient-to-br from-peach-300 to-blush-300',
  success: 'bg-gradient-to-br from-mint-300 to-softGreen-300',
  warm: 'bg-gradient-to-br from-yellow-300 to-peach-300',
  cool: 'bg-gradient-to-br from-babyBlue-300 to-mint-300',
  dreamy: 'bg-gradient-to-br from-lavender-200 via-peach-200 to-mint-200',
  sunset: 'bg-gradient-to-br from-peach-300 via-blush-300 to-lavender-300',
  ocean: 'bg-gradient-to-br from-babyBlue-300 via-mint-300 to-softGreen-300',
  studyMode: 'bg-gradient-to-br from-lavender-100 via-babyBlue-100 to-mint-100',
};

// Shadow styles
export const shadows = {
  soft: 'shadow-md shadow-lavender-200/40',
  medium: 'shadow-lg shadow-lavender-300/30',
  large: 'shadow-xl shadow-lavender-300/40',
  glow: 'shadow-2xl shadow-lavender-400/50',
};

// Priority colors
export const priorityColors = {
  high: {
    bg: 'bg-blush-200',
    text: 'text-blush-500',
    border: 'border-blush-300',
  },
  medium: {
    bg: 'bg-yellow-200',
    text: 'text-yellow-500',
    border: 'border-yellow-300',
  },
  low: {
    bg: 'bg-mint-200',
    text: 'text-mint-500',
    border: 'border-mint-300',
  },
};

export default colors;