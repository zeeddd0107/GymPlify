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
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { fetchNotifications } from "@/src/services/dashboardService";
import { firebase } from "@/src/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        const user = firebase.auth().currentUser;
        if (user) {
          const notifs = await fetchNotifications(user.uid);
          setNotifications(notifs);
        }
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, unread: false } : notif,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, unread: false })),
    );
  };

  const unreadCount = notifications.filter((n) => n.unread).length;

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
        {unreadCount > 0 && (
          <Pressable style={styles.markAllButton} onPress={markAllAsRead}>
            <Text style={[styles.markAllText, { color: theme.tint }]}>
              Mark All Read
            </Text>
          </Pressable>
        )}
        {unreadCount === 0 && <View style={styles.headerPlaceholder} />}
      </View>

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <View style={styles.unreadBanner}>
          <Text style={[styles.unreadBannerText, { color: theme.text }]}>
            You have {unreadCount} unread notification
            {unreadCount > 1 ? "s" : ""}
          </Text>
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
                    backgroundColor: notification.unread
                      ? theme.tint + "10"
                      : "transparent",
                  },
                ]}
                onPress={() => markAsRead(notification.id)}
              >
                <View style={styles.notificationHeader}>
                  {notification.unread && <View style={styles.unreadDot} />}
                  <View style={styles.notificationContent}>
                    <Text
                      style={[styles.notificationTitle, { color: theme.text }]}
                    >
                      {notification.title}
                    </Text>
                    <Text
                      style={[styles.notificationTime, { color: theme.icon }]}
                    >
                      {notification.timestamp}
                    </Text>
                  </View>
                </View>
                <Text
                  style={[styles.notificationMessage, { color: theme.icon }]}
                >
                  {notification.message}
                </Text>
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
  markAllButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  markAllText: {
    fontFamily: Fonts.family.medium,
    fontSize: 14,
  },
  headerPlaceholder: {
    width: 40,
  },
  unreadBanner: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 20,
    marginBottom: 10,
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
  notificationMessage: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 20,
  },
});
