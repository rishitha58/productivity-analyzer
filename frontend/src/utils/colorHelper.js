// 🎨 Color Helper Functions

// Get pastel color based on category
export const getCategoryColor = (category) => {
  const colors = {
    study: {
      bg: 'bg-lavender-100',
      border: 'border-lavender-300',
      text: 'text-lavender-500',
      gradient: 'from-lavender-200 to-lavender-300',
      solid: 'bg-lavender-300',
    },
    work: {
      bg: 'bg-babyBlue-100',
      border: 'border-babyBlue-300',
      text: 'text-babyBlue-500',
      gradient: 'from-babyBlue-200 to-babyBlue-300',
      solid: 'bg-babyBlue-300',
    },
    health: {
      bg: 'bg-mint-100',
      border: 'border-mint-300',
      text: 'text-mint-500',
      gradient: 'from-mint-200 to-mint-300',
      solid: 'bg-mint-300',
    },
    personal: {
      bg: 'bg-peach-100',
      border: 'border-peach-300',
      text: 'text-peach-500',
      gradient: 'from-peach-200 to-peach-300',
      solid: 'bg-peach-300',
    },
    leisure: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-500',
      gradient: 'from-yellow-200 to-yellow-300',
      solid: 'bg-yellow-300',
    },
    food: {
      bg: 'bg-peach-100',
      border: 'border-peach-300',
      text: 'text-peach-500',
      gradient: 'from-peach-200 to-peach-300',
      solid: 'bg-peach-300',
    },
    travel: {
      bg: 'bg-babyBlue-100',
      border: 'border-babyBlue-300',
      text: 'text-babyBlue-500',
      gradient: 'from-babyBlue-200 to-babyBlue-300',
      solid: 'bg-babyBlue-300',
    },
    sleep: {
      bg: 'bg-lavender-100',
      border: 'border-lavender-300',
      text: 'text-lavender-500',
      gradient: 'from-lavender-200 to-lavender-300',
      solid: 'bg-lavender-300',
    },
    default: {
      bg: 'bg-gray-100',
      border: 'border-gray-300',
      text: 'text-gray-500',
      gradient: 'from-gray-200 to-gray-300',
      solid: 'bg-gray-300',
    },
  };

  return colors[category?.toLowerCase()] || colors.default;
};

// Get priority color classes
export const getPriorityColor = (priority) => {
  const colors = {
    high: {
      bg: 'bg-blush-100',
      border: 'border-blush-300',
      text: 'text-blush-500',
      gradient: 'from-blush-200 to-blush-300',
      solid: 'bg-blush-300',
      glow: 'shadow-glow-peach',
    },
    medium: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-300',
      text: 'text-yellow-600',
      gradient: 'from-yellow-200 to-yellow-300',
      solid: 'bg-yellow-300',
      glow: 'shadow-glow',
    },
    low: {
      bg: 'bg-mint-100',
      border: 'border-mint-300',
      text: 'text-mint-500',
      gradient: 'from-mint-200 to-mint-300',
      solid: 'bg-mint-300',
      glow: 'shadow-glow-mint',
    },
  };

  return colors[priority?.toLowerCase()] || colors.low;
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    completed: {
      bg: 'bg-softGreen-100',
      text: 'text-softGreen-500',
      icon: '✅',
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      icon: '⏳',
    },
    overdue: {
      bg: 'bg-blush-100',
      text: 'text-blush-500',
      icon: '⚠️',
    },
    inProgress: {
      bg: 'bg-babyBlue-100',
      text: 'text-babyBlue-500',
      icon: '🔄',
    },
    cancelled: {
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      icon: '❌',
    },
  };

  return colors[status] || colors.pending;
};

// Get random pastel color (for variety)
export const getRandomPastelColor = () => {
  const colors = [
    'lavender',
    'peach',
    'mint',
    'babyBlue',
    'yellow',
    'blush',
    'softGreen',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get random pastel gradient
export const getRandomGradient = () => {
  const gradients = [
    'from-lavender-200 to-babyBlue-200',
    'from-peach-200 to-blush-200',
    'from-mint-200 to-softGreen-200',
    'from-yellow-200 to-peach-200',
    'from-babyBlue-200 to-mint-200',
    'from-lavender-200 to-peach-200',
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};

// Get color based on productivity score (0-100)
export const getProductivityColor = (score) => {
  if (score >= 80) {
    return {
      bg: 'bg-softGreen-100',
      text: 'text-softGreen-500',
      gradient: 'from-mint-300 to-softGreen-300',
      label: 'Excellent! 🌟',
    };
  } else if (score >= 60) {
    return {
      bg: 'bg-babyBlue-100',
      text: 'text-babyBlue-500',
      gradient: 'from-babyBlue-300 to-mint-300',
      label: 'Good 👍',
    };
  } else if (score >= 40) {
    return {
      bg: 'bg-yellow-100',
      text: 'text-yellow-600',
      gradient: 'from-yellow-300 to-peach-300',
      label: 'Average ⚡',
    };
  } else {
    return {
      bg: 'bg-blush-100',
      text: 'text-blush-500',
      gradient: 'from-peach-300 to-blush-300',
      label: 'Needs Improvement 💪',
    };
  }
};

// Get mood color based on emoji/mood
export const getMoodColor = (mood) => {
  const moods = {
    happy: 'bg-yellow-200',
    excited: 'bg-peach-200',
    calm: 'bg-mint-200',
    sad: 'bg-babyBlue-200',
    angry: 'bg-blush-200',
    tired: 'bg-lavender-200',
    focused: 'bg-babyBlue-200',
    productive: 'bg-mint-200',
  };
  return moods[mood?.toLowerCase()] || 'bg-gray-200';
};

// Convert hex to rgba (for opacity effects)
export const hexToRgba = (hex, alpha = 1) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Get gradient string for inline styles
export const getGradientStyle = (color1, color2, direction = '135deg') => {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
};

// Pastel color palette (for charts, etc.)
export const PASTEL_PALETTE = [
  '#C3B1E1', // Lavender
  '#FFD5B8', // Peach
  '#B5EAD7', // Mint
  '#B8D8F8', // Baby Blue
  '#FFF3B0', // Soft Yellow
  '#FFB3B3', // Blush
  '#C7F2C7', // Soft Green
  '#D5C2EB', // Light Lavender
  '#FFE8D6', // Light Peach
  '#D9F7E9', // Light Mint
];

// Get color from palette by index
export const getColorFromPalette = (index) => {
  return PASTEL_PALETTE[index % PASTEL_PALETTE.length];
};

// Get text color based on background brightness
export const getContrastColor = (bgColor) => {
  // Simple logic - pastel colors are light, use dark text
  return 'text-gray-800';
};