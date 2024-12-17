import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../(auth)/firebase";
import SuccessAnimation from "../../components/SuccessAnimation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const { width } = Dimensions.get("window");

export default function UploadImages({ navigation }) {
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigations = useNavigation();
  const [showSuccess, setShowSuccess] = useState(false);

  const route = useRoute();
  const { mainCategory, subCategory, title, description, price } = route.params;

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("שגיאה", "יש לאפשר גישה לתמונות על מנת להעלות תמונות.");
      }
    })();
  }, []);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const validatePhoneNumber = (text) => {
    const formattedText = text.replace(/[^0-9]/g, "");
    if (formattedText.length > 10) return;
    setPhoneNumber(formattedText);

    if (formattedText.length === 10) {
      setPhoneError("");
    } else {
      setPhoneError("מספר הטלפון חייב להכיל בדיוק 10 ספרות");
    }
  };

  const formatPhoneNumber = (number) => {
    if (number.length <= 3) return number;
    if (number.length <= 6) return `${number.slice(0, 3)}-${number.slice(3)}`;
    return `${number.slice(0, 3)}-${number.slice(3, 6)}${number.slice(6)}`;
  };

  const pickImage = async (setImage, index = null) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"], // ציון ישיר של סוג התמונות
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImageUri = result.assets[0]?.uri; // גישה בטוחה ל-URI
      if (index !== null) {
        const updatedImages = [...additionalImages];
        updatedImages[index] = selectedImageUri;
        setAdditionalImages(updatedImages);
      } else {
        setImage(selectedImageUri);
      }
    }
  };

  const handleAdditionalImage = async () => {
    if (additionalImages.length >= 3) {
      Alert.alert("מקסימום 3 תמונות נוספות.");
      return;
    }
    pickImage((uri) => setAdditionalImages([...additionalImages, uri]));
  };

  const removeImage = (index) => {
    const updatedImages = [...additionalImages];
    updatedImages.splice(index, 1);
    setAdditionalImages(updatedImages);
  };

  const openImage = (uri) => setSelectedImage(uri);

  const handlePublish = async () => {
    // ולידציה למספר הטלפון
    if (phoneNumber.length !== 10) {
      setPhoneError("מספר הטלפון חייב להכיל בדיוק 10 ספרות");
      return; // עצור את הפרסום
    }

    try {
      const postData = {
        mainCategory,
        subCategory,
        title,
        description,
        price,
        phoneNumber: phoneNumber,
        mainImage: mainImage || null,
        additionalImages: additionalImages.length > 0 ? additionalImages : null,
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "Posts"), postData);

      setShowSuccess(true); // הצגת האנימציה של ההצלחה
    } catch (error) {
      console.error("Error publishing post:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בעת פרסום המודעה");
    }
  };

  const onAnimationEnd = () => {
    navigations.navigate("(tabs)"); // מעבר לדף הרצוי
  };

  if (showSuccess) {
    return <SuccessAnimation onAnimationEnd={onAnimationEnd} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>העלאת תמונות</Text>
        <Text style={styles.subtitle}>
          הוספת תמונות יכולה להקל על אנשי מקצוע להבין את השירות שאתם מחפשים.
        </Text>

        {/* תמונה ראשית */}
        <View style={styles.section}>
          <Text style={styles.label}>תמונה ראשית</Text>
          <View style={styles.imagePicker}>
            {mainImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: mainImage }} style={styles.image} />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => pickImage(setMainImage)}
                >
                  <Icon name="pencil" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setMainImage(null)}
                >
                  <Icon name="close-circle" size={24} color="black" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => pickImage(setMainImage)}
              >
                <Icon name="camera-plus" size={50} color="#C6A052" />
                <Text style={styles.uploadText}>העלה תמונה</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* תמונות נוספות */}
        <View style={styles.section}>
          <Text style={styles.label}>תמונות נוספות (ניתן להוסיף עוד 3)</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdditionalImage}
          >
            <Icon name="plus" size={30} color="#C6A052" />
            <Text style={styles.addText}>הוסף תמונה</Text>
          </TouchableOpacity>
          <View style={styles.imageRow}>
            {additionalImages.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <TouchableOpacity onPress={() => openImage(uri)}>
                  <Image source={{ uri }} style={styles.previewImage} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => pickImage(null, index)}
                >
                  <Icon name="pencil" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Icon name="close-circle" size={20} color="black" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.phoneRow}>
          <TextInput
            style={styles.phoneInputInline}
            placeholder="טלפון ליצירת קשר"
            placeholderTextColor="#aaa" // צבע מעודן לפלייסהולדר
            keyboardType="numeric"
            maxLength={12}
            value={formatPhoneNumber(phoneNumber)}
            onChangeText={validatePhoneNumber}
          />
          <Text style={styles.labelInline}>מספר טלפון:</Text>
        </View>
        {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        {/* כפתור פרסום */}
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.buttonText}>פרסם</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* מסך Preview */}
      {selectedImage && (
        <Modal visible transparent>
          <View style={styles.modalContainer}>
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedImage(null)}
            >
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingTop: StatusBar.currentHeight - 40 || 20,
  },
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  section: { width: "90%", alignItems: "center", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  uploadBox: {
    width: width * 0.4,
    height: width * 0.4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  uploadText: { marginTop: 5, color: "#C6A052" },
  imageContainer: { position: "relative", marginBottom: 10 },
  image: { width: 120, height: 120, borderRadius: 8 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  actionButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#C6A052",
    borderRadius: 12,
    padding: 2,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: 10,
  },
  labelInline: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  phoneInputInline: {
    flex: 1,
    height: 45, // גובה גדול ונעים יותר
    borderColor: "#C6A052",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15, // מרווח פנימי נוח יותר
    fontSize: 16, // טקסט קריא ונוח
    backgroundColor: "#fdfdfd", // רקע רך
    textAlign: "right",
    marginLeft: 10,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
  },
  removeButton: { position: "absolute", top: -5, right: -5 },
  addButton: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  addText: { marginLeft: 5, color: "#C6A052" },
  publishButton: {
    backgroundColor: "#C6A052",
    padding: 12,
    borderRadius: 8,
    width: "90%",
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: { position: "absolute", top: 40, right: 20 },
  fullImage: { width: "90%", height: "90%", resizeMode: "contain" },
});
