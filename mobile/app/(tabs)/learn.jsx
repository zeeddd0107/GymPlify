import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import guideService from "@/src/services/guideService";
import { useAuth } from "@/src/context";
import { getUserActiveSubscription } from "@/src/services/subscriptionService";
import { firestore } from "@/src/services/firebase";

// Category Card Component
const CategoryCard = ({ category, guideCount, onPress, theme }) => {
  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case "free weights":
        return "barbell-outline";
      case "benches & racks":
        return "fitness-outline";
      case "plate-loaded machines (hammer strength–style)":
        return "hardware-chip-outline";
      case "selectorized weight machines (pin-loaded)":
        return "settings-outline";
      case "cable machines":
        return "git-network-outline";
      case "bodyweight/assisted machines":
        return "body-outline";
      case "leg & glute specialty machines":
        return "walk-outline";
      case "cardio machines":
        return "pulse-outline";
      case "other strength/functional training tools":
        return "ellipse-outline";
      default:
        return "fitness-outline";
    }
  };

  const getCategoryColor = (category) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#FF9F43",
      "#6C5CE7",
      "#FD79A8",
      "#00B894",
    ];
    const index = category.length % colors.length;
    return colors[index];
  };

  return (
    <Pressable
      style={[styles.categoryCard, { backgroundColor: theme.background }]}
      onPress={onPress}
    >
      <View
        style={[styles.categoryImageContainer, { backgroundColor: "#FFFFFF" }]}
      >
        <View
          style={[
            styles.categoryIconContainer,
            { backgroundColor: getCategoryColor(category) },
          ]}
        >
          <Ionicons name={getCategoryIcon(category)} size={32} color="#fff" />
        </View>
      </View>

      <View style={styles.categoryContent}>
        <Text style={[styles.categoryName, { color: theme.text }]}>
          {category}
        </Text>
        <Text style={[styles.categorySubtitle, { color: theme.icon }]}>
          {guideCount} {guideCount === 1 ? "guide" : "guides"}
        </Text>
      </View>
    </Pressable>
  );
};

export default function LearnScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user: authUser } = useAuth();
  const [groupedGuides, setGroupedGuides] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  // Ensure status bar is set to dark when component mounts
  useEffect(() => {
    setStatusBarStyle("dark", true);
  }, []);

  useEffect(() => {
    checkSubscriptionStatus();
  }, [authUser, checkSubscriptionStatus]);

  useEffect(() => {
    if (!checkingSubscription && !isSubscriptionExpired) {
      loadGuides();
    }
  }, [checkingSubscription, isSubscriptionExpired]);

  const checkSubscriptionStatus = useCallback(async () => {
    if (!authUser) {
      setCheckingSubscription(false);
      return;
    }

    try {
      // First check user's role to determine if they should have subscription access
      const userDoc = await firestore
        .collection("users")
        .doc(authUser.uid)
        .get();
      if (!userDoc.exists) {
        setCheckingSubscription(false);
        return;
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      // Only check subscription status for clients (regular users)
      // Staff and admin don't need subscription checks for Learn tab access
      if (userRole === "client") {
        const activeSubscription = await getUserActiveSubscription(
          authUser.uid,
        );
        if (activeSubscription && activeSubscription.isExpired) {
          setIsSubscriptionExpired(true);
        }
      }
      // For staff and admin, always allow access (no subscription check needed)
    } catch (error) {
      // Only log non-permission errors
      if (!error.code || error.code !== "permission-denied") {
        console.error("Error checking subscription status:", error);
      }
      // If there's a permission error or no subscription, allow access to Learn tab
      // This handles cases where users don't have subscriptions yet or permission issues
      setIsSubscriptionExpired(false);
    } finally {
      setCheckingSubscription(false);
    }
  }, [authUser]);

  const loadGuides = async () => {
    try {
      setLoading(true);

      const guidesData = await guideService.getAllGuides();

      // Group guides by category
      const grouped = guidesData.reduce((acc, guide) => {
        const category = guide.category || "Other";
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(guide);
        return acc;
      }, {});

      setGroupedGuides(grouped);
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error("Error loading guides:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/equipment-detail",
      params: { category: category },
    });
  };

  const HANDLE_EQUIPMENT_PRESS = (guide) => {
    router.push({
      pathname: "/equipment-info",
      params: { id: guide.id },
    });
  };

  if (checkingSubscription) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={[styles.title, { color: theme.text }]}>Learn</Text>
          <View style={styles.headerSide} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Checking subscription...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSubscriptionExpired) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={[styles.title, { color: theme.text }]}>Learn</Text>
          <View style={styles.headerSide} />
        </View>
        <View style={styles.expiredContainer}>
          <View style={styles.expiredIcon}>
            <Ionicons name="time-outline" size={48} color="#DC2626" />
          </View>
          <Text style={[styles.expiredTitle, { color: theme.text }]}>
            Subscription Expired
          </Text>
          <Text style={[styles.expiredSubtext, { color: theme.text }]}>
            Your subscription has expired. Renew your subscription to access
            learning materials and other premium features.
          </Text>
          <Pressable
            style={styles.renewButton}
            onPress={() => router.push("/subscriptions")}
          >
            <Text style={styles.renewButtonText}>Renew Subscription</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={[styles.title, { color: theme.text }]}>Learn</Text>
          <View style={styles.headerSide} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading guides...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <View style={styles.headerSide} />
          <Text style={[styles.title, { color: theme.text }]}>Learn</Text>
          <View style={styles.headerSide} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>
            Error: {error}
          </Text>
          <Pressable style={styles.retryButton} onPress={loadGuides}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar style="dark" />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={[styles.title, { color: theme.text }]}>Learn</Text>
        <View style={styles.headerSide} />
      </View>

      {/* Category Cards */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {Object.keys(groupedGuides).map((category) => (
            <CategoryCard
              key={category}
              category={category}
              guideCount={groupedGuides[category].length}
              onPress={() => handleCategoryPress(category)}
              theme={theme}
            />
          ))}
        </View>

        {Object.keys(groupedGuides).length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.text }]}>
              No categories available
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  headerSide: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.family.bold,
    flex: 1,
    textAlign: "center",
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 24,
    paddingBottom: 20,
  },
  grid: {
    gap: 16,
  },
  categoryCard: {
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 30,
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
  categoryImageContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
  },
  categoryIconContainer: {
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
  categoryContent: {
    padding: 16,
  },
  categoryName: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 22,
    marginBottom: 8,
  },
  categorySubtitle: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontFamily: Fonts.family.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontFamily: Fonts.family.medium,
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.family.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: Fonts.family.medium,
    textAlign: "center",
  },
  expiredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  expiredIcon: {
    marginBottom: 20,
  },
  expiredTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 24,
    marginTop: 20,
    marginBottom: 12,
    textAlign: "center",
  },
  expiredSubtext: {
    fontFamily: Fonts.family.regular,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 20,
  },
  renewButton: {
    backgroundColor: "#4361EE",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  renewButtonText: {
    color: "white",
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
  },
});
