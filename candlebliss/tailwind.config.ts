import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#AE7A51",
        secondary: "#FFFFFF",
      },
      fontFamily: {
        mont: ["Montserrat", "sans-serif"],
        paci: ["Pacifico", "serif"],
      },
    },
  },
  plugins: [require("tailwind-scrollbar-hide")],
} satisfies Config;
