import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/context";

export function ThemeToggle() {
  const { isDarkMode, toggleTheme, theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: theme.background, borderColor: theme.text },
      ]}
      onPress={toggleTheme}
    >
      <Text style={[styles.text, { color: theme.text }]}>
        {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
  },
});
