/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          50: '#f2fbf4',
          600: '#2d6a4f',
          700: '#1b4332',
          800: '#133526',
          900: '#081c15',
        },
        sage: {
          100: '#eef8f2',
          200: '#d8f3dc',
          300: '#b7e4c7',
          400: '#95d5b2',
          500: '#74c69d',
          600: '#52b788',
        },
        mint: {
          50: '#f4fbf7',
          100: '#e8f7ee',
          200: '#d1f0dd',
          300: '#b2e5c8',
        },
        charcoal: {
          500: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
