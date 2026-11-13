export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#080C16',
        panel: '#0F1728',
        glass: 'rgba(255, 255, 255, 0.055)',
        glassHover: 'rgba(255, 255, 255, 0.09)',
        borderGlass: 'rgba(255, 255, 255, 0.12)',
        primary: '#4DA3FF',
        secondary: '#42D9E8',
        lavender: '#A78BFA',
        success: '#34D399',
        warning: '#FBBF24',
        danger: '#FB7185',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glow-primary': '0 0 20px rgba(77, 163, 255, 0.15)',
        'glow-secondary': '0 0 20px rgba(66, 217, 232, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease-out forwards',
        'pop-in': 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        popIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
