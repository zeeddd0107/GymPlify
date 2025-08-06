import { Ionicons } from "@expo/vector-icons";
import React from "react";

export function IconSymbol({ size, name, color }) {
  // Map SF Symbol names to Ionicons names
  const iconMap = {
    "house.fill": "home",
    magnifyingglass: "search",
    calendar: "calendar",
    person: "person",
  };

  const iconName = iconMap[name] || name;

  return <Ionicons name={iconName} size={size} color={color} />;
}
