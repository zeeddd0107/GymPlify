import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import { useTheme } from "@/src/context";

export function IconSymbol({ name, size, color, style }) {
  const { theme } = useTheme();

  // Map SF Symbol names to Ionicons names for iOS
  const iconMap = {
    "house.fill": "home",
    magnifyingglass: "search",
    "chevron.right": "chevron-forward",
    calendar: "calendar",
    mail: "mail",
  };

  const iconName = iconMap[name] || name;

  // Use the provided color or fall back to the theme-appropriate icon color
  const iconColor = color || theme.icon;

  return (
    <Ionicons
      name={iconName}
      size={size}
      color={iconColor}
      style={[styles.icon, style]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    // iOS-specific styling if needed
  },
});
