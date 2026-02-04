import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Streetwear Dark Palette
        black: '#000000',
        'dark-bg': '#0A0A0A',
        'dark-card': '#141414',
        'dark-border': '#1F1F1F',
        'gray-dark': '#1A1A1A',
        'gray-medium': '#666666',
        'gray-light': '#999999',
        'gray-lighter': '#CCCCCC',
        white: '#FFFFFF',
        'off-white': '#F5F5F5',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
      },
      fontSize: {
        'hero': '72px',
        'hero-mobile': '48px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        '8xl': '1400px',
        '9xl': '1600px',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      letterSpacing: {
        'widest-xl': '0.3em',
      },
    },
  },
  plugins: [],
}
export default config
