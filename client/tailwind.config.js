/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        minecraft: {
          grass: '#5D8C3E',
          dirt: '#8B6C4A',
          stone: '#7F7F7F',
          diamond: '#4AEDD9',
          gold: '#FCEE4B',
          redstone: '#FF0000',
        },
      },
    },
  },
  plugins: [],
};
