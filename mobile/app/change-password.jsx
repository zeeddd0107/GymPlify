import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";
import { useTheme } from "@/src/context";
import { firebase } from "@/src/services/firebase";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Determine provider (Google vs password)
  const authUser = firebase.auth().currentUser;
  const isGoogleUser = useMemo(() => {
    const providers = authUser?.providerData || [];
    return providers.some((p) => (p?.providerId || "").includes("google"));
  }, [authUser]);

  // Password validation copied from reset/login logic
  const rules = {
    minLength: (pw) => pw.length >= 8,
    hasUpper: (pw) => /[A-Z]/.test(pw),
    hasNumber: (pw) => /\d/.test(pw),
    hasSpecial: (pw) => /[^A-Za-z0-9]/.test(pw),
  };
  const validation = {
    minLength: rules.minLength(newPassword),
    hasUpper: rules.hasUpper(newPassword),
    hasNumber: rules.hasNumber(newPassword),
    hasSpecial: rules.hasSpecial(newPassword),
  };
  const isNewPasswordValid =
    validation.minLength && validation.hasUpper && validation.hasNumber && validation.hasSpecial;

  const handleChangePassword = async () => {
    try {
      setMessage("");
      if (!oldPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
        setMessage("Please fill out all fields.");
        return;
      }
      if (!isNewPasswordValid) {
        setMessage("New password does not meet security requirements.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage("New passwords do not match.");
        return;
      }
      const user = firebase.auth().currentUser;
      if (!user?.email) {
        setMessage("No authenticated user.");
        return;
      }
      setLoading(true);
      // Re-authenticate with old password
      const cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPassword);
      await user.reauthenticateWithCredential(cred);
      // Update password
      await user.updatePassword(newPassword);
      Alert.alert("Success", "Your password has been changed.");
      router.back();
    } catch (e) {
      if (__DEV__) {
        console.warn("Change password error:", e);
      }
      let friendly = e?.message || "Failed to change password";
      const code = e?.code || "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || /invalid-credential/i.test(friendly)) {
        friendly = "Old password is incorrect. Please try again.";
      }
      setMessage(friendly);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.kav}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Change Password</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        {isGoogleUser ? (
          <View style={styles.content}>
            <Text style={[styles.infoText, { color: theme.text }]}>You signed in using Google. To change your password, please update it in your Google Account settings.</Text>
          </View>
        ) : (
          <View style={styles.form}>
            {!!message && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={16} color="#b45309" style={{ marginRight: 6 }} />
                <Text style={styles.warningText}>{message}</Text>
              </View>
            )}

            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputGrow]}
                placeholder="Old password"
                secureTextEntry={!showOld}
                value={oldPassword}
                onChangeText={setOldPassword}
                editable={!loading}
                placeholderTextColor="#9ca3af"
              />
              {oldPassword.length > 0 && (
                <Pressable style={styles.eyeButton} onPress={() => setShowOld((p) => !p)}>
                  <Feather name={showOld ? "eye-off" : "eye"} size={20} color="#6b7280" />
                </Pressable>
              )}
            </View>

            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputGrow]}
                placeholder="New password"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!loading}
                placeholderTextColor="#9ca3af"
              />
              {newPassword.length > 0 && (
                <Pressable style={styles.eyeButton} onPress={() => setShowNew((p) => !p)}>
                  <Feather name={showNew ? "eye-off" : "eye"} size={20} color="#6b7280" />
                </Pressable>
              )}
            </View>

            <View style={styles.rules}>
              <Text style={styles.ruleItem}>{validation.minLength ? "✓" : "•"} At least 8 characters</Text>
              <Text style={styles.ruleItem}>{validation.hasUpper ? "✓" : "•"} At least 1 uppercase letter</Text>
              <Text style={styles.ruleItem}>{validation.hasNumber ? "✓" : "•"} At least 1 number</Text>
              <Text style={styles.ruleItem}>{validation.hasSpecial ? "✓" : "•"} At least 1 special character</Text>
            </View>

            <View style={styles.inputWithIcon}>
              <TextInput
                style={[styles.input, styles.inputGrow]}
                placeholder="Confirm new password"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!loading}
                placeholderTextColor="#9ca3af"
              />
              {confirmPassword.length > 0 && (
                <Pressable style={styles.eyeButton} onPress={() => setShowConfirm((p) => !p)}>
                  <Feather name={showConfirm ? "eye-off" : "eye"} size={20} color="#6b7280" />
                </Pressable>
              )}
            </View>

            <Pressable
              style={[styles.submitButton, { opacity: loading ? 0.6 : 1 }]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.submitText}>{loading ? "Updating..." : "Update Password"}</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  kav: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: { padding: 8 },
  headerTitle: { fontFamily: Fonts.family.bold, fontSize: 20 },
  headerPlaceholder: { width: 40 },
  content: { paddingHorizontal: 20, paddingTop: 24 },
  infoText: { fontFamily: Fonts.family.regular, fontSize: 16, lineHeight: 22 },
  form: { paddingHorizontal: 20, paddingTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 12,
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputWithIcon: { position: "relative", marginTop: 0 },
  inputGrow: { paddingRight: 40 },
  eyeButton: { position: "absolute", right: 12, top: 22, padding: 4 },
  rules: { marginTop: 8 },
  ruleItem: { fontFamily: Fonts.family.regular, fontSize: 12, color: "#6b7280" },
  submitButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 18,
  },
  submitText: { color: "white", fontFamily: Fonts.family.semiBold, fontSize: 16 },
  errorText: { color: "#ef4444", fontFamily: Fonts.family.regular, marginBottom: 4 },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderColor: "#fde68a",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  warningText: { color: "#b45309", fontFamily: Fonts.family.regular, fontSize: 13, flex: 1 },
});


