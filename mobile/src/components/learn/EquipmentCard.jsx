import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";
import { useTheme } from "@/src/context";

const EquipmentCard = ({ equipment, onPress }) => {
  const { theme } = useTheme();

  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.background }]}
      onPress={() => onPress(equipment)}
    >
      <View style={[styles.imageContainer, { backgroundColor: "#FFFFFF" }]}>
        <View
          style={[styles.iconContainer, { backgroundColor: equipment.color }]}
        >
          <Ionicons name={equipment.icon} size={32} color="#fff" />
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.name, { color: theme.text }]}>
          {equipment.title}
        </Text>

        <Text style={[styles.category, { color: theme.icon }]}>
          {equipment.category}
        </Text>

        <Text
          style={[styles.description, { color: theme.icon }]}
          numberOfLines={2}
        >
          {equipment.instructions}
        </Text>

        {(equipment.sets || equipment.reps) && (
          <View style={styles.setsRepsContainer}>
            {equipment.sets && (
              <View style={styles.setsRepsItem}>
                <Text style={[styles.setsRepsLabel, { color: theme.icon }]}>
                  Sets
                </Text>
                <Text style={[styles.setsRepsValue, { color: theme.text }]}>
                  {equipment.sets}
                </Text>
              </View>
            )}
            {equipment.reps && (
              <View style={styles.setsRepsItem}>
                <Text style={[styles.setsRepsLabel, { color: theme.icon }]}>
                  Reps
                </Text>
                <Text style={[styles.setsRepsValue, { color: theme.text }]}>
                  {equipment.reps}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    overflow: "hidden",
  },
  imageContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  content: {
    padding: 16,
  },
  name: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 22,
    marginBottom: 8,
  },
  category: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  description: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  setsRepsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
  },
  setsRepsItem: {
    alignItems: "center",
    flex: 1,
  },
  setsRepsLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: 10,
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  setsRepsValue: {
    fontFamily: Fonts.family.bold,
    fontSize: 14,
  },
});

export default EquipmentCard;
