import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Fonts } from "@/src/constants/Fonts";
import { useRouter } from "expo-router";

const SubscriptionPlans = ({ colors, onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState("monthly");
  const router = useRouter();

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
      popular: false,
      color: "#4361EE", // Blue
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
      popular: true,
      color: "#8b5cf6", // Purple
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
      popular: false,
      color: "#f59e0b", // Orange
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
      popular: false,
      color: "#10b981", // Green
    },
  ];

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    if (onSelectPlan) {
      onSelectPlan(planId);
    }
  };

  const handleChoosePlan = (plan) => {
    router.push({
      pathname: "/payment-confirmation",
      params: { planId: plan.id },
    });
  };

  const renderPlanCard = (plan) => (
    <Pressable
      key={plan.id}
      onPress={() => handleSelectPlan(plan.id)}
      android_ripple={null}
      style={[
        styles.planCard,
        {
          backgroundColor: plan.color, // Use plan's color as background
          borderColor: selectedPlan === plan.id ? plan.color : plan.color, // Match card color when not selected
          borderWidth: 3, // Keep consistent border width
        },
      ]}
    >
      {plan.popular && (
        <View style={styles.popularBanner}>
          <Text style={styles.popularBannerText}>BEST VALUE</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <Text style={styles.planName}>{plan.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: "white" }]}>{plan.price}</Text>
          <Text
            style={[styles.period, { color: "white", fontWeight: "semibold" }]}
          >
            {plan.period}
          </Text>
        </View>

        <Text
          style={[styles.description, { color: "white", fontWeight: "bold" }]}
        >
          {plan.description}
        </Text>

        <View style={styles.featuresContainer}>
          {plan.features.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color="white"
                style={styles.checkIcon}
              />
              <Text
                style={[
                  styles.featureText,
                  { color: "white", fontWeight: "semibold" },
                ]}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        style={[
          styles.selectButton,
          {
            backgroundColor: "white",
          },
        ]}
        onPress={() => handleChoosePlan(plan)}
      >
        <Text style={[styles.selectButtonText, { color: plan.color }]}>
          Subscribe
        </Text>
      </Pressable>
    </Pressable>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Choose Your Subscription
          </Text>
          <Text style={[styles.subtitle, { color: colors.icon }]}>
            Unlock your fitness potential with our flexible subscription plans
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {plans.map(renderPlanCard)}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 20,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontFamily: Fonts.family.bold,
    fontSize: 38,
    marginBottom: 8,
    textAlign: "center",
    flexWrap: "wrap",
  },
  subtitle: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingHorizontal: 0,
  },
  planCard: {
    width: 280,
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 12,
    position: "relative",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
  },
  popularBanner: {
    top: -3,
    right: -3,
    position: "absolute",
    backgroundColor: "#ef4444", // Red background
    paddingVertical: 12,
    paddingHorizontal: 12,
    paddingRight: 16,
    borderRadius: 8,
    borderTopRightRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  popularBannerText: {
    color: "white",
    fontFamily: Fonts.family.bold,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  price: {
    color: "white",
    fontFamily: Fonts.family.bold,
    fontSize: 36,
  },
  period: {
    color: "rgba(255, 255, 255, 0.8)",
    fontFamily: Fonts.family.regular,
    fontSize: 18,
    marginLeft: 8,
  },
  description: {
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  cardContent: {
    flex: 1,
    marginBottom: 20,
  },
  planName: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    color: "white",
    marginBottom: 12,
  },
  featuresContainer: {
    gap: 12,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkIcon: {
    marginRight: 8,
  },
  featureText: {
    color: "white",
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    flex: 1,
  },
  selectButton: {
    backgroundColor: "white",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  selectButtonText: {
    color: "#1a1a1a",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
});

export default SubscriptionPlans;
