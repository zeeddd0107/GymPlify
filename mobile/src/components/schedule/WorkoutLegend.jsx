import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const WorkoutLegend = ({ workoutSchedule, dayNames }) => {
  return (
    <View style={styles.workoutLegend}>
      <Text style={styles.legendTitle}>Weekly Workout Schedule</Text>
      <View style={styles.legendGrid}>
        {Object.entries(workoutSchedule).map(([dayIndex, workout]) => (
          <View key={dayIndex} style={styles.legendItem}>
            <View style={styles.legendIconContainer}>
              <Ionicons name={workout.icon} size={12} color={workout.color} />
            </View>
            <Text style={styles.legendText}>
              {dayNames[parseInt(dayIndex)]}: {workout.type}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  workoutLegend: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 5,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  legendGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 8,
  },
  legendIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#f8f9ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  legendText: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
    color: "#666",
    flex: 1,
  },
});

export default WorkoutLegend;
