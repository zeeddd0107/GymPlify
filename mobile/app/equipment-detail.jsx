import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Dimensions,
  ImageBackground,
  Animated,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import guideService from "@/src/services/guideService";

const { width: screenWidth } = Dimensions.get("window");
const cardWidth = screenWidth * 0.7; // Smaller cards to show more of adjacent cards
const cardSpacing = 10; // Space between cards
const sideMargin = (screenWidth - cardWidth) / 2; // Center the current card

export default function EquipmentDetailScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const params = useLocalSearchParams();
  const { category } = params;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [categoryGuides, setCategoryGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const scrollViewRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isProgrammaticScrollRef = useRef(false);

  useEffect(() => {
    loadGuidesByCategory();
  }, [category, loadGuidesByCategory]);

  const loadGuidesByCategory = useCallback(async () => {
    try {
      setLoading(true);
      const guides = await guideService.getGuidesByCategory(category);
      setCategoryGuides(guides);
    } catch (error) {
      console.error("Error loading guides by category:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [category]);

  // Ensure first card is centered on mount
  useEffect(() => {
    if (scrollViewRef.current && categoryGuides.length > 0) {
      // Small delay to ensure layout is complete
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: 0,
          animated: false,
        });
      }, 100);
    }
  }, [categoryGuides.length]);

  // Auto-center only for programmatic changes (e.g., pagination taps)
  useEffect(() => {
    if (!isProgrammaticScrollRef.current) return;
    if (scrollViewRef.current && categoryGuides.length > 0) {
      const targetX = currentIndex * (cardWidth + cardSpacing);
      scrollViewRef.current?.scrollTo({
        x: targetX,
        animated: true,
      });
    }
    isProgrammaticScrollRef.current = false;
  }, [currentIndex, categoryGuides.length]);

  // Animated scroll handler to drive card transforms
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true },
  );

  const handleScrollEnd = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    // Include side margin so index detection matches visual center
    const adjustedOffset = contentOffsetX + sideMargin;
    const index = Math.round(adjustedOffset / (cardWidth + cardSpacing));
    const clampedIndex = Math.max(
      0,
      Math.min(index, categoryGuides.length - 1),
    );
    if (clampedIndex !== currentIndex) {
      // If user is still dragging rapidly, prefer immediate snap
      setCurrentIndex(clampedIndex);
    }
  };

  const scrollToIndex = (index) => {
    const clampedIndex = Math.max(
      0,
      Math.min(index, categoryGuides.length - 1),
    );
    const targetX = clampedIndex * (cardWidth + cardSpacing);

    isProgrammaticScrollRef.current = true;
    scrollViewRef.current?.scrollTo({
      x: targetX,
      animated: true,
    });

    // Update current index immediately for better UX
    setCurrentIndex(clampedIndex);
  };

  const handleCardPress = (equipment) => {
    router.push({
      pathname: "/equipment-info",
      params: { id: String(equipment.id) },
    });
  };

  const renderEquipmentCard = (guide, index) => {
    const isCurrent = index === currentIndex;
    const zIndex = isCurrent ? 3 : 1;

    // Account for side margin to align animation peak with visual center
    const cardCenter = index * (cardWidth + cardSpacing) + sideMargin;
    const inputRange = [
      cardCenter - (cardWidth + cardSpacing),
      cardCenter,
      cardCenter + (cardWidth + cardSpacing),
    ];
    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.85, 1.0, 0.85],
      extrapolate: "clamp",
    });
    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.75, 1.0, 0.75],
      extrapolate: "clamp",
    });

    const isLast = index === categoryGuides.length - 1;
    return (
      <View
        key={guide.id}
        style={[
          styles.cardContainer,
          { width: cardWidth, zIndex, marginRight: isLast ? 0 : cardSpacing },
        ]}
      >
        <Pressable onPress={() => handleCardPress(guide)}>
          <Animated.View
            style={[
              styles.equipmentCard,
              {
                backgroundColor: theme.background,
                transform: [{ scale }],
                opacity,
              },
            ]}
          >
            {/* Image Section */}
            <View style={styles.imageSection}>
              <View
                style={[
                  styles.imageContainer,
                  { backgroundColor: guide.color || "#8B5CF6" },
                ]}
              >
                <Ionicons
                  name={guide.icon || "fitness-outline"}
                  size={80}
                  color="#fff"
                />
              </View>
            </View>

            {/* Content Section */}
            <View
              style={[
                styles.contentSection,
                { backgroundColor: guide.color || "#8B5CF6" },
              ]}
            >
              <Text style={styles.equipmentName}>{guide.title}</Text>

              <Text style={styles.detailLabel}>Target Muscles:</Text>
              <View style={styles.muscleGroupsContainer}>
                <View style={styles.muscleTags}>
                  {guide.target && guide.target.length > 0 ? (
                    guide.target.map((muscle, index) => (
                      <View key={index} style={styles.muscleTag}>
                        <Text style={styles.muscleText}>{muscle}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.muscleTag}>
                      <Text style={styles.muscleText}>Full Body</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </Animated.View>
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>{category}</Text>
          <View style={styles.placeholder} />
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

  if (error || categoryGuides.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>{category}</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.text }]}>
            {error ? `Error: ${error}` : "No guides found for this category."}
          </Text>
          <Pressable style={styles.retryButton} onPress={loadGuidesByCategory}>
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
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.title, { color: theme.text }]}>{category}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Equipment Cards */}
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        scrollEventThrottle={16}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="normal"
        snapToInterval={cardWidth + cardSpacing}
        snapToAlignment="start"
        snapToOffsets={categoryGuides.map(
          (_, i) => i * (cardWidth + cardSpacing),
        )}
        disableIntervalMomentum
        contentInsetAdjustmentBehavior="never"
        bounces={false}
        automaticallyAdjustContentInsets={false}
      >
        {categoryGuides.map((guide, index) =>
          renderEquipmentCard(guide, index),
        )}
      </Animated.ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {categoryGuides.map((_, index) => (
          <Pressable
            key={index}
            style={[
              styles.paginationDot,
              {
                backgroundColor:
                  index === currentIndex ? "#8B5CF6" : theme.icon,
              },
            ]}
            onPress={() => scrollToIndex(index)}
          />
        ))}
      </View>

      {/* Equipment Counter */}
      <View style={styles.counterContainer}>
        <Text style={[styles.counterText, { color: theme.icon }]}>
          {currentIndex + 1} of {categoryGuides.length}
        </Text>
      </View>

      {/* Modal removed; navigation now goes to equipment-info screen */}
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
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontFamily: Fonts.family.bold,
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingLeft: sideMargin,
    paddingRight: sideMargin,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  equipmentCard: {
    height: 500,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  imageSection: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  equipmentName: {
    fontSize: 20,
    fontFamily: Fonts.family.bold,
    color: "#fff",
    textAlign: "left",
    marginBottom: 16,
  },
  contentSection: {
    height: 200,
    width: 280,
    padding: 20,
    justifyContent: "flex-start",
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: Fonts.family.semiBold,
    color: "#fff",
  },
  muscleGroupsContainer: {
    gap: 8,
  },
  muscleTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  muscleTag: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  muscleText: {
    fontSize: 12,
    fontFamily: Fonts.family.medium,
    color: "#fff",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  counterContainer: {
    alignItems: "center",
    paddingBottom: 20,
  },
  counterText: {
    fontSize: 14,
    fontFamily: Fonts.family.medium,
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8F4FF",
  },
  modalScrollView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalBackButton: {
    padding: 8,
  },
  modalMenuButton: {
    padding: 8,
  },
  modalImageContainer: {
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  modalImageBackground: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    marginTop: -20,
    minHeight: "70%",
  },
  modalDetailsHeader: {
    marginBottom: 20,
  },
  modalCategory: {
    fontSize: 14,
    color: "#FF6B6B",
    fontFamily: Fonts.family.medium,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 28,
    fontFamily: Fonts.family.bold,
    color: "#000",
    marginBottom: 16,
  },
  modalAttendees: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  attendeeAvatars: {
    flexDirection: "row",
    marginRight: 8,
  },
  attendeeAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    marginLeft: -4,
    borderWidth: 2,
    borderColor: "#fff",
  },
  attendeeText: {
    fontSize: 14,
    color: "#666",
    fontFamily: Fonts.family.regular,
  },
  modalLocation: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
    fontFamily: Fonts.family.regular,
    marginLeft: 4,
    flex: 1,
  },
  directionsText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontFamily: Fonts.family.medium,
  },
  modalAboutSection: {
    marginBottom: 24,
  },
  aboutTitle: {
    fontSize: 18,
    fontFamily: Fonts.family.bold,
    color: "#000",
    marginBottom: 12,
  },
  aboutDescription: {
    fontSize: 16,
    fontFamily: Fonts.family.regular,
    color: "#666",
    lineHeight: 24,
  },
  modalEquipmentDetails: {
    marginBottom: 32,
  },
  muscleGroupsSection: {
    marginTop: 16,
  },
  exercisesSection: {
    marginTop: 16,
  },
  modalActionSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  pricingSection: {
    flex: 1,
  },
  originalPrice: {
    fontSize: 16,
    color: "#999",
    textDecorationLine: "line-through",
    fontFamily: Fonts.family.regular,
  },
  offerPrice: {
    fontSize: 20,
    fontFamily: Fonts.family.bold,
    color: "#000",
    marginTop: 4,
  },
  offerExpiry: {
    fontSize: 12,
    color: "#999",
    fontFamily: Fonts.family.regular,
    marginTop: 4,
  },
  attendButton: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 16,
  },
  attendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.family.bold,
  },
});
