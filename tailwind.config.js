import { pl } from 'date-fns/locale';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        'dark-foreground': 'hsl(var(--color-dark-foreground))',
        contrast: 'hsl(var(--color-contrast))',
        placeholder: 'hsl(var(--color-placeholder))',
        border: 'hsl(var(--color-border))',
        'button-background': 'hsl(var(--color-button-background))',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
