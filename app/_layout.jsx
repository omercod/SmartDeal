import React, { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { I18nManager } from "react-native";
import ResultsScreen from "../app/(main)/ResultsScreen";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Import custom header
import Header from "../app/Header"; // Make sure this path is correct

export default function RootLayout() {
  const colorScheme = "dark"; // Force Dark Mode as default

  useEffect(() => {
    SplashScreen.hideAsync();
    I18nManager.forceRTL(true); // Force RTL layout
    I18nManager.allowRTL(true); // Allow RTL
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          header: () => <Header />, // Show the custom header for every screen
          headerShown: true, // Make sure header is shown for each screen
        }}
      >
        {/* Define the screens */}
        <Stack.Screen name="(main)/post2" options={{ title: "Post 2" }} />
        <Stack.Screen
          name="(main)/ResultsScreen"
          options={{ title: "Results" }}
        />
        <Stack.Screen name="(auth)/sign-in" options={{ title: "Sign In" }} />
        <Stack.Screen
          name="(main)/user-page"
          options={{ title: "User Page" }}
        />
        <Stack.Screen name="(auth)/sign-up" options={{ title: "Sign Up" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
        <Stack.Screen name="+not-found" options={{ title: "Not Found" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
