/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:  '#1D9E75',
        'primary-dark': '#0F6E56',
        surface:  '#FFFFFF',
        muted:    '#888780',
        hint:     '#B4B2A9',
        border:   '#E8E6DF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
