import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        navy: '#081b2d',
        sidebar: {
          DEFAULT: '#081b2d',
          text: '#e2e8f0',
          muted: '#b7c5d5',
          label: '#9aacc0',
          active: '#18334a',
          hover: '#10293e'
        },
        slate: { ...colors.slate, DEFAULT: '#f3f6fb' },
        teal: { ...colors.teal, DEFAULT: '#32c7b8' },
        cyan: { ...colors.cyan, DEFAULT: '#38bdf8' },
        ink: '#0f172a'
      },
      boxShadow: {
        panel: '0 18px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
