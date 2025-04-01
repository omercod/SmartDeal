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
        setProfileImage(base64Image);
        setModalVisible(false);
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
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={{ marginTop: 80 }} />
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
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
        confirmMode={alertTitle === "אזהרה"}
        onConfirm={confirmDeleteUser}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  scrollContainer: { padding: 20, paddingBottom: 80 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 10,
    color: "#333",
    textAlign: "right",
  },
  passwordSection: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    backgroundColor: "#fff",
    marginBottom: 25,
  },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  imageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  noImageIcon: {
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
  },
  smallButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: "center",
    marginBottom: 10,
  },
  smallButtonText: {
    color: "#fff",
    fontSize: 15,
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
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    elevation: 2,
    width: "100%",
  },

  arrowIcon: {
    marginLeft: 10,
  },
  deleteButton: {
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 30,
  },
  deleteText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileImageContainer: {
    alignSelf: "center",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#eee",
    borderWidth: 2,
    borderColor: "#C6A052",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
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
  sectionHeader: {
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center", 
  },
  updateImageButton: {
    backgroundColor: "#C6A052",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  updateImageButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
    backgroundColor: "#C6A052",
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
  backButtonContainer: {
    position: "absolute",
    top: 100,
    right: 20,
    zIndex: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 50,
    padding: 8,
    elevation: 3,
  },
});
