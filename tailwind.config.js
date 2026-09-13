/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Onest', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['Onest', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      fontWeight: {
        normal: '400',
        book: '450',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      colors: {
        canvas: '#f5f3f1',
        'surface-warm': '#f8f5f1',
        'surface-pill': '#f4eeeb',
        'surface-muted': '#edeae7',
        ink: {
          DEFAULT: '#0f0e0d',
          dark: '#000000',
          secondary: '#766f6a',
          tertiary: '#9e9791',
          muted: '#bfb8b2',
        },
        hairline: {
          subtle: 'rgba(15, 14, 13, 0.05)',
          DEFAULT: 'rgba(15, 14, 13, 0.08)',
          strong: 'rgba(15, 14, 13, 0.15)',
          solid: '#e5e3df',
        },
      },
      boxShadow: {
        'fish-subtle': '0px 0px 0px 1px rgba(15,14,13,0.06), 0px 1px 3px 0px rgba(15,14,13,0.04)',
        'fish-nav': '0px 2px 12px rgba(0,0,0,0.03)',
        'fish-card': '0px 0px 0px 1px rgba(15,14,13,0.04), 0px 1px 4px 0px rgba(15,14,13,0.02)',
        'fish-modal': '0px 20px 48px -12px rgba(15,14,13,0.08), 0px 0px 0px 1px rgba(15,14,13,0.04)',
      },
      animation: {
        'fade-in': 'fadeIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.99)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
