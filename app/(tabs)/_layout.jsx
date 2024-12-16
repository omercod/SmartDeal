import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions } from "react-native";

const { width } = Dimensions.get("window"); // Getting the device width

export default function TabLayout() {
  const isTablet = width > 600; // Check if the device is a tablet

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "index") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "search") {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === "post") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "profile") {
            iconName = focused ? "person" : "person-outline";
          }

          const iconSize = focused ? size + 4 : size;

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: "#D4AF37", // Highlight color for active icon
        tabBarInactiveTintColor: "gray", // Inactive icon color
        tabBarLabelStyle: {
          fontFamily: "System",
          fontSize: isTablet ? 14 : 12,
          fontWeight: "500", // Medium weight font for the label text
        },
        tabBarStyle: {
          backgroundColor: "#333", // Same background color as the logo
          paddingBottom: isTablet ? 12 : 10,
          height: isTablet ? 80 : 60,
        },
      })}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: "פרופיל",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="post"
        options={{
          title: "פרסום",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "חיפוש",
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: "בית",
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
