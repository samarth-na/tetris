/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'press-start': ['"Press Start 2P"', 'Courier New', 'monospace'],
      },
      colors: {
        onedark: {
          bg: '#1e1e1e',
          surface: '#282c34',
          border: '#3e4451',
          text: '#abb2bf',
          blue: '#61afef',
          cyan: '#56b6c2',
          green: '#98c379',
          yellow: '#e5c07b',
          orange: '#d19a66',
          red: '#e06c75',
          purple: '#c678dd',
        },
      },
      boxShadow: {
        'neon': '0 0 10px #61afef, 0 0 20px #61afef, 0 0 30px #61afef',
      },
    },
  },
  plugins: [],
}
