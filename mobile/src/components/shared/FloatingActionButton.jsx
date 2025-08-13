import { StyleSheet, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "@/src/hooks";

export default function FloatingActionButton({
  onPress,
  icon = "qr-code",
  size = 60,
  position = "bottom-right",
  color = null,
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const buttonColor = color || colors.tint;

  const getPositionStyle = () => {
    switch (position) {
      case "bottom-right":
        return {
          bottom: 20,
          right: 20,
        };
      case "bottom-left":
        return {
          bottom: 20,
          left: 20,
        };
      case "top-right":
        return {
          top: 100,
          right: 20,
        };
      case "top-left":
        return {
          top: 100,
          left: 20,
        };
      default:
        return {
          bottom: 20,
          right: 20,
        };
    }
  };

  return (
    <View style={[styles.container, getPositionStyle()]}>
      <Pressable
        style={[
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: buttonColor,
          },
        ]}
        onPress={onPress}
      >
        <Ionicons name={icon} size={size * 0.4} color="white" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 1000,
  },
  button: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
