import React from "react";
import { View, Text, StyleSheet, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import { Fonts } from "@/src/constants/Fonts";

const VideoThumbnail = ({
  videoUrl,
  onPress,
  style,
  showPlayButton = true,
}) => {
  if (!videoUrl) {
    return (
      <View style={[styles.container, styles.noVideoContainer, style]}>
        <Ionicons name="videocam-off" size={32} color="#999" />
        <Text style={styles.noVideoText}>No video available</Text>
      </View>
    );
  }

  return (
    <Pressable
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Video
        source={{ uri: videoUrl }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        isMuted={true}
        isLooping={false}
        useNativeControls={false}
      />

      {/* Play button overlay */}
      {showPlayButton && (
        <View style={styles.playButtonContainer}>
          <View style={styles.playButton}>
            <Ionicons name="play" size={24} color="#fff" />
          </View>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#000",
    marginTop: 8,
    marginBottom: 8,
  },
  video: {
    width: "100%",
    height: "100%",
  },
  playButtonContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  noVideoContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  noVideoText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
});

export default VideoThumbnail;
