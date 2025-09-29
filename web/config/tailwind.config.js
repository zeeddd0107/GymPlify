/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      screens: {
        sm: "40rem", // 640px
        md: "48rem", // 768px
        lg: "64rem", // 1024px
        xl: "80rem", // 1280px
        "2xl": "96rem", // 1536px
      },
      fontFamily: {
        main: ["Poppins", "Arial", "sans-serif"],
      },
      colors: {
        primary: "#4361EE",
        secondary: "#3F37C9",
        saveButton: "#2E2EFF",
        cancelButton: "#FF0000",
        accent: "#4CC9F0",
        success: "#4CAF50",
        warning: "#FF9800",
        danger: "#DC2626",
        light: "#F8F9FA",
        dark: "#212427",
        grayColor: "#6C757D",
        grayButton: "#696969",
        lightGrayText: "#434941",
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
