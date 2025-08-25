import { Pressable, Text, StyleSheet, View } from "react-native";
import { Fonts } from "@/src/constants/Fonts";
import { useTheme } from "@/src/context";

export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  style,
  textStyle,
  leftIcon = null,
  rightIcon = null,
}) {
  const { theme } = useTheme();
  return (
    <Pressable
      style={[
        styles.button,
        { backgroundColor: theme.tint },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      <View style={styles.contentRow}>
        {leftIcon}
        <Text style={[styles.text, textStyle]}>
          {loading ? "Saving..." : title}
        </Text>
        {rightIcon}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
