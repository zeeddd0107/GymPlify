import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Dimensions,
} from "react-native";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";

const { width } = Dimensions.get("window");

const RequestSubmittedModal = ({
  visible,
  onClose,
  onConfirm,
  isLoading = false,
  subscriptionName = "subscription",
  customMessage = null,
  customTitle = null,
}) => {
  useEffect(() => {
    if (visible) {
      setStatusBarStyle("light", true);
    } else {
      setStatusBarStyle("dark", true);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
      onShow={() => setStatusBarStyle("light", true)}
      onDismiss={() => setStatusBarStyle("dark", true)}
    >
      <StatusBar style="light" animated />
      <View style={styles.overlay}>
        <View style={styles.statusBarBackground} />
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color="#666" />
          </Pressable>

          {/* Success Icon */}
          <View style={styles.iconContainer}>
            <Ionicons
              name="checkmark-circle-outline"
              size={48}
              color="#10B981"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>{customTitle || "Request Submitted"}</Text>

          {/* Message */}
          <Text style={styles.message}>
            {customMessage ||
              `Your subscription request for ${subscriptionName} has been submitted to the gym owner. You will be notified once it's approved.`}
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* OK Button */}
            <Pressable
              style={[styles.okButton, isLoading && styles.buttonDisabled]}
              onPress={onConfirm}
              disabled={isLoading}
            >
              <Text style={styles.okButtonText}>
                {isLoading ? "Processing..." : "OK"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 0,
  },
  statusBarBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 50, // Status bar height
    backgroundColor: "#7A7A7A",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 30,
    paddingBottom: 20,
    width: width * 0.85,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 15,
    marginTop: 10,
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    gap: 12,
  },
  okButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  okButtonText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    color: "white",
  },
});

export default RequestSubmittedModal;
