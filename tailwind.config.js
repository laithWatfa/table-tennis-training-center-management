/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      backgroundImage: {
        'custom-gradient': 'linear-gradient(to top, #E53935, #731D1B, #000000)',
      },
      opacity: {
        50: '0.5',
      },
      textShadow: {
        sm: '1px 1px 2px rgba(0,0,0,0.25)',
        lg: '0px 8px 4px rgba(0,0,0,1)',
      },
       animation: {
  'pulse-gradient': 'pulseGradient 4s ease-in-out infinite',
},
keyframes: {
  pulseGradient: {
    '0%, 100%': { opacity: '0.4' },
    '50%': { opacity: '0.6' },
  },
},
      colors: {
        whiteT: 'var(--whiteT)',
        bg: 'var(--background)',
        surface: 'var(--surface)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        amber: 'var(--amber)',
        grayBG: 'var(--gray-bg)',
      },
      boxShadow: {
        basic: 'var(--shadow-basic)',
        signup: 'var(--shadow-signup-image)',
        innerBtn: 'var(--shadow-button-inner)',
        small: 'var(--shadow-small)',
        mid: 'var(--shadow-mid)',
        hero: 'var(--shadow-hero)',
        calendarCell: '0px 3px 6px 2px rgba(0,0,0,0.41)',
      },
      fontSize: {
        h1: 'var(--h1)',
        h2: 'var(--h2)',
        h3: 'var(--h3)',
        lead: 'var(--lead)',
        body: 'var(--body)',
        small: 'var(--small)',
        meta: 'var(--meta)',
        caption: 'var(--caption)',
      },
    },
  },
  plugins: [
  ],
}

