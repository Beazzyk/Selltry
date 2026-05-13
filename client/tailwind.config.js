/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Selltry brand — navy scale
        primary: {
          50:  '#EFF3F9',
          100: '#D5E0EF',
          200: '#A8C0DF',
          300: '#7BA0CF',
          400: '#4E80BF',
          500: '#2563A6',
          600: '#163D6E',  // --navy
          700: '#0F2D55',
          800: '#092040',
          900: '#05132A',
        },
      },
    },
  },
  plugins: [],
};
