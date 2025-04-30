import type { Config } from 'tailwindcss';

export default {
   content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
   ],
   theme: {
      extend: {
         colors: {
            primary: '#AE7A51',
            secondary: '#FFFFFF',
         },
         fontFamily: {
            mont: ['Montserrat', 'sans-serif'],
            paci: ['Pacifico', 'serif'],
         },
         animation: {
            fadeIn: 'fadeIn 0.3s ease-in-out',
            slideUp: 'slideUp 0.3s ease-out',
         },
         keyframes: {
            fadeIn: {
               '0%': { opacity: '0' },
               '100%': { opacity: '1' },
            },
            slideUp: {
               '0%': { transform: 'translateY(20px)', opacity: '0' },
               '100%': { transform: 'translateY(0)', opacity: '1' },
            },
         },
      },
   },
   plugins: [require('tailwind-scrollbar-hide')],
} satisfies Config;
