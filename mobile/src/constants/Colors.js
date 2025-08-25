const white = "#F4F4F5";
const black = "#212427";
const gray = "#687076";
const blueTint = "#4361EE";

export const Colors = {
  light: {
    text: black,
    background: white,
    tint: blueTint,
    icon: gray,
    tabIconDefault: gray,
    tabIconSelected: blueTint,

    textPrimary: black, // Main text color
    textSecondary: "#E0E0E0", // Secondary text
    textLabel: "#666666", // Title text label
    textValue: "#333333", // Title text
    textPlaceholderPrimary: "#999999", // Placeholder text
    textPlaceholderSecondary: "#B0B0B0", // Placeholder text
    titleInput: "#1A1A1A", // Title input text
    textInverse: white, // Text on dark backgrounds
    textSuccess: "#4CAF50", // Success text
    textWarning: "#D97706", // Warning text
    textError: "#DC2626", // Error text
    iconColor: blueTint, // Icons
  },

  dark: {
    text: white,
    background: black,
    tint: blueTint,
    icon: gray,
    tabIconDefault: gray,
    tabIconSelected: blueTint,

    textPrimary: white, // Main text color
    textSecondary: "#E0E0E0", // Secondary text
    textLabel: "#666666", // Title text label
    textValue: "#333333", // Title text
    textPlaceholderPrimary: "#999999", // Placeholder text
    textPlaceholderSecondary: "#B0B0B0", // Placeholder text
    textInverse: white, // Text on dark backgrounds
    textSuccess: "#4CAF50", // Success text
    textWarning: "#D97706", // Warning text
    textError: "#DC2626", // Error text
    textInfo: blueTint, // Info text
    textLink: blueTint, // Link text
  },

  // Common colors that don't change with theme
  common: {
    transparent: "transparent",
    white: white,
    black: black,
    gray: gray,
    blueTint: blueTint,
  },
};
