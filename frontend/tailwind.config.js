/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      boxShadow: {
        dialog:
          '0 0 0 1px rgb(0 0 0 / 0.04), 0 8px 24px -4px rgb(0 0 0 / 0.16)',
        menu: '0 0 0 1px rgb(0 0 0 / 0.06), 0 4px 12px -2px rgb(0 0 0 / 0.12)',
      },
    },
  },
  plugins: [],
};
