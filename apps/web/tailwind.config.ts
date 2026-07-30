import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['Arial', 'sans-serif'] },
      boxShadow: { soft: '0 20px 60px rgba(15, 23, 42, 0.08)' }
    }
  },
  plugins: []
} satisfies Config;
