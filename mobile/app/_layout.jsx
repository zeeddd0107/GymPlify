import {
  DefaultTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
// import "react-native-reanimated"; // Removed: Causes version conflicts in Expo Go
import { useEffect } from "react";

import { ThemeProvider, AuthProvider } from "@/src/context";
import { SessionTimeoutWrapper } from "@/src/components/shared/SessionTimeoutWrapper";
import AuthGuard from "@/src/components/shared/AuthGuard";
import { pushNotificationService } from "@/src/services";

function AppContent() {
  const router = useRouter();
  const [loaded] = useFonts({
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
  });

  // Set up notification tap handler
  useEffect(() => {
    pushNotificationService.setNotificationTapHandler((data) => {
      console.log("Notification tapped, navigating based on type:", data.type);
      
      // Navigate based on notification type
      switch (data.type) {
        case "subscription_approved":
        case "subscription_rejected":
        case "subscription_extended":
        case "subscription_expiring_soon":
        case "subscription_expired":
          router.push("/subscriptions");
          break;
        case "session_reminder":
          router.push("/(tabs)/sessions");
          break;
        default:
          router.push("/notifications");
      }
    });

    return () => {
      pushNotificationService.removeListeners();
    };
  }, [router]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <SessionTimeoutWrapper>
            <NavigationThemeProvider value={DefaultTheme}>
              {/* AuthGuard decides whether to send user to login or tabs */}
              <AuthGuard>
                <Stack
                  initialRouteName="(tabs)" // default is tabs if logged in
                >
                  <Stack.Screen
                    name="auth/index"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="[...catch-all]"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="profile"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="subscriptions"
                    options={{ headerShown: false }}
                  />
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
                  <Stack.Screen
                    name="otp-verification"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="forgot-password"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="reset-password"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="terms-and-conditions"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="change-password"
                    options={{ headerShown: false }}
                  />
                </Stack>
              </AuthGuard>
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
