import type { Config } from 'tailwindcss';
export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-arabic)', 'var(--font-geist)', 'IBM Plex Sans Arabic', 'Noto Sans Arabic', 'Arial', 'sans-serif'] },
      boxShadow: { soft: '0 20px 60px rgba(15, 23, 42, 0.08)' }
    }
  },
  plugins: []
} satisfies Config;
