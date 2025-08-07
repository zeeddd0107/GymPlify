import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export function IconSymbol({ name, size, color, style }) {
  // Map SF Symbol names to Ionicons names for iOS
  const iconMap = {
    "house.fill": "home",
    magnifyingglass: "search",
    "chevron.right": "chevron-forward",
    calendar: "calendar",
  };

  const iconName = iconMap[name] || name;

  return (
    <Ionicons
      name={iconName}
      size={size}
      color={color}
      style={[styles.icon, style]}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    // iOS-specific styling if needed
  },
});
