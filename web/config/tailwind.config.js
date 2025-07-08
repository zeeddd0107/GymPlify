/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        main: ["Poppins", "Arial", "sans-serif"],
      },
      colors: {
        primary: "#4361EE",
        secondary: "#3F37C9",
        accent: "#4CC9F0",
        success: "#4CAF50",
        warning: "#FF9800",
        danger: "#F44336",
        light: "#F8F9FA",
        dark: "#212529",
        gray: "#6C757D",
        lightGray: "#E9ECEF",
      },
      boxShadow: {
        soft: "0 4px 6px rgba(0, 0, 0, 0.1)",
      },
      borderRadius: {
        lgx: "20px",
      },
    },
  },
  plugins: [],
};
