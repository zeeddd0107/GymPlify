import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";

export function IconSymbol({ name, size, color, weight, style }) {
  // Map SF Symbol names to Ionicons names
  const iconMap = {
    "house.fill": "home",
    "magnifyingglass": "search",
    "chevron.right": "chevron-forward",
    "calendar": "calendar",
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
    // Add any default styling here
  },
});
