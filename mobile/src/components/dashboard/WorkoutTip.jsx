import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Fonts } from "@/src/constants/Fonts";

const WorkoutTip = ({ workoutTip, colors }) => {
  if (!workoutTip) {
    return null;
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.background }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>
        {workoutTip.title}
      </Text>
      <Text style={[styles.workoutTipText, { color: colors.icon }]}>
        {workoutTip.tip}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 20,
    marginBottom: 10,
  },
  workoutTipText: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    lineHeight: 24,
  },
});

export default WorkoutTip;
