import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome";
import { auth, db, storage } from "../../(auth)/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function UpdateProfilePicture() {
  const [profileImage, setProfileImage] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const userDocRef = doc(db, "ProfilePictures", user.email);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setProfileImage(userDoc.data().imageUrl);
        }
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, []);

  const pickImage = async (source) => {
    let result;
    if (source === "gallery") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    } else {
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
    }

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      if (!selectedAsset.uri) {
        Alert.alert("שגיאה", "הקובץ שנבחר אינו תקין. נסה שוב.");
        return;
      }

      uploadImage(selectedAsset.uri);
    }
  };

  const uploadImage = async (imageUri) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("שגיאה", "משתמש לא מחובר.");
        return;
      }

      const response = await fetch(imageUri);
      const blob = await response.blob();
      const storageRef = ref(storage, `profile_pictures/${user.uid}.jpg`);
      await uploadBytes(storageRef, blob);

      const downloadURL = await getDownloadURL(storageRef);
      setProfileImage(downloadURL);

      await setDoc(doc(db, "ProfilePictures", user.email), {
        email: user.email,
        imageUrl: downloadURL,
      });

      Alert.alert("הצלחה", "תמונת הפרופיל עודכנה בהצלחה!");
      setModalVisible(false);
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("שגיאה", "אירעה תקלה בהעלאת התמונה.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top + SCREEN_HEIGHT * 0.05 },
      ]}
    >
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <View style={styles.defaultProfile}>
            <Icon name="user" size={SCREEN_WIDTH * 0.15} color="#C6A052" />
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>עדכון תמונת פרופיל</Text>
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.modalImage} />
            ) : (
              <View style={styles.defaultProfile}>
                <Icon name="user" size={SCREEN_WIDTH * 0.2} color="#C6A052" />
              </View>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => pickImage("gallery")}
            >
              <Icon name="image" size={20} color="white" />
              <Text style={styles.buttonText}>בחר מהגלריה</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              onPress={() => pickImage("camera")}
            >
              <Icon name="camera" size={20} color="white" />
              <Text style={styles.buttonText}>צלם תמונה</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="white" />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_WIDTH * 0.35,
    borderRadius: SCREEN_WIDTH * 0.175,
    borderWidth: 2,
    borderColor: "#C6A052",
  },
  defaultProfile: {
    width: SCREEN_WIDTH * 0.35,
    height: SCREEN_WIDTH * 0.35,
    borderRadius: SCREEN_WIDTH * 0.175,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#C6A052",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.85,
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalImage: {
    width: SCREEN_WIDTH * 0.3,
    height: SCREEN_WIDTH * 0.3,
    borderRadius: SCREEN_WIDTH * 0.15,
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
    fontSize: SCREEN_WIDTH * 0.04,
    marginLeft: 10,
  },
  closeButton: {
    marginTop: 15,
  },
  closeButtonText: {
    color: "#C6A052",
    fontSize: SCREEN_WIDTH * 0.04,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
