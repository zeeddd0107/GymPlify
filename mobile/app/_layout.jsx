import {
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";

import { ThemeProvider, useTheme, AuthProvider } from "@/src/context";
import { SessionTimeoutWrapper } from "@/src/components/shared/SessionTimeoutWrapper";

function ThemedStatusBar() {
  const { isDarkMode, theme } = useTheme();
  return (
    <StatusBar
      style={isDarkMode ? "light" : "dark"}
      backgroundColor={theme.background}
      translucent={false}
    />
  );
}

function AppContent() {
  const [loaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SessionTimeoutWrapper>
            <NavigationThemeProvider value={DefaultTheme}>
              <Stack>
                <Stack.Screen
                  name="auth/index"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen
                  name="+not-found"
                  options={{ headerShown: false }}
                />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen
                  name="notifications"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="my-qr-code"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="create-session"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="edit-session"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="attendance-history"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="equipment-detail"
                  options={{ headerShown: false }}
                />
                <Stack.Screen
                  name="equipment-info"
                  options={{ headerShown: false }}
                />
              </Stack>
              <ThemedStatusBar />
            </NavigationThemeProvider>
          </SessionTimeoutWrapper>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return <AppContent />;
}
