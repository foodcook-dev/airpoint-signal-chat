/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(var(--color-primary))',
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        'dark-foreground': 'hsl(var(--color-dark-foreground))',
        contrast: 'hsl(var(--color-contrast))',
        placeholder: 'hsl(var(--color-placeholder))',
        border: 'hsl(var(--color-border))',
        muted: 'hsl(var(--color-muted))',
        'button-background': 'hsl(var(--color-button-background))',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
