/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // ← now a simple string
  theme: {
    // Everything is merged automatically – no `extend` key
    colors: {
      bg: {
        base: 'var(--color-bg-base)',
        surface: 'var(--color-bg-surface)',
        elevated: 'var(--color-bg-elevated)',
        overlay: 'var(--color-bg-overlay)',
      },
      accent: {
        primary: 'var(--color-accent-primary)',
        secondary: 'var(--color-accent-secondary)',
        danger: 'var(--color-accent-danger)',
        warning: 'var(--color-accent-warning)',
        success: 'var(--color-accent-success)',
      },
      text: {
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        muted: 'var(--color-text-muted)',
      },
    },
    fontFamily: {
      sans: 'var(--font-family-sans)',
      mono: 'var(--font-family-mono)',
    },
  },
  plugins: [],
};
