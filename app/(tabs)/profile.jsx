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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, db } from "../(auth)/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { ScrollView } from "react-native";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false); // ⬅️ משתנה לטעינת תמונה
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

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
          }

          // משיכת תמונת פרופיל
          if (userDoc.exists() && userDoc.data().profileImage) {
            setProfileImage(userDoc.data().profileImage);
          }
        }
      } catch (error) {
        console.error("Error fetching user details: ", error);
        Alert.alert("שגיאה", "לא ניתן לטעון פרטי משתמש.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        const user = auth.currentUser;
        if (!user) {
          Alert.alert("שגיאה", "משתמש לא מחובר.");
          return;
        }

        setIsUploading(true); // ⬅️ הפעלת מצב טעינה

        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

        // חישוב גודל התמונה ב-KB (המרת Base64 לגודל בפועל)
        const estimatedSizeKB = (base64Image.length * 3) / 4 / 1024;

        // בדיקת גודל תמונה - אם מעל 900KB, הצגת הודעה
        if (estimatedSizeKB > 900) {
          Alert.alert(
            "שגיאה",
            "התמונה גדולה מדי! יש לבחור תמונה קטנה יותר מ-900KB."
          );
          setIsUploading(false);
          return;
        }

        const userDocRef = doc(db, "Users", user.uid);
        await setDoc(
          userDocRef,
          { profileImage: base64Image },
          { merge: true }
        );

        setProfileImage(base64Image);
        Alert.alert("הצלחה", "תמונת הפרופיל נשמרה בהצלחה!");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("שגיאה", "אירעה תקלה בבחירת התמונה.");
    } finally {
      setIsUploading(false); // ⬅️ כיבוי מצב טעינה
    }
  };

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        Alert.alert("התנתקות", "התנתקת בהצלחה!");
        setUser(null);
      })
      .catch(() => {
        Alert.alert("שגיאה", "אירעה שגיאה בעת הניתוק.");
      });
  };

  const menuOptions = [
    {
      title: "פרסום מודעה",
      icon: "plus-circle",
      action: () => navigation.navigate("post"),
    },
    {
      title: "שדרוג לפרימיום",
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
      <SafeAreaView style={styles.container}>
        <View style={{ marginTop: 180, alignItems: "center" }}>
          <Icon name="user-circle" size={100} color="#C6A052" />
          <Text style={styles.userName}>אינך מחובר</Text>
          <Text style={styles.userEmail}>כדי לגשת לפרופיל יש להתחבר</Text>
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.profileIconContainer}
        >
          {isUploading ? ( // ⬅️ אם התמונה נטענת, מציגים מחוון טעינה במקום התמונה
            <ActivityIndicator size="large" color="#C6A052" />
          ) : profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.defaultProfile}>
              <Icon name="user" size={60} color="#C6A052" />
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
          const isUpgrade = item.title === "שדרוג לפרימיום";

          return (
            <TouchableOpacity
              key={item.title}
              style={[
                styles.menuItem,
                isUpgrade && styles.upgradeHighlight, // מודגש לשדרוג
              ]}
              onPress={item.action}
            >
              <Icon
                name={item.icon}
                size={20}
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

        {/* פופאפ עדכון תמונת פרופיל */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>עדכון תמונת פרופיל</Text>
              {isUploading ? (
                <ActivityIndicator size="large" color="#C6A052" />
              ) : profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={styles.modalImage}
                />
              ) : (
                <Icon name="user" size={80} color="#C6A052" />
              )}

              <TouchableOpacity style={styles.button} onPress={pickImage}>
                <Icon name="image" size={20} color="white" />
                <Text style={styles.buttonText}>בחר מהגלריה</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
    marginTop: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  profileIconContainer: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#C6A052",
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  defaultProfile: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C6A052",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textAlign: "center",
  },
  userEmail: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  menuList: {
    width: "100%",
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuTextSpecial: {
    fontSize: 18,
    color: "#C6A052",
    textAlign: "right",
    flex: 1,
    fontWeight: "bold",
  },
  specialMenuIcon: {
    color: "#C6A052",
  },
  menuIconSpecial: {
    marginLeft: 10,
    color: "#C6A052",
  },
  menuIcon: {
    marginLeft: 10,
  },
  menuText: {
    fontSize: 18,
    color: "#333",
    textAlign: "right",
    flex: 1,
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
    fontSize: 18,
    fontWeight: "bold",
  },
  /* עיצוב פופאפ עדכון תמונת פרופיל */
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    width: "100%",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 15,
  },
  closeButtonText: {
    color: "#C6A052",
    fontSize: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 40,
  },

  upgradeHighlight: {
    borderColor: "#C6A052",
    borderWidth: 2,
    backgroundColor: "#FFF7E0",
  },

  menuTextUpgrade: {
    fontSize: 18,
    color: "#C6A052",
    textAlign: "right",
    flex: 1,
    fontWeight: "bold",
  },

  menuIconUpgrade: {
    marginLeft: 10,
    color: "#C6A052",
  },
});
