import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  ScrollView,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../(auth)/firebase";
import CustomAlert from "../../../components/CustomAlert";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EditProfileScreen() {
  const navigation = useNavigation();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertTitle, setAlertTitle] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const user = auth.currentUser;
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 70;

  useEffect(() => {
    const fetchProfileImage = async () => {
      if (user) {
        const userDoc = await getDoc(doc(db, "Users", user.uid));
        const image = userDoc?.data()?.profileImage;

        if (image) {
          setIsImageLoading(true);
          setProfileImage(image);
        }
      }
    };
    fetchProfileImage();
  }, []);

  const handlePasswordUpdate = async () => {
    if (!validatePassword(newPassword, confirmPassword)) {
      return;
    }
    try {
      setLoading(true);
      const credentials = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credentials);
      await updatePassword(user, newPassword);

      const hashedPassword = require("crypto-js")
        .SHA256(newPassword)
        .toString();
      await setDoc(
        doc(db, "Users", user.uid),
        { password: hashedPassword },
        { merge: true }
      );

      Alert.alert("הצלחה", "הסיסמה עודכנה בהצלחה!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password update error:", error);
      Alert.alert("שגיאה", "עדכון הסיסמה נכשל. ודא שהסיסמה תקינה והינך מחובר");
    } finally {
      setLoading(false);
    }
  };
  const validatePassword = (password, confirmPassword) => {
    if (!password || password.length < 8) {
      setAlertTitle("שגיאה");
      setAlertMessage(
        "הסיסמה חייבת להכיל לפחות אות גדולה אחת, לפחות סימן מיוחד אחד, ואורך מינימלי של 8 תווים."
      );
      setAlertVisible(true);
      return false;
    }
    if (!/[A-Z]/.test(password)) {
      setAlertTitle("שגיאה");
      setAlertMessage("הסיסמה חייבת להכיל לפחות אות גדולה אחת.");
      setAlertVisible(true);
      return false;
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      setAlertTitle("שגיאה");
      setAlertMessage("הסיסמה חייבת להכיל לפחות סימן מיוחד אחד.");
      setAlertVisible(true);
      return false;
    }
    if (password !== confirmPassword) {
      setAlertTitle("שגיאה");
      setAlertMessage("הסיסמאות אינן תואמות");
      setAlertVisible(true);
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled) {
        setIsUploading(true);
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;

        const estimatedSizeKB = (base64Image.length * 3) / 4 / 1024;
        if (estimatedSizeKB > 900) {
          Alert.alert("שגיאה", "התמונה גדולה מדי!");
          setIsUploading(false);
          return;
        }

        await setDoc(
          doc(db, "Users", user.uid),
          { profileImage: base64Image },
          { merge: true }
        );

        // עדכון מצב טעינה חדש
        setIsImageLoading(true);
        setProfileImage(base64Image); // נעדכן קודם את התמונה
        setModalVisible(false); // נסגור את המודל מיד

        // נשהה מעט כדי לאפשר ל-image לעלות ברקע ואז נבטל את הטעינה
        setTimeout(() => {
          setIsImageLoading(false);
        }, 300); // 300 מ״ש – מספיק בדרך כלל
        Alert.alert("הצלחה", "תמונת הפרופיל עודכנה");
      }
    } catch (error) {
      Alert.alert("שגיאה", "שגיאה בבחירת תמונה");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteUser = () => {
    setAlertTitle("אזהרה");
    setAlertMessage("האם אתה בטוח שברצונך למחוק את המשתמש?");
    setAlertVisible(true);
  };

  const confirmDeleteUser = async () => {
    try {
      setLoading(true);

      const postsQuery = query(
        collection(db, "Posts"),
        where("userEmail", "==", user.email)
      );
      const postDocs = await getDocs(postsQuery);
      const deletePromises = postDocs.docs.map((docSnap) =>
        deleteDoc(doc(db, "Posts", docSnap.id))
      );
      await Promise.all(deletePromises);
      await deleteDoc(doc(db, "Users", user.uid));
      await user.delete();

      setAlertVisible(false);
      navigation.replace("(auth)/sign-in");
    } catch (err) {
      setAlertTitle("שגיאה");
      setAlertMessage("מחיקת המשתמש נכשלה");
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* חץ חזור */}
      <View
        style={[
          styles.backButtonContainer,
          { top: insets.top + HEADER_HEIGHT + 10 },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          {
            paddingBottom: SCREEN_HEIGHT * 0.1,
            paddingTop: insets.top + HEADER_HEIGHT,
          },
        ]}
      >
        <Text style={styles.title}>עדכון פרטים</Text>

        {/* כפתור תמונת פרופיל */}
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={() => setModalVisible(true)}
        >
          <View style={styles.imageWrapper}>
            {profileImage ? (
              <>
                {isImageLoading && (
                  <ActivityIndicator size="large" color="#C6A052" />
                )}
                <Image
                  source={{ uri: profileImage }}
                  style={[
                    styles.profileImage,
                    { display: isImageLoading ? "none" : "flex" },
                  ]}
                  onLoadStart={() => setIsImageLoading(true)}
                  onLoadEnd={() => setIsImageLoading(false)}
                />
              </>
            ) : (
              <ActivityIndicator size="large" color="#C6A052" />
            )}
          </View>
        </TouchableOpacity>

        {/* שינוי סיסמה */}
        <TouchableOpacity
          style={styles.passwordHeader}
          onPress={() => setShowPasswordSection(!showPasswordSection)}
        >
          <Text style={styles.sectionHeader}>שינוי סיסמה</Text>
          <Icon
            name={showPasswordSection ? "chevron-up" : "chevron-down"}
            size={22}
            color="#333"
            style={styles.arrowIcon}
          />
        </TouchableOpacity>

        {showPasswordSection && (
          <View style={styles.passwordSection}>
            {/* סיסמה נוכחית */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="הזן סיסמה נוכחית"
                placeholderTextColor="#aaa"
                secureTextEntry={!showCurrentPassword}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Icon
                  name={showCurrentPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#C6A052"
                />
              </TouchableOpacity>
            </View>

            {/* סיסמה חדשה */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="סיסמה חדשה"
                placeholderTextColor="#aaa"
                secureTextEntry={!showNewPassword}
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon
                  name={showNewPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#C6A052"
                />
              </TouchableOpacity>
            </View>

            {/* אימות סיסמה */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="אימות סיסמה"
                placeholderTextColor="#aaa"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#C6A052"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.smallButton}
              onPress={handlePasswordUpdate}
              disabled={loading}
            >
              <Text style={styles.smallButtonText}>עדכן סיסמה</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={styles.updateImageButton}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.updateImageButtonText}>עדכון תמונת פרופיל</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteUser}
          disabled={loading}
        >
          <Text style={styles.deleteText}>מחיקת משתמש</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* מודל עדכון תמונה */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>עדכון תמונת פרופיל</Text>
            {profileImage && (
              <Image source={{ uri: profileImage }} style={styles.modalImage} />
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

      <CustomAlert
        visible={alertVisible}
        title={"מחיקת משתמש"}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        confirmMode={alertTitle === "אזהרה"}
        onConfirm={confirmDeleteUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    padding: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  input: {
    flex: 1,
    fontSize: SCREEN_WIDTH * 0.04,
    padding: SCREEN_WIDTH * 0.03,
    color: "#333",
    textAlign: "right",
  },
  passwordSection: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: SCREEN_WIDTH * 0.04,
    backgroundColor: "#fff",
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_HEIGHT * 0.01,
  },
  smallButton: {
    backgroundColor: "#333",
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  smallButtonText: {
    color: "#fff",
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
  },
  passwordHeader: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    paddingVertical: SCREEN_HEIGHT * 0.018,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    marginBottom: SCREEN_HEIGHT * 0.015,
    elevation: 2,
    width: "100%",
  },
  arrowIcon: {
    marginLeft: SCREEN_WIDTH * 0.025,
  },
  deleteButton: {
    backgroundColor: "#000",
    padding: SCREEN_HEIGHT * 0.018,
    borderRadius: 8,
    alignItems: "center",
    marginTop: SCREEN_HEIGHT * 0.04,
  },
  deleteText: {
    color: "white",
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
  },
  profileImageContainer: {
    alignSelf: "center",
    width: SCREEN_WIDTH * 0.32,
    height: SCREEN_WIDTH * 0.32,
    borderRadius: SCREEN_WIDTH * 0.16,
    backgroundColor: "#eee",
    borderWidth: 2,
    borderColor: "#C6A052",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: SCREEN_WIDTH * 0.16,
  },
  imageWrapper: {
    width: SCREEN_WIDTH * 0.32,
    height: SCREEN_WIDTH * 0.32,
    borderRadius: SCREEN_WIDTH * 0.16,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.85,
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  sectionHeader: {
    flex: 1,
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  updateImageButton: {
    backgroundColor: "#C6A052",
    padding: SCREEN_HEIGHT * 0.018,
    borderRadius: 8,
    alignItems: "center",
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  updateImageButtonText: {
    color: "#fff",
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  modalImage: {
    width: SCREEN_WIDTH * 0.28,
    height: SCREEN_WIDTH * 0.28,
    borderRadius: SCREEN_WIDTH * 0.14,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#C6A052",
    padding: SCREEN_HEIGHT * 0.015,
    borderRadius: 8,
    marginTop: SCREEN_HEIGHT * 0.015,
    width: "100%",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: SCREEN_WIDTH * 0.04,
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  closeButton: {
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  closeButtonText: {
    color: "#C6A052",
    fontSize: SCREEN_WIDTH * 0.04,
  },
  backButtonContainer: {
    position: "absolute",
    top: 90,
    right: 20,
    zIndex: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 50,
    padding: 8,
    elevation: 3,
  },
});
