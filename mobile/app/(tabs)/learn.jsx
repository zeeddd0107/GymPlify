import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import guideService from "@/src/services/guideService";

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
  const [groupedGuides, setGroupedGuides] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    loadGuides(true);
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
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSide} />
        <Text style={[styles.title, { color: theme.text }]}>Learn</Text>
        <Pressable
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons
            name="refresh"
            size={20}
            color={refreshing ? theme.icon : theme.text}
          />
        </Pressable>
      </View>

      {/* Category Cards */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#8B5CF6"
            colors={["#8B5CF6"]}
          />
        }
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
    paddingBottom: 12,
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
});
