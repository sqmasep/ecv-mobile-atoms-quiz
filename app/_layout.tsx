import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PaperProvider } from "react-native-paper";
import "react-native-reanimated";

import { AchievementsProvider } from "@/context/achievements";
import { SettingsProvider } from "@/context/settings";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useAuth } from "@/stores/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const queryClient = new QueryClient();
  const { user } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <SettingsProvider>
          <AchievementsProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              {user ? (
                // User is signed in - show app
                <Stack>
                  <Stack.Screen
                    name="(tabs)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="modal"
                    options={{ presentation: "modal", headerShown: false }}
                  />
                  <Stack.Screen
                    name="achievements"
                    options={{
                      headerShown: false,
                      presentation: "fullScreenModal",
                    }}
                  />
                </Stack>
              ) : (
                // User is not signed in - show auth screens
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="auth" />
                </Stack>
              )}
              <StatusBar style="auto" />
            </ThemeProvider>
          </AchievementsProvider>
        </SettingsProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
