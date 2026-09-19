/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    extend: {
      colors: {
        fucsia: '#D81786',
        esmeralda: {
          DEFAULT: '#1B7F67',
          dark: '#14604D',
          light: '#E7F3EF',
        },
        celeste: '#58BCD7',
        ink: '#122420',
        paper: '#FCFCFA',
      },
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};
