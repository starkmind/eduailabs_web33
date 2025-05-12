import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#1E3A8A',
          mint: '#10B981',
        },
        neutral: {
          light: '#F3F4F6',
          text: '#374151',
        },
      },
      fontFamily: {
        sans: ['Noto Sans KR', 'Pretendard', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config 