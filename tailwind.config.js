/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        water: {
          light: '#D6EAF8',
          DEFAULT: '#5B9BD5',
          mid: '#2E86C1',
          deep: '#1C74B3',
        },
        todo: {
          light: '#FFE0B2',
          DEFAULT: '#FF9800',
          deep: '#E65100',
        },
        exercise: {
          light: '#C8E6C9',
          DEFAULT: '#4CAF50',
          deep: '#2E7D32',
        },
        diary: {
          light: '#F8BBD0',
          DEFAULT: '#E91E63',
          deep: '#AD1457',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
      maxWidth: {
        'app': '28rem', // 448px
      },
    },
  },
  plugins: [],
}
