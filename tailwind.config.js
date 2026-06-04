/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './screens/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}', './navigation/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#005bc4',
        'primary-container': '#3b82f6',
        'inverse-primary': '#93c5fd',
        surface: '#eff6ff',
        'surface-container': '#bfdbfe',
        'on-surface': '#001a3d',
        'surface-tint': '#005bc4',
        background: '#eff6ff',
        secondary: '#b45309',
        'secondary-container': '#f59e0b',
        tertiary: '#7c3aed',
        'tertiary-container': '#a78bfa',
        error: '#dc2626',
        'error-container': '#fca5a5',
        shadow: '#001a3d',
      },
      borderRadius: {
        sm: '0.5rem',
        DEFAULT: '1rem',
        md: '1.5rem',
        lg: '2rem',
        xl: '3rem',
        full: '9999px',
      },
      fontFamily: {
        sans: ['Poppins_500Medium'],
        medium: ['Poppins_500Medium'],
        semibold: ['Poppins_600SemiBold'],
        bold: ['Poppins_700Bold'],
      },
      spacing: {
        base: '8px',
        screen: '16px',
        gutter: '24px',
      },
    },
  },
  plugins: [],
};
