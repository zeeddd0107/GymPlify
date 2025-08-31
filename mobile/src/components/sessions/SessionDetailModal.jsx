import React from "react";
import { View, Text, Pressable, Modal, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const SessionDetailModal = ({
  visible,
  session,
  onClose,
  onDelete,
  onEdit,
}) => {
  console.log("SessionDetailModal received session:", session);
  console.log("Session ID in modal:", session?.id);

  if (!session) return null;

  const getWorkoutIcon = (workoutType) => {
    switch (workoutType.toLowerCase()) {
      case "chest":
        return "barbell-outline";
      case "back":
        return "body-outline";
      case "lower body":
        return "walk-outline";
      case "shoulder":
        return "fitness-outline";
      case "circuit":
        return "repeat-outline";
      default:
        return "fitness-outline";
    }
  };

  const getWorkoutColor = (workoutType) => {
    switch (workoutType.toLowerCase()) {
      case "chest":
        return "#FF6B6B";
      case "back":
        return "#45B7D1";
      case "lower body":
        return "#4ECDC4";
      case "shoulder":
        return "#FFEAA7";
      case "circuit":
        return "#96CEB4";
      default:
        return "#DDA0DD";
    }
  };

  const accentColor = getWorkoutColor(session.workoutType);
  // Title fallback: prefer provided title, else workout type; treat placeholder as empty
  const normalizedTitle = (session?.title || "").trim();
  const isPlaceholderTitle = /^untitled session$/i.test(normalizedTitle);
  const titleToShow =
    normalizedTitle && !isPlaceholderTitle
      ? normalizedTitle
      : session.workoutType;

  const handleDelete = () => {
    Alert.alert(
      "Delete Session",
      "Are you sure you want to delete this session? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            onDelete(session.id);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable
          style={styles.confirmationModal}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Close (X) button */}
          <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
            <Ionicons name="close" size={22} color="#333" />
          </Pressable>

          {/* Workout Icon */}
          <View style={styles.successIconContainer}>
            <View
              style={[styles.successIcon, { backgroundColor: accentColor }]}
            >
              <Ionicons
                name={getWorkoutIcon(session.workoutType)}
                size={40}
                color="white"
              />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.confirmationTitle}>{titleToShow}</Text>

          {/* Session Details */}
          <View style={styles.sessionDetailsContainer}>
            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={20} color="#4361EE" />
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{session.dateDisplay}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={20} color="#4361EE" />
              <Text style={styles.detailLabel}>Time:</Text>
              <Text style={styles.detailValue}>{session.time}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="fitness-outline" size={20} color="#4361EE" />
              <Text style={styles.detailLabel}>Workout:</Text>
              <Text style={styles.detailValue}>{session.workoutType}</Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons
                name={
                  session.type === "solo" ? "person-outline" : "people-outline"
                }
                size={20}
                color="#4361EE"
              />
              <Text style={styles.detailLabel}>Type:</Text>
              <Text style={styles.detailValue}>
                {session.type === "solo" ? "Solo" : "Group"}
              </Text>
            </View>
          </View>

          {/* Additional Info - Descriptions */}
          {session.descriptions && (
            <View style={styles.additionalInfo}>
              <Text style={styles.additionalInfoText}>
                {session.descriptions}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.confirmationButtons}>
            <Pressable style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>

            <Pressable
              style={styles.editButton}
              onPress={() => onEdit(session)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  confirmationModal: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  successIconContainer: {
    marginBottom: 20,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  confirmationTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    color: "#333",
    marginBottom: 24,
    textAlign: "center",
    textTransform: "capitalize",
  },
  sessionDetailsContainer: {
    width: "100%",
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  detailLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#666",
    marginLeft: 12,
    marginRight: 8,
    minWidth: 60,
  },
  detailValue: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  additionalInfo: {
    backgroundColor: "#f8f9ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  additionalInfoText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
  confirmationButtons: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#FF6B6B",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#4361EE",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  editButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
});

export default SessionDetailModal;
