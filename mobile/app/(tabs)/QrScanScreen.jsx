import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { recordAttendance } from "./explore";

export default function QrScanScreen() {
  const [qrValue, setQrValue] = useState("");
  const [loading, setLoading] = useState(false);

  // Extract userId from QR value (expects: userId_timestamp_random)
  function extractUserId(qr) {
    // Debug: log the scanned QR value
    console.log("Scanned QR value:", qr);
    return qr.split("_")[0];
  }

  // Validate QR value format: userId_timestamp_random
  function isValidQrValue(qr) {
    const parts = qr.split("_");
    return parts.length === 3 && parts[0] && parts[1] && parts[2];
  }

  const handleScan = async (value) => {
    if (!value) return;
    if (!isValidQrValue(value)) {
      console.log("Invalid QR code format:", value);
      return;
    }
    const userId = extractUserId(value);
    console.log("Extracted userId:", userId);
    if (!userId || userId.length < 10) {
      Alert.alert(
        "Error",
        "Invalid QR code format. Make sure you scanned the correct code.",
      );
      return;
    }
    setLoading(true);
    try {
      await recordAttendance(userId);
      Alert.alert("Success", "Attendance recorded.");
      setQrValue("");
    } catch (err) {
      console.log("Attendance error:", err);
      Alert.alert(
        "Error",
        "Failed to record attendance. Please check your connection and try again.",
      );
    }
    setLoading(false);
  };

  // Automatically handle scan when a valid QR value is detected
  const handleChangeText = (text) => {
    setQrValue(text);
    if (isValidQrValue(text)) {
      handleScan(text);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan QR Code</Text>
      <TextInput
        style={styles.input}
        placeholder="Paste or scan QR code value"
        value={qrValue}
        onChangeText={handleChangeText}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!loading}
      />
      <Button
        title={loading ? "Processing..." : "Submit"}
        onPress={() => handleScan(qrValue)}
        disabled={loading || !isValidQrValue(qrValue)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#10131a",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    width: "100%",
    marginBottom: 16,
    fontSize: 16,
  },
});
