import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../(auth)/firebase"; // ייבוא Firebase
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome"; // ייבוא חבילת אייקונים

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        name: currentUser.displayName || "משתמש חדש",
        email: currentUser.email,
      });
    }
  }, []);

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        Alert.alert("התנתקות", "התנתקת בהצלחה!");
        navigation.replace("(tabs)");
      })
      .catch((error) => {
        Alert.alert("שגיאה", "אירעה שגיאה בעת הניתוק.");
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* אייקון פרופיל */}
      <View style={styles.profileIconContainer}>
        <Icon name="user" size={60} color="#C6A052" />
      </View>

      {/* פרטי המשתמש */}
      <Text style={styles.userName}>{user?.name}</Text>
      <Text style={styles.userEmail}>{user?.email}</Text>

      {/* כפתור עדכון פרטים */}
      <TouchableOpacity style={styles.buttonUpdate}>
        <Text style={styles.buttonText}>עדכון פרטים</Text>
      </TouchableOpacity>

      {/* כפתור התנתקות */}
      <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
        <Text style={styles.buttonText}>התנתקות</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  profileIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#C6A052",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  userEmail: {
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  buttonUpdate: {
    backgroundColor: "#C6A052",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonLogout: {
    backgroundColor: "#333",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
