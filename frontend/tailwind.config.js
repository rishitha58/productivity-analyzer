/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lavender: {
          50: '#F5F0FB',
          100: '#E8DCF5',
          200: '#D5C2EB',
          300: '#C3B1E1',
          400: '#A98FD1',
          500: '#8F6DC1',
        },
        peach: {
          50: '#FFF5EE',
          100: '#FFE8D6',
          200: '#FFDCC0',
          300: '#FFD5B8',
          400: '#FFB890',
          500: '#FF9B68',
        },
        mint: {
          50: '#EFFCF6',
          100: '#D9F7E9',
          200: '#C2F0DD',
          300: '#B5EAD7',
          400: '#8FDCC0',
          500: '#69CEA9',
        },
        babyBlue: {
          50: '#EFF6FE',
          100: '#D9EAFC',
          200: '#C8E0FA',
          300: '#B8D8F8',
          400: '#8FBEEF',
          500: '#66A4E6',
        },
        softGreen: {
          50: '#F1FBF1',
          100: '#DDF6DD',
          200: '#D2F4D2',
          300: '#C7F2C7',
          400: '#A0E5A0',
          500: '#79D879',
        },
        blush: {
          50: '#FFF1F1',
          100: '#FFD9D9',
          200: '#FFC6C6',
          300: '#FFB3B3',
          400: '#FF8C8C',
          500: '#FF6565',
        },
        cream: '#FAFAFA',
        darkBg: '#1a1625',
        darkCard: '#252136',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        display: ['Quicksand', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-dreamy': 'linear-gradient(135deg, #E8DCF5 0%, #FFE8D6 50%, #D9F7E9 100%)',
        'gradient-sunset': 'linear-gradient(135deg, #FFD5B8 0%, #FFB3B3 50%, #C3B1E1 100%)',
        'gradient-ocean': 'linear-gradient(135deg, #B8D8F8 0%, #B5EAD7 50%, #C7F2C7 100%)',
        'gradient-primary': 'linear-gradient(135deg, #C3B1E1 0%, #B8D8F8 100%)',
        'gradient-study': 'linear-gradient(135deg, #F5F0FB 0%, #EFF6FE 50%, #EFFCF6 100%)',
      },
      boxShadow: {
        'soft': '0 4px 14px 0 rgba(195, 177, 225, 0.25)',
        'medium': '0 8px 20px 0 rgba(195, 177, 225, 0.3)',
        'large': '0 20px 40px 0 rgba(195, 177, 225, 0.35)',
        'glow': '0 0 30px rgba(195, 177, 225, 0.5)',
        'glow-mint': '0 0 30px rgba(181, 234, 215, 0.6)',
        'glow-peach': '0 0 30px rgba(255, 213, 184, 0.6)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}