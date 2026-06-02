import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [accentColor, setAccentColor] = useState('lavender'); // lavender, peach, mint, babyBlue

  // Load theme from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    const storedAccent = localStorage.getItem('accentColor') || 'lavender';
    setTheme(storedTheme);
    setAccentColor(storedAccent);
    applyTheme(storedTheme);
  }, []);

  // Apply theme to document
  const applyTheme = (newTheme) => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  // Set specific theme
  const setLightTheme = () => {
    setTheme('light');
    localStorage.setItem('theme', 'light');
    applyTheme('light');
  };

  const setDarkTheme = () => {
    setTheme('dark');
    localStorage.setItem('theme', 'dark');
    applyTheme('dark');
  };

  // Change accent color
  const changeAccentColor = (color) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
  };

  // Get accent gradient classes based on selection
  const getAccentGradient = () => {
    const gradients = {
      lavender: 'from-lavender-300 to-babyBlue-300',
      peach: 'from-peach-300 to-blush-300',
      mint: 'from-mint-300 to-softGreen-300',
      babyBlue: 'from-babyBlue-300 to-lavender-300',
    };
    return gradients[accentColor] || gradients.lavender;
  };

  // Get accent solid color
  const getAccentColor = () => {
    const colors = {
      lavender: 'lavender-300',
      peach: 'peach-300',
      mint: 'mint-300',
      babyBlue: 'babyBlue-300',
    };
    return colors[accentColor] || colors.lavender;
  };

  const value = {
    theme,
    accentColor,
    isDark: theme === 'dark',
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    changeAccentColor,
    getAccentGradient,
    getAccentColor,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;