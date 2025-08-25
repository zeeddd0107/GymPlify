import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { HapticTab } from "@/src/components";
import AntDesign from "@expo/vector-icons/AntDesign";
import TabBarBackground from "@/src/components";
import { useTheme } from "@/src/context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Entypo from "@expo/vector-icons/Entypo";

export default function TabLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
            backgroundColor: theme.background,
          },
          default: {
            backgroundColor: theme.background,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Entypo name="home" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: "Learn",
          tabBarIcon: ({ color }) => (
            <AntDesign size={24} name="play" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="sessions"
        options={{
          title: "Sessions",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="event" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
