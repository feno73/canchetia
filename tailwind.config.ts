import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/preline/preline.js',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from technical definition
        'argentinian-blue': '#5aa9e6',
        cinereous: '#987d7c',
        black: '#020202',
        'fern-green': '#50723c',
        'light-green': '#a1e887',
        // Semantic colors
        primary: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bfe2fe',
          300: '#93d1fd',
          400: '#60b7fa',
          500: '#3b9df6',
          600: '#5aa9e6', // Argentinian blue
          700: '#1570ef',
          800: '#175cd3',
          900: '#194ba8',
          950: '#102a56',
        },
        secondary: {
          50: '#f7f6f6',
          100: '#ebe9e9',
          200: '#d9d5d5',
          300: '#c0b9b8',
          400: '#987d7c', // Cinereous
          500: '#8b6f6d',
          600: '#7c625f',
          700: '#685150',
          800: '#574645',
          900: '#4a3e3d',
          950: '#261f1f',
        },
        success: {
          50: '#f0fdf2',
          100: '#dcfce4',
          200: '#bbf7cb',
          300: '#86efac',
          400: '#a1e887', // Light green
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#020202', // Black from brand
        },
        accent: {
          50: '#f5f7f4',
          100: '#e8ebe5',
          200: '#d3d9ce',
          300: '#b5c0ac',
          400: '#94a287',
          500: '#78856b',
          600: '#50723c', // Fern green
          700: '#455a34',
          800: '#39482c',
          900: '#323e28',
          950: '#1a2016',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'brand-gradient': 'linear-gradient(135deg, #5aa9e6, #987d7c, #020202, #50723c, #a1e887)',
      },
    },
  },
  plugins: [],
};

export default config;
