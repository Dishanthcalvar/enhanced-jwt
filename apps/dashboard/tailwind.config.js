/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        attack: {
          none: '#ef4444',
          downgrade: '#f97316',
          kid: '#eab308',
          confusion: '#a855f7',
          replay: '#3b82f6',
          theft: '#ec4899',
          malformed: '#6b7280',
        },
      },
    },
  },
  plugins: [],
};
