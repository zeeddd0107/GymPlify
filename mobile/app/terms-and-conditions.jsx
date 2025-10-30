import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";

export default function TermsAndConditionsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Terms & Conditions
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.mainTitle, { color: theme.textPrimary }]}>
            GymPlify Terms of Service
          </Text>
          <Text style={[styles.effectiveDate, { color: theme.icon }]}>
            Effective Date: September 1, 2025
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Welcome to GymPlify! These Terms and Conditions ("Terms") govern
            your use of the GymPlify Android Application and Web Dashboard
            (collectively, the "Service"). By accessing or using our Service,
            you agree to be bound by these Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            1. Acceptance of Terms
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            By creating an account, accessing, or using GymPlify, you accept and
            agree to be bound by these Terms and our Privacy Policy. If you do
            not agree to these Terms, please do not use our Service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            2. Service Description
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            GymPlify is a comprehensive gym management platform that provides:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Membership Management: Subscription plans and membership tracking
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Attendance System: QR code-based check-in and check-out
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Session Scheduling: Group fitness and personal training sessions
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Inventory Management: Gym equipment tracking
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Equipment Guides: Video tutorials and exercise demonstrations
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Android Application Push Notifications: Real-time updates and
            reminders
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Staff Management: Admin and staff access controls
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            3. User Accounts
          </Text>
          <Text style={[styles.subTitle, { color: theme.textPrimary }]}>
            3.1 Account Creation
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • You must provide accurate, current, and complete information
            during registration
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • You are responsible for maintaining the confidentiality of your
            account credentials
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • You agree to notify us immediately of any unauthorized access to
            your account
          </Text>

          <Text style={[styles.subTitle, { color: theme.textPrimary }]}>
            3.2 Account Types
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Members: Access to gym facilities, scheduling sessions, and
            viewing content
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Staff: Limited administrative access to manage check-ins and
            inventory
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Administrators: Full access to all system features and user
            management
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            4. Membership and Subscriptions
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            GymPlify offers various subscription plans including Walk-in
            Sessions, Monthly Plans, and Coaching Programs. All subscriptions
            are subject to the terms of the selected plan.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            5. QR Code System
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            Each member is assigned a unique QR code for attendance tracking.
            You are responsible for keeping your QR code secure and not sharing
            it with others.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            6. User Responsibilities
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Comply with all gym rules and regulations
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Use equipment safely and appropriately
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Respect other members and staff
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            • Maintain accurate account information
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            7. Privacy and Data Protection
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            We collect and process your personal information in accordance with
            our Privacy Policy. This includes your name, email, profile picture,
            attendance records, and subscription information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            8. Termination
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            We reserve the right to suspend or terminate your account if you
            violate these Terms or engage in activities that harm the Service or
            other users.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            9. Contact Information
          </Text>
          <Text style={[styles.paragraph, { color: theme.text }]}>
            If you have any questions about these Terms, please contact us at:
          </Text>
          <Text style={[styles.bulletPoint, { color: theme.text }]}>
            Email: support@gymplify.com
          </Text>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <Text style={[styles.paragraph, { color: theme.icon }]}>
            By using GymPlify, you acknowledge that you have read, understood,
            and agree to be bound by these Terms and Conditions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 22,
    flex: 1,
    textAlign: "center",
  },
  headerPlaceholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 0,
  },
  mainTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 28,
    marginBottom: 8,
  },
  effectiveDate: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 20,
    marginBottom: 12,
  },
  subTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontFamily: Fonts.family.regular,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 8,
  },
  bulletPoint: {
    fontFamily: Fonts.family.regular,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 6,
    paddingLeft: 8,
  },
});

