import React from "react";
import {
  View,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native"; // Importing useColorScheme

const { width } = Dimensions.get("window"); // Getting the device width

const Header = () => {
  const colorScheme = useColorScheme(); // Get the current color scheme (light or dark)

  // Define colors for dark and light mode
  const backgroundColor = colorScheme === "dark" ? "#333" : "#333"; // Keep background as dark gray for both modes
  const iconColor = "white"; // Set icon color to white for both dark and light modes

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View style={styles.headerContainer}>
        {/* Logo on the left */}
        <Image
          source={require("../assets/logo/logo2.png")} // Change path if necessary
          style={styles.logo}
          resizeMode="contain"
        />

        {/* Right Icons (Notifications and Messages) */}
        <View style={styles.rightIcons}>
          {/* Right Icon: Message */}
          <TouchableOpacity style={styles.icon}>
            <Ionicons name="chatbubble-outline" size={24} color={iconColor} />
          </TouchableOpacity>

          {/* Right Icon: Notifications */}
          <TouchableOpacity style={styles.icon}>
            <Ionicons name="notifications-outline" size={24} color={iconColor} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent", // Make the safe area transparent so the background color isn't applied
  },
  headerContainer: {
    position: "absolute", // Fixed position to keep it at the top
    top: 0, // Make sure it's at the very top
    left: 0, 
    right: 0, // Full width
    flexDirection: "row", // Arrange elements horizontally (in a row)
    alignItems: "center", // Vertically center the items in the row
    justifyContent: "space-between", // Space between left logo and right icons
    paddingTop: 30, // Adjust top padding
    paddingHorizontal: 16,
    height: 90, // Height of the header
    width: "100%", // Full width of the header
    backgroundColor: "#333", // Dark gray background for the header
    zIndex: 999, // Ensure it's above other content
  },
  logo: {
    width: 150,
    height: 40, // Dynamically adjust height relative to the width
    alignSelf: "center", // Ensure the logo is centered
  },
  rightIcons: {
    flexDirection: "row", // Align icons in a row
    alignItems: "center", // Vertically center the icons
  },
  icon: {
    marginLeft: 20, // Add space between the icons
  },
});

export default Header;
