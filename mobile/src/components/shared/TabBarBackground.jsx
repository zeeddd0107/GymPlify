import { View } from "react-native";
import { useBottomTabOverflow } from "./TabBarUtils";

export default function TabBarBackground() {
  const { bottom } = useBottomTabOverflow();

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: bottom,
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
      }}
    />
  );
}
