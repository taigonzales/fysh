import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          deep: '#0a1628',
          dark: '#0f1f3d',
          card: '#142244',
        },
        neon: {
          teal: '#00f0ff',
          'teal-muted': '#00b8c4',
        },
        coral: '#ff6b6b',
        positive: '#00e676',
        negative: '#ff5252',
        text: {
          primary: '#e8f0fe',
          secondary: '#8899b8',
          muted: '#4a5a78',
        },
        border: '#1e3a5f',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        'neon-glow': '0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-glow-sm': '0 0 10px rgba(0, 240, 255, 0.2)',
      },
    },
  },
  plugins: [],
}
export default config
