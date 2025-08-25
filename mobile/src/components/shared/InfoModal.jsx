import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { Fonts } from "@/src/constants/Fonts";

export default function InfoModal({
  visible,
  onClose,
  title,
  lines = [],
  colors,
}) {
  const parsed = lines.map((line) => {
    const [label, ...rest] = String(line).split(": ");
    return { label, value: rest.join(": ") };
  });
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: colors.background }]}
          onPress={() => {}}
        >
          <Text style={[styles.centerTitle, { color: colors.text }]}>
            {title}
          </Text>
          <View style={styles.rows}>
            {parsed.map((item, idx) => (
              <View key={idx} style={styles.row}>
                <Text
                  style={[
                    styles.rowLabel,
                    item.label === "Check-in" ? styles.checkInPadRight : null,
                    { color: colors.text },
                  ]}
                >
                  {item.label}:
                </Text>
                <Text style={[styles.rowValue, { color: colors.text }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.tint }]}
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  centerTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 22,
    textAlign: "center",
    marginBottom: 12,
  },
  rows: { marginBottom: 20 },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingVertical: 6,
  },
  rowLabel: { fontFamily: Fonts.family.regular, fontSize: 18, marginRight: 12 },
  checkInPadRight: { paddingRight: 12 },
  rowValue: {
    fontFamily: Fonts.family.regular,
    fontSize: 18,
    flexShrink: 1,
    textAlign: "left",
  },
  closeButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
  },
});
