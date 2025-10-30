import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/src/constants/Colors";
import { useColorScheme } from "@/src/hooks";
import { Fonts } from "@/src/constants/Fonts";
import { createPendingSubscription } from "@/src/services/subscriptionService";
import { useAuth } from "@/src/context";
import Logger from "@/src/utils/logger";
import {
  SubscriptionWarningModal,
  RequestSubmittedModal,
} from "@/src/components/shared";

const plans = [
  {
    id: "walkin",
    name: "Walk-in Session",
    price: "₱100",
    period: "per session",
    description: "Pay as you go",
    features: [
      "Single gym session",
      "Basic equipment access",
      "Locker room access",
      "Water station access",
    ],
    color: "#4361EE",
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: "₱850",
    period: "per month",
    description: "Best value for regular gym-goers",
    features: [
      "Unlimited gym access",
      "All equipment included",
      "Locker room access",
      "Water station access",
      "Mobile app features",
      "Progress tracking",
    ],
    color: "#8b5cf6",
  },
  {
    id: "coaching-group",
    name: "Coaching Program",
    price: "₱2,500",
    period: "per month",
    description: "Group coaching - unlimited sessions",
    features: [
      "Everything in Monthly",
      "Personal coaching sessions",
      "Group training classes",
      "Nutrition guidance",
      "Workout plans",
      "Progress monitoring",
      "Unlimited sessions",
    ],
    color: "#f59e0b",
  },
  {
    id: "coaching-solo",
    name: "Coaching Program",
    price: "₱2,500",
    period: "per month",
    description: "Solo coaching - 10 sessions limit",
    features: [
      "Everything in Monthly",
      "Personal coaching sessions",
      "One-on-one training",
      "Nutrition guidance",
      "Custom workout plans",
      "Progress monitoring",
      "10 sessions per month",
    ],
    color: "#10b981",
  },
];

export default function PaymentConfirmationScreen() {
  Logger.render("PaymentConfirmation", "Component rendered");

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  const { planId } = useLocalSearchParams();
  // const [hasPaid, setHasPaid] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [successTitle, setSuccessTitle] = useState(null);
  const [warningTitle, setWarningTitle] = useState(
    "You already have an active subscription!",
  );
  const [warningMessage, setWarningMessage] = useState(
    "Starting a new one will replace your current subscription. Are you sure you want to continue?",
  );
  const [isNotAllowedModal, setIsNotAllowedModal] = useState(false); // Flag for single-button modal
  const { user } = useAuth();

  Logger.payment(`User data - hasUser: ${!!user}, userId: ${user?.id}`);

  const selectedPlan = plans.find((plan) => plan.id === planId) || plans[1]; // Default to monthly

  // const handlePaymentConfirmation = () => {
  //   Alert.alert(
  //     "Payment Confirmed",
  //     `Thank you! Your payment for ${selectedPlan.name} has been recorded.\n\nThe gym owner has been notified and will verify your payment at the counter.\n\nYour subscription will be activated shortly.`,
  //     [
  //       {
  //         text: "OK",
  //         onPress: () => {
  //           // TODO: Send notification to owner
  //           console.log("Payment confirmed for plan:", selectedPlan.id);
  //           console.log("Owner notification sent for:", selectedPlan.name);
  //           router.replace("/(tabs)");
  //         },
  //       },
  //     ]
  //   );
  // };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: "",
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Pressable>
          ),
        }}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}></View>

        <View
          style={[styles.planCard, { backgroundColor: selectedPlan.color }]}
        >
          <View style={styles.planHeader}>
            <View style={styles.planBadge}>
              <Text style={styles.planBadgeText}>SELECTED</Text>
            </View>
            <Ionicons name="checkmark-circle" size={24} color="white" />
          </View>

          <View style={styles.planContent}>
            <Text style={styles.planName}>{selectedPlan.name}</Text>

            <View style={styles.priceContainer}>
              <Text style={styles.planPrice}>{selectedPlan.price}</Text>
              <Text style={styles.planPeriod}>{selectedPlan.period}</Text>
            </View>

            <Text style={styles.planDescription}>
              {selectedPlan.description}
            </Text>
          </View>

          <View style={styles.planFeatures}>
            {selectedPlan.features.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark" size={16} color="white" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Ionicons
            name="information-circle-outline"
            size={24}
            color={colors.tint}
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, { color: colors.text }]}>
            Please proceed to the gym counter to complete your payment. Once
            payment is verified by the admin, your subscription will be
            activated.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[styles.bottomContainer, { backgroundColor: colors.background }]}
      >
        <Text
          style={[
            styles.sectionSubtitle,
            { color: colors.icon, textAlign: "center", marginBottom: 16 },
          ]}
        >
          Have you already paid for this subscription?
        </Text>

        <View style={styles.paymentOptions}>
          <Pressable
            style={[
              styles.primaryButton,
              {
                backgroundColor: "#4361EE",
                opacity: isLoading ? 0.8 : 1,
              },
            ]}
            disabled={isLoading}
            onPress={async () => {
              Logger.payment(`Yes button pressed - planId: ${selectedPlan.id}`);

              if (!user) {
                Logger.error("No user found");
                Alert.alert("Error", "You must be logged in to subscribe.");
                return;
              }

              setIsLoading(true);
              try {
                Logger.payment("Creating pending subscription...");

                // Use user.id if available, otherwise use user.uid
                const userId = user.id || user.uid;
                if (!userId) {
                  throw new Error("No valid user ID found");
                }

                const result = await createPendingSubscription(
                  userId,
                  selectedPlan.id,
                  "counter",
                  user,
                );

                if (result.success) {
                  Logger.payment("Subscription request created successfully");
                  // Set custom message for Walk-in extensions
                  if (result.message && result.message.includes("extended")) {
                    setSuccessMessage(result.message);
                    setSuccessTitle("Walk-in Extended");
                  } else {
                    setSuccessMessage(null);
                    setSuccessTitle(null);
                  }
                  setShowSuccessModal(true);
                } else if (result.hasActiveSubscription) {
                  // Check if this is a "not allowed" case (e.g., monthly to walk-in)
                  if (result.isNotAllowed) {
                    setShowWarningModal(true);
                    setWarningTitle(
                      result.title ||
                        "Cannot Add Walk-in to Monthly Subscription",
                    );
                    setWarningMessage(
                      result.message ||
                        "You already have an active monthly subscription. Walk-in sessions cannot be added to monthly subscriptions.",
                    );
                    setIsNotAllowedModal(true); // Flag to indicate this is a single-button modal
                  } else {
                    setShowWarningModal(true);
                    setWarningTitle(
                      result.title ||
                        "You already have an active subscription!",
                    );
                    setWarningMessage(
                      result.message ||
                        "Starting a new one will replace your current subscription. Are you sure you want to continue?",
                    );
                    setIsNotAllowedModal(false); // Flag to indicate this is a dual-button modal
                  }
                } else {
                  Alert.alert(
                    "Error",
                    result.message || "Failed to submit subscription request",
                  );
                }
              } catch (error) {
                console.error(
                  "💳 PaymentConfirmation: Error creating subscription request:",
                  error,
                );
                Alert.alert(
                  "Error",
                  `Failed to submit subscription request: ${error.message}`,
                );
              } finally {
                setIsLoading(false);
              }
            }}
          >
            <Text style={styles.primaryButtonText}>
              {isLoading ? "Submitting..." : "Yes, Notify the owner"}
            </Text>
          </Pressable>

          <Pressable
            style={styles.skipButton}
            onPress={() => {
              Logger.payment("Not paid yet - going back");
              try {
                router.back();
              } catch (e) {
                // Fallback: navigate to subscriptions if no history
                try { router.push("/subscriptions"); } catch {}
              }
            }}
          >
            <Text style={styles.skipButtonText}>No, I haven't paid yet</Text>
          </Pressable>
        </View>
      </View>

      {/* Subscription Warning Modal */}
      <SubscriptionWarningModal
        visible={showWarningModal}
        onClose={() => {
          setShowWarningModal(false);
          setIsNotAllowedModal(false); // Reset the flag
        }}
        onConfirm={async () => {
          // Only proceed with confirmation if it's not a "not allowed" modal
          if (isNotAllowedModal) {
            return; // Do nothing for not allowed modals
          }

          // Don't close the modal yet, show loading state
          setIsModalLoading(true);
          try {
            const userId = user.id || user.uid;
            if (!userId) {
              throw new Error("No valid user ID found");
            }

            const result = await createPendingSubscription(
              userId,
              selectedPlan.id,
              "counter",
              user,
              true, // bypassSubscriptionCheck = true
            );

            if (result.success) {
              Logger.payment("Subscription request created successfully");
              // Close warning modal and show success modal
              setShowWarningModal(false);
              setShowSuccessModal(true);
            } else {
              Alert.alert(
                "Error",
                result.message || "Failed to submit subscription request",
              );
            }
          } catch (error) {
            console.error(
              "💳 PaymentConfirmation: Error creating subscription request:",
              error,
            );
            Alert.alert(
              "Error",
              `Failed to submit subscription request: ${error.message}`,
            );
          } finally {
            setIsModalLoading(false);
          }
        }}
        isLoading={isModalLoading}
        title={warningTitle}
        message={warningMessage}
        showSingleButton={isNotAllowedModal}
        singleButtonText="OK"
        iconName={
          isNotAllowedModal
            ? "close-circle-outline"
            : "information-circle-outline"
        }
        iconColor={isNotAllowedModal ? "#FF3B30" : "#4361EE"}
      />

      {/* Request Submitted Modal */}
      <RequestSubmittedModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        onConfirm={() => {
          setShowSuccessModal(false);
          setSuccessMessage(null);
          setSuccessTitle(null);
          Logger.payment("Navigating to dashboard");
          router.replace("/(tabs)");
        }}
        subscriptionName={selectedPlan.name}
        customMessage={successMessage}
        customTitle={successTitle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 50,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: 28,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  planCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: "#434941",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 8,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  planBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  planBadgeText: {
    color: "white",
    fontFamily: Fonts.family.bold,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  planContent: {
    marginBottom: 20,
  },
  planName: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    color: "white",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  planPrice: {
    fontFamily: Fonts.family.bold,
    fontSize: 36,
    color: "white",
  },
  planPeriod: {
    fontFamily: Fonts.family.regular,
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 8,
  },
  planDescription: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  planFeatures: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    color: "white",
    marginLeft: 8,
  },
  paymentSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginBottom: 16,
  },
  paymentOptions: {
    alignItems: "center",
    gap: 16,
  },
  primaryButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#434941",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontFamily: Fonts.family.bold,
    fontSize: 16,
    color: "white",
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  skipButtonText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    color: "#4361EE",
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  successCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  successText: {
    flex: 1,
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    lineHeight: 20,
    color: "white",
    marginLeft: 12,
  },
  bottomContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontFamily: Fonts.family.bold,
    fontSize: 16,
    color: "white",
  },
});
