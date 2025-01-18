import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      colors: {
        'primary-100': 'rgba(var(--primary-100))',
        'primary-200': 'rgba(var(--primary-200))',
        'primary-300': 'rgba(var(--primary-300))',
        'accent-100': 'rgba(var(--accent-100))',
        'accent-200': 'rgba(var(--accent-200))',
        'text-100': 'rgba(var(--text-100))',
        'text-200': 'rgba(var(--text-200))',
        'bg-100': 'rgba(var(--bg-100))',
        'bg-200': 'rgba(var(--bg-200))',
        'bg-300': 'rgba(var(--bg-300))',
      },
    },
    fontFamily: {
      logo: ["Abril Fatface"],
      sublogo: ["Carrois Gothic"]
    }
  },
  plugins: [],
}
export default config
