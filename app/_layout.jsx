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
import * as Updates from "expo-updates";

SplashScreen.preventAutoHideAsync();

// Import custom header
import Header from "../app/Header";

export default function RootLayout() {
  const colorScheme = "dark";

  useEffect(() => {
    SplashScreen.hideAsync();
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          header: () => <Header />,
          headerShown: true,
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
        {/* Proflie Menu screens */}
        <Stack.Screen
          name="(main)/proflieMenu/termsScreen"
          options={{ title: "Terms Screen" }}
        />
        <Stack.Screen
          name="(main)/proflieMenu/privacyPolicy"
          options={{ title: "Privacy Policy" }}
        />
        <Stack.Screen
          name="(main)/proflieMenu/contact"
          options={{ title: "Contact" }}
        />
        <Stack.Screen
          name="(main)/proflieMenu/editProfile"
          options={{ title: "Edit Profile" }}
        />
        <Stack.Screen
          name="(main)/proflieMenu/my_posts"
          options={{ title: "Edit Profile" }}
        />
        <Stack.Screen
          name="(main)/proflieMenu/premium/upgradeToPremium"
          options={{ title: "upgrade To Premium" }}
        />
        <Stack.Screen
          name="(main)/proflieMenu/premium/PaymentScreen"
          options={{ title: "Payment Screen" }}
        />
        <Stack.Screen
          name="(main)/proflieMenu/premium/BusinessScreen"
          options={{ title: "Business Screen" }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
