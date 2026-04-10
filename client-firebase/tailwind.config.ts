import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        firebase: {
          orange: '#FFA000',
          yellow: '#FFCA28',
          grey: '#ECEFF1',
          blue: '#039BE5'
        }
      }
    },
  },
  plugins: [],
}

export default config