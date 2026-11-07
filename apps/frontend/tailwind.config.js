/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        navy: '#081b2d',
        slate: '#f3f6fb',
        teal: '#32c7b8',
        cyan: '#38bdf8',
        ink: '#0f172a'
      },
      boxShadow: {
        panel: '0 18px 40px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};
