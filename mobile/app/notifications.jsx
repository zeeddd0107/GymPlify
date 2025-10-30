import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, useAuth } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { useNotifications } from "@/src/hooks/notifications/useNotifications";
import notificationService from "@/src/services/notificationService";

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { notifications, loading, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // The notifications will auto-update via the real-time listener
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return notificationTime.toLocaleDateString();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "subscription_approved":
        return "checkmark-circle";
      case "subscription_rejected":
        return "close-circle";
      case "subscription_extended":
        return "time";
      case "subscription_request":
        return "document-text";
      case "subscription_expiring_soon":
        return "time-outline";
      case "subscription_expired":
        return "warning";
      default:
        return "notifications";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "subscription_approved":
        return "#10b981"; // Green
      case "subscription_rejected":
        return "#ef4444"; // Red
      case "subscription_extended":
        return "#8b5cf6"; // Purple
      case "subscription_request":
        return "#6366f1"; // Indigo
      case "subscription_expiring_soon":
        return "#f59e0b"; // Orange/Amber
      case "subscription_expired":
        return "#ef4444"; // Red
      default:
        return theme.tint;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Notifications
        </Text>
        {unreadCount > 0 ? (
          <Pressable style={styles.markAllButtonHeader} onPress={handleMarkAllAsRead}>
            <Text style={[styles.markAllText, { color: theme.tint }]}>
              Mark All Read
            </Text>
          </Pressable>
        ) : (
          <View style={styles.headerPlaceholder} />
        )}
      </View>

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadSection}>
          <View style={styles.unreadBanner}>
            <Text style={[styles.unreadBannerText, { color: theme.text }]}>
              You have {unreadCount} unread notification
              {unreadCount > 1 ? "s" : ""}
            </Text>
          </View>
        </View>
      )}

      {/* Notifications Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={24} color={theme.icon} />
            <Text style={[styles.loadingText, { color: theme.icon }]}>
              Loading notifications...
            </Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-outline"
              size={64}
              color={theme.icon}
            />
            <Text style={[styles.emptyStateText, { color: theme.icon }]}>
              No notifications
            </Text>
            <Text style={[styles.emptyStateSubtext, { color: theme.icon }]}>
              You're all caught up!
            </Text>
          </View>
        ) : (
          <View style={styles.notificationsContainer}>
            {notifications.map((notification) => (
              <Pressable
                key={notification.id}
                style={[
                  styles.notificationItem,
                  {
                    borderBottomColor: theme.icon + "20",
                    backgroundColor: !notification.read
                      ? theme.tint + "10"
                      : "transparent",
                  },
                ]}
                onPress={() => handleMarkAsRead(notification.id)}
              >
                <View style={styles.notificationHeader}>
                  {!notification.read && <View style={styles.unreadDot} />}
                  <View
                    style={[
                      styles.notificationIcon,
                      {
                        backgroundColor: getNotificationColor(notification.type) + "20",
                      },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={20}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <Text
                      style={[styles.notificationTitle, { color: theme.text }]}
                    >
                      {notification.title}
                    </Text>
                    <Text
                      style={[styles.notificationTime, { color: theme.icon }]}
                    >
                      {formatTimeAgo(notification.timestamp)}
                    </Text>
                  </View>
                </View>
                <View style={styles.notificationMessageContainer}>
                  <Text
                    style={[styles.notificationMessage, { color: theme.icon }]}
                  >
                    {notification.message}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
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
    position: "relative",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  headerTitle: {
    fontFamily: Fonts.family.bold,
    fontSize: 22,
    position: "absolute",
    left: 0,
    right: 0,
    top: 55,
    textAlign: "center",
    zIndex: 0,
  },
  markAllText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
  },
  markAllButtonHeader: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 1,
  },
  headerPlaceholder: {
    width: 40,
  },
  unreadSection: {
    marginHorizontal: 20,
    marginBottom: 10,
  },
  unreadBanner: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  unreadBannerText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginLeft: 10,
    fontFamily: Fonts.family.medium,
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyStateText: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
    marginTop: 16,
    textAlign: "center",
  },
  emptyStateSubtext: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  notificationsContainer: {
    paddingVertical: 10,
  },
  notificationItem: {
    padding: 16,
    borderBottomWidth: 1,
    marginBottom: 4,
    borderRadius: 8,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
    marginTop: 6,
    marginRight: 8,
    flexShrink: 0,
  },
  notificationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  notificationContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  notificationTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 16,
    flex: 1,
    marginRight: 12,
  },
  notificationTime: {
    fontFamily: Fonts.family.regular,
    fontSize: 12,
    flexShrink: 0,
  },
  notificationMessageContainer: {
    marginLeft: 56, // Align with content (8 + 36 + 12)
  },
  notificationMessage: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    lineHeight: 20,
  },
});
