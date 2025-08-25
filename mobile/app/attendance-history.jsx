import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/src/context";
import { Fonts } from "@/src/constants/Fonts";
import { firebase } from "@/src/services/firebase";
import { fetchAllAttendanceRecords } from "@/src/services/dashboardService";
import { InfoModal } from "@/src/components/shared";

const formatDateTime = (date) => {
  try {
    return new Date(date).toLocaleString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
};

const formatTime = (date) => {
  try {
    return new Date(date).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return String(date);
  }
};

function AttendanceItem({ item, colors, onPress }) {
  const checkInAt = item.checkInAt || item.checkInTime || item.timestamp;
  const checkOutAt = item.checkOutAt || item.checkOutTime || item.checkoutTime;
  const hasCheckout = !!checkOutAt;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.item, { borderBottomColor: colors.icon + "20" }]}
    >
      <Text style={[styles.timeText, { color: colors.icon }]}>
        {formatTime(hasCheckout ? checkOutAt : checkInAt)}
      </Text>
      <Text style={[styles.itemTitle, { color: colors.text }]}>
        {hasCheckout ? "Check-out" : "Check-in"}
      </Text>
    </Pressable>
  );
}

export default function AttendanceHistoryScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ visible: false, title: "", lines: [] });

  useEffect(() => {
    const load = async () => {
      // removed 'e'
      setLoading(true);
      try {
        const user = firebase.auth().currentUser;
        if (user) {
          const data = await fetchAllAttendanceRecords(user.uid);
          setRecords(data);
        } else {
          setRecords([]);
        }
      } catch {
        console.error("Error loading attendance records");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Attendance History
        </Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.tint} />
          <Text style={[styles.loadingText, { color: theme.icon }]}>
            Loading...
          </Text>
        </View>
      ) : records.length ? (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AttendanceItem
              item={item}
              colors={theme}
              onPress={() => {
                const checkInAt =
                  item.checkInAt || item.checkInTime || item.timestamp;
                const checkOutAt =
                  item.checkOutAt || item.checkOutTime || item.checkoutTime;
                const hasCheckout = !!checkOutAt;
                const title = "Details";
                const lines = [
                  `Check-in: ${formatDateTime(checkInAt)}`,
                  `Check-out: ${hasCheckout ? formatDateTime(checkOutAt) : "—"}`,
                  item.location ? `Location: ${item.location}` : null,
                ].filter(Boolean);
                setModal({ visible: true, title, lines });
              }}
            />
          )}
          contentContainerStyle={styles.list}
        />
      ) : (
        <View style={styles.empty}>
          <Ionicons name="calendar-outline" size={48} color={theme.icon} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No attendance yet
          </Text>
          <Text style={[styles.emptyText, { color: theme.icon }]}>
            Your check-ins will appear here.
          </Text>
        </View>
      )}
      <InfoModal
        visible={modal.visible}
        onClose={() => setModal({ visible: false, title: "", lines: [] })}
        title={modal.title}
        lines={modal.lines}
        colors={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  headerPlaceholder: { width: 40 },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 10, fontFamily: Fonts.family.regular },
  list: { paddingHorizontal: 18, paddingBottom: 24 },
  item: { paddingVertical: 12, borderBottomWidth: 1 },
  timeText: {
    fontFamily: Fonts.family.medium,
    fontSize: 16,
    opacity: 0.8,
    marginBottom: 4,
  },
  itemTitle: { fontFamily: Fonts.family.semiBold, fontSize: 20 },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontFamily: Fonts.family.semiBold,
    fontSize: 18,
    marginTop: 12,
  },
  emptyText: {
    fontFamily: Fonts.family.regular,
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
});
