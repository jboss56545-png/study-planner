export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { sage:'#A8B9A0', cream:'#F8F6EF', lavender:'#EAE3F2', pastel:'#F8E9A9', mint:'#D5EDE3', ink:'#252722' },
      fontFamily: { sans: ['Inter','system-ui','sans-serif'] },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'pop-in': 'pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
        float: 'float 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};
