import { StyleSheet, Text } from "react-native";

import { useThemeColor } from "@/src/hooks/useThemeColor";
import { Fonts } from "@/src/constants/Fonts";

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  ...rest
}) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return (
    <Text
      style={[
        { color },
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.family.regular,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: Fonts.family.semiBold,
  },
  title: {
    fontSize: 32,
    fontFamily: Fonts.family.bold,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: Fonts.family.bold,
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
    fontFamily: Fonts.family.regular,
  },
});
