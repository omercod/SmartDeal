import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "../(auth)/firebase"; // ייבוא Firebase
import { useNavigation } from "@react-navigation/native";
import { db } from "../(auth)/firebase"; // ייבוא ה-DB
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null); // התמונה שמוצגת בפרופיל
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser({
        name: currentUser.displayName || "משתמש חדש",
        email: currentUser.email,
      });

      // שליפת התמונה הראשית מהפוסט האחרון של המשתמש
      const fetchMainImage = async () => {
        try {
          const postsRef = collection(db, "Posts");
          const q = query(
            postsRef,
            where("userEmail", "==", currentUser.email),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const postData = querySnapshot.docs[0].data();
            setProfileImage(
              postData.mainImage || "https://via.placeholder.com/150"
            );
          } else {
            setProfileImage("https://via.placeholder.com/150"); // Default image
          }
        } catch (error) {
          console.error("Error fetching main image:", error);
          if (error.message.includes("index")) {
            Alert.alert(
              "שגיאה ביצירת אינדקס",
              "עליך ליצור אינדקס מתאים ב-Firestore עבור שאילתה זו. אנא לחץ על הקישור שסופק בלוגים."
            );
          } else {
            setProfileImage("https://via.placeholder.com/150"); // Default image on other errors
          }
        }
      };

      fetchMainImage();
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
      {/* תמונת פרופיל */}
      <Image source={{ uri: profileImage }} style={styles.profileImage} />

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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#C6A052",
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
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    width: "80%",
    alignItems: "center",
  },
  buttonLogout: {
    backgroundColor: "#C62828",
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
