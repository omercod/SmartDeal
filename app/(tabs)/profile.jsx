import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Dimensions,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, db } from "../(auth)/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { StatusBar, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT =
  Platform.OS === "ios" ? 44 : StatusBar.currentHeight + 40 || 56;

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userDocRef = doc(db, "Users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUser({
              name: userDoc.data().name || "משתמש חדש",
              email: currentUser.email,
            });
            if (userDoc.data().profileImage) {
              setProfileImage(userDoc.data().profileImage);
            }
          }
        }
      } catch (error) {
        Alert.alert("שגיאה", "לא ניתן לטעון פרטי משתמש.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    auth.signOut().then(() => {
      Alert.alert("התנתקות", "התנתקת בהצלחה!");
      setUser(null);
    });
  };

  const menuOptions = [
    {
      title: "פרסום מודעה",
      icon: "plus-circle",
      action: () => navigation.navigate("post"),
    },
    {
      title: "חשבון עסקי",
      icon: "star",
      action: () => navigation.navigate("(main)/proflieMenu/upgradeToPremium"),
    },
    {
      title: "מודעות שפרסמתי",
      icon: "list",
      action: () => navigation.navigate("MyAds"),
    },
    {
      title: "עדכון פרטים",
      icon: "pencil",
      action: () => navigation.navigate("(main)/proflieMenu/editProfile"),
    },
    {
      title: "צור קשר",
      icon: "envelope",
      action: () => navigation.navigate("(main)/proflieMenu/contact"),
    },
    {
      title: "תקנון",
      icon: "file-text",
      action: () => navigation.navigate("(main)/proflieMenu/termsScreen"),
    },
    {
      title: "מדיניות פרטיות",
      icon: "shield",
      action: () => navigation.navigate("(main)/proflieMenu/privacyPolicy"),
    },
  ];
  if (!user && !isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { paddingTop: insets.top + HEADER_HEIGHT }]}
      >
        {" "}
        <View style={{ marginTop: SCREEN_WIDTH * 0.4, alignItems: "center" }}>
          <Icon name="user-circle" size={SCREEN_WIDTH * 0.25} color="#C6A052" />
          <Text style={[styles.userEmail, { paddingTop: 20 }]}>
            כדי לגשת לפרופיל יש להתחבר
          </Text>
          <TouchableOpacity
            style={styles.buttonLogin}
            onPress={() => navigation.replace("(auth)/sign-in")}
          >
            <Text style={styles.buttonText}>התחברות</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingTop: insets.top + HEADER_HEIGHT,
            paddingBottom: SCREEN_HEIGHT * 0.1,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.profileIconContainer}
        >
          {isUploading ? (
            <ActivityIndicator size="large" color="#C6A052" />
          ) : profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultProfile}>
              <Icon name="user" size={SCREEN_WIDTH * 0.15} color="#C6A052" />
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.userName}>{user?.name}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
          <Text style={styles.buttonText}>התנתקות</Text>
        </TouchableOpacity>

        {menuOptions.map((item) => {
          const isSpecialItem = item.title === "פרסום מודעה";
          const isUpgrade = item.title === "חשבון עסקי";

          return (
            <TouchableOpacity
              key={item.title}
              style={[styles.menuItem, isUpgrade && styles.upgradeHighlight]}
              onPress={item.action}
            >
              <Icon
                name={item.icon}
                size={SCREEN_WIDTH * 0.05}
                style={
                  isUpgrade
                    ? styles.menuIconUpgrade
                    : isSpecialItem
                      ? styles.menuIconSpecial
                      : styles.menuIcon
                }
              />
              <Text
                style={
                  isUpgrade
                    ? styles.menuTextUpgrade
                    : isSpecialItem
                      ? styles.menuTextSpecial
                      : styles.menuText
                }
              >
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  profileIconContainer: {
    alignSelf: "center",
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    borderRadius: SCREEN_WIDTH * 0.15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#C6A052",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: SCREEN_WIDTH * 0.15,
  },
  defaultProfile: {
    width: "100%",
    height: "100%",
    borderRadius: SCREEN_WIDTH * 0.15,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C6A052",
  },
  userName: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    textAlign: "center",
    color: "#333",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: SCREEN_WIDTH * 0.04,
    textAlign: "center",
    color: "#555",
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    elevation: 2,
  },
  menuIcon: {
    marginLeft: 10,
  },
  menuIconSpecial: {
    marginLeft: 10,
    color: "#C6A052",
  },
  menuText: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#333",
    flex: 1,
    textAlign: "right",
  },
  menuTextSpecial: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#C6A052",
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  buttonLogin: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
  },
  buttonLogout: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignSelf: "center",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
  },
  upgradeHighlight: {
    borderColor: "#C6A052",
    borderWidth: 2,
    backgroundColor: "#FFF7E0",
  },
  menuTextUpgrade: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#C6A052",
    fontWeight: "bold",
    flex: 1,
    textAlign: "right",
  },
  menuIconUpgrade: {
    marginLeft: 10,
    color: "#C6A052",
  },
});
