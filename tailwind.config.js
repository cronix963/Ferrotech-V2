/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1A365D', light: '#2B6CB0', 100: '#EBF8FF' },
        accent: { DEFAULT: '#DD6B20', light: '#ED8936' },
        gray: { 50: '#F7FAFC', 100: '#EDF2F7', 200: '#E2E8F0', 300: '#CBD5E0', 400: '#A0AEC0', 500: '#718096', 600: '#4A5568', 700: '#2D3748', 800: '#1A202C' },
        success: '#38A169',
        danger: '#E53E3E',
        warning: '#D69E2E',
        info: '#3182CE',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
