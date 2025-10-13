import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Modal,
  InteractionManager,
  ActivityIndicator,
} from "react-native";
import { StatusBar, setStatusBarStyle } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import guideService from "@/src/services/guideService";
import { VideoThumbnail } from "@/src/components/shared";
import { Video, ResizeMode } from "expo-av";
import * as ScreenOrientation from "expo-screen-orientation";

const GET_DIFFICULTY_COLOR = (difficulty) => {
  switch ((difficulty || "").toLowerCase()) {
    case "beginner":
      return "#4CAF50";
    case "intermediate":
      return "#FF9800";
    case "advanced":
      return "#F44336";
    default:
      return "#9E9E9E";
  }
};

export default function EquipmentInfoScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [isVideoVisible, setIsVideoVisible] = useState(false);
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const params = useLocalSearchParams();
  const guideId = params.id;

  useEffect(() => {
    loadGuide();
  }, [loadGuide]);

  const loadGuide = useCallback(async () => {
    try {
      setLoading(true);
      const guideData = await guideService.getGuideById(guideId);
      setEquipment(guideData);
    } catch (error) {
      console.error("Error loading guide:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    if (isVideoVisible) {
      setStatusBarStyle("light", true);

      const timers = [
        setTimeout(() => setStatusBarStyle("light", true), 50),
        setTimeout(() => setStatusBarStyle("light", true), 150),
        setTimeout(() => setStatusBarStyle("light", true), 300),
      ];
      const interaction = InteractionManager.runAfterInteractions(() => {
        setStatusBarStyle("light", true);
      });
      return () => {
        timers.forEach(clearTimeout);
        interaction.cancel && interaction.cancel();
      };
    } else {
      setStatusBarStyle("dark", true);
      // Lock back to portrait when video closes
      ScreenOrientation.lockAsync(
        ScreenOrientation.OrientationLock.PORTRAIT_UP,
      );
    }
  }, [isVideoVisible]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#fff" }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Equipment</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingState}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Loading guide...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !equipment) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#fff" }]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Equipment</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {error ? `Error: ${error}` : "Guide not found."}
          </Text>
          <Pressable style={styles.retryButton} onPress={loadGuide}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#fff" }]}>
      <StatusBar style={isVideoVisible ? "light" : "dark"} animated />
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {equipment.category}
        </Text>
        <Pressable style={styles.menuButton}>
          <Ionicons name="ellipsis-vertical" size={20} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Video Thumbnail */}
        <VideoThumbnail
          videoUrl={equipment.videoUrl}
          onPress={() => setIsVideoVisible(true)}
        />

        {/* Content Card */}
        <View style={styles.contentCard}>
          <Text style={styles.cardTitle}>{equipment.title}</Text>

          {/* Sets and Reps */}
          <View style={styles.setsRepsContainer}>
            <View style={styles.setsRepsItemFirst}>
              <Text style={styles.setsRepsLabel}>Sets</Text>
              <Text style={styles.setsRepsValue}>
                {equipment.sets || "3-4"}
              </Text>
            </View>
            <View style={styles.setsRepsItem}>
              <Text style={styles.setsRepsLabel}>Reps</Text>
              <Text style={styles.setsRepsValue}>
                {equipment.reps || "8-12"}
              </Text>
            </View>
          </View>

          {/* Instructions */}
          <Text style={styles.aboutHeader}>Instructions</Text>
          <Text style={styles.aboutText}>{equipment.instructions}</Text>
        </View>
      </ScrollView>

      {/* Video Modal */}
      <Modal
        visible={isVideoVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          setIsVideoVisible(false);
          ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP,
          );
        }}
        onShow={() => setStatusBarStyle("light", true)}
        onDismiss={() => {
          setStatusBarStyle("dark", true);
          ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.PORTRAIT_UP,
          );
        }}
      >
        <StatusBar style="light" animated />
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsVideoVisible(false)}
        >
          <Pressable
            style={styles.videoModal}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.videoHeader}>
              <Text style={styles.videoTitle}>Instructional Video</Text>
              <Pressable
                style={styles.closeButton}
                onPress={() => setIsVideoVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </Pressable>
            </View>
            <View style={styles.videoContainer}>
              {equipment?.videoUrl ? (
                <Video
                  ref={videoRef}
                  style={styles.video}
                  source={{ uri: equipment.videoUrl }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay
                  onFullscreenUpdate={(event) => {
                    if (event.fullscreenUpdate === 1) {
                      // Entering fullscreen - allow all orientations
                      ScreenOrientation.lockAsync(
                        ScreenOrientation.OrientationLock.ALL,
                      );
                    } else if (event.fullscreenUpdate === 3) {
                      // Exiting fullscreen - immediately force portrait orientation
                      ScreenOrientation.lockAsync(
                        ScreenOrientation.OrientationLock.PORTRAIT_UP,
                      );
                    }
                  }}
                />
              ) : (
                <View style={styles.noVideoContainer}>
                  <Ionicons name="videocam-off" size={48} color="#999" />
                  <Text style={styles.noVideoText}>No video available</Text>
                </View>
              )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#ffffff",
  },
  backButton: { padding: 8, width: 40 },
  title: {
    fontSize: 20,
    fontFamily: Fonts.family.bold,
    flex: 1,
    textAlign: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: Fonts.family.bold,
    flex: 1,
    textAlign: "center",
  },
  menuButton: { width: 40, alignItems: "flex-end" },
  placeholder: { width: 40 },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  loadingState: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { fontFamily: Fonts.family.medium, fontSize: 16, marginTop: 12 },
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
  scrollContent: { paddingHorizontal: 16, paddingBottom: 16 },
  hero: { alignItems: "center", marginBottom: 0 },
  heroIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
  },
  category: {
    fontFamily: Fonts.family.medium,
    fontSize: 12,
    color: "#FF6B6B",
    marginBottom: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyText: {
    color: "#fff",
    fontFamily: Fonts.family.medium,
    fontSize: 12,
  },
  contentCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
  },
  cardCategory: {
    fontFamily: Fonts.family.medium,
    fontSize: 12,
    color: "#FF6B6B",
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 22,
    color: "#000",
    marginBottom: 8,
  },
  setsRepsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
  },
  setsRepsItem: {
    alignItems: "center",
    flex: 1,
  },
  setsRepsItemFirst: {
    alignItems: "center",
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  setsRepsLabel: {
    fontFamily: Fonts.family.medium,
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  setsRepsValue: {
    fontFamily: Fonts.family.bold,
    fontSize: 18,
    color: "#000",
  },
  attendeesRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  attendeesAvatars: { flexDirection: "row", marginRight: 8 },
  attendeeDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E6E6E6",
    marginRight: 6,
  },
  attendeesText: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
    color: "#666",
  },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  locationText: {
    fontFamily: Fonts.family.regular,
    fontSize: 13,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
  directionsText: {
    fontFamily: Fonts.family.medium,
    fontSize: 13,
    color: "#FF6B6B",
  },
  aboutHeader: {
    fontFamily: Fonts.family.bold,
    fontSize: 16,
    color: "#000",
    marginTop: 4,
    marginBottom: 6,
  },
  aboutText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  difficultyPill: {
    alignSelf: "flex-end",
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  difficultyPillText: {
    color: "#fff",
    fontFamily: Fonts.family.medium,
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  videoModal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    width: "100%",
    maxWidth: 600,
    padding: 16,
  },
  videoHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  videoTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 16,
    color: "#1A1A1A",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  videoContainer: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  noVideoContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  noVideoText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    color: "#999",
    marginTop: 12,
  },
  primaryBtn: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: Fonts.family.bold,
  },
});
