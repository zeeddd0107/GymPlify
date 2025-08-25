import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";

export default function LearnScreen() {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={[styles.icon, { color: theme.tint }]}>🎥</Text>
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Coming Soon</Text>
        <Text style={[styles.subtitle, { color: theme.icon }]}>
          Tutorials, workout videos, and fitness instructions will be available
          here soon!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  content: {
    alignItems: "center",
    maxWidth: 300,
  },
  iconContainer: {
    marginBottom: 20,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: 24,
    fontFamily: Fonts.family.bold,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: Fonts.family.medium,
    textAlign: "center",
    lineHeight: 24,
  },
});
