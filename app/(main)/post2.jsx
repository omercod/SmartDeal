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
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { db } from "../(auth)/firebase";
import SuccessAnimation from "../../components/SuccessAnimation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { israeliCities } from "../../constants/data";
const { width, height } = Dimensions.get("window");
import { auth } from "../(auth)/firebase";

export default function UploadImages({ navigation }) {
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigations = useNavigation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [query, setQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [showPhoneError, setShowPhoneError] = useState(false);
  const [cityError, setCityError] = useState(false);

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

  const validatePhoneNumber = (text) => {
    const formattedText = text.replace(/[^0-9]/g, "").slice(0, 10);

    let formatted = formattedText;
    if (formattedText.length > 3) {
      formatted = `${formattedText.slice(0, 3)}-${formattedText.slice(3)}`;
    }

    setPhoneNumber(formatted);
    if (formattedText.length === 10) setPhoneError(false);
  };

  const handleCitySearch = (text) => {
    setQuery(text);

    if (!text.trim()) {
      setSelectedCity("");
      setCityError(true);
    } else {
      setCityError(false);
    }

    if (text.length > 0) {
      const filtered = israeliCities.filter((city) =>
        city.includes(text.trim())
      );
      setFilteredCities(filtered.slice(0, 5));
    } else {
      setFilteredCities([]);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setQuery(city);
    setFilteredCities([]);
    setCityError(false);
  };

  const pickImage = async (setImage, index = null) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (index !== null) {
        const updatedImages = [...additionalImages];
        updatedImages[index] = base64Image;
        setAdditionalImages(updatedImages);
      } else {
        setImage(base64Image);
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
    if (!selectedCity.trim()) {
      setCityError(true);
    }

    if (phoneNumber.length !== 11) {
      setShowPhoneError(true);
      setPhoneError(true);
    }

    if (!selectedCity.trim() || phoneNumber.length !== 11) {
      return;
    }

    try {
      const user = auth.currentUser;
      const userEmail = user ? user.email : "משתמש אנונימי";

      const postData = {
        mainCategory,
        subCategory,
        title,
        description,
        price,
        phoneNumber: phoneNumber,
        city: selectedCity,
        mainImage: mainImage,
        additionalImages: additionalImages,
        createdAt: serverTimestamp(),
        userEmail,
      };

      await addDoc(collection(db, "Posts"), postData);
      setShowSuccess(true);
    } catch (error) {
      console.error("Error publishing post:", error);
      Alert.alert("שגיאה", "אירעה שגיאה בעת פרסום המודעה");
    }
  };

  if (showSuccess) {
    return (
      <SuccessAnimation
        message="המודעה פורסמה בהצלחה!"
        onAnimationEnd={() => navigations.navigate("(tabs)")}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => navigations.goBack()}>
          <Icon name="arrow-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>מידע נוסף</Text>
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
                  <Icon name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => pickImage(setMainImage)}
              >
                <Icon name="camera-plus" size={50} color="#C6A052" />
                <Text style={styles.uploadText}>העלאת תמונה</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* תמונות נוספות */}
        <View style={styles.section}>
          <Text style={styles.label}>תמונות נוספות</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAdditionalImage}
          >
            <Icon name="plus" size={30} color="#C6A052" />
            <Text style={styles.addText}>הוספת תמונה</Text>
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
                  <Icon name="pencil" size={15} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Icon name="close-circle" size={20} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* ישוב */}
        <View style={styles.inputRow}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.inputFieldCity}
              placeholder="הקלד את שם הישוב"
              value={query}
              onChangeText={handleCitySearch}
            />
            {filteredCities.length > 0 && (
              <View style={styles.suggestionsContainer}>
                {filteredCities.map((city, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionItem}
                    onPress={() => handleCitySelect(city)}
                  >
                    <Text style={styles.suggestionText}>{city}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          <Text style={styles.label}>ישוב:</Text>
        </View>

        {/* טלפון */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.inputFieldPhone}
            placeholder="הכנס מספר טלפון"
            keyboardType="numeric"
            maxLength={11}
            value={phoneNumber}
            onChangeText={validatePhoneNumber}
          />
          <Text style={styles.label}>טלפון:</Text>
        </View>
        {/* הודעות שגיאה */}
        <View style={styles.errorContainer}>
          {cityError && (
            <Text style={styles.errorText}>יישוב הוא שדה חובה</Text>
          )}
          {showPhoneError && phoneError && (
            <Text style={styles.errorText}>
              מספר הטלפון חייב להכיל בדיוק 10 ספרות
            </Text>
          )}
        </View>

        {/* כפתור פרסום */}
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.buttonText}>פרסום</Text>
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
    paddingTop: StatusBar.currentHeight || 20,
  },
  scrollContainer: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: height * 0.2,
    marginTop: height * 0.1,
  },
  header: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.02,
  },
  subtitle: {
    fontSize: width * 0.04,
    color: "#555",
    textAlign: "center",
    marginBottom: height * 0.03,
    paddingHorizontal: width * 0.05,
  },
  section: {
    width: "100%",
    alignItems: "center",
    marginBottom: height * 0.03,
    minHeight: height * 0.1,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: width * 0.04,
    fontWeight: "bold",
    marginRight: width * 0.03,
    textAlign: "right",
    color: "#333",
  },
  inputFieldPhone: {
    flex: 1,
    height: height * 0.06,
    borderColor: "#C6A052",
    borderWidth: 1,
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.03,
    fontSize: width * 0.04,
    backgroundColor: "#fdfdfd",
    textAlign: "right",
    marginRight: width * 0.025,
  },
  inputFieldCity: {
    flex: 1,
    height: height * 0.06,
    borderColor: "#C6A052",
    borderWidth: 1,
    borderRadius: width * 0.02,
    paddingHorizontal: width * 0.03,
    fontSize: width * 0.04,
    backgroundColor: "#fdfdfd",
    textAlign: "right",
    marginRight: width * 0.05,
  },
  uploadBox: {
    width: width * 0.4,
    height: width * 0.4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: width * 0.02,
  },
  uploadText: {
    marginTop: height * 0.01,
    color: "#C6A052",
    fontSize: width * 0.04,
  },
  imageContainer: { position: "relative", marginBottom: height * 0.02 },
  image: {
    width: width * 0.3,
    height: width * 0.3,
    borderRadius: width * 0.02,
  },
  previewImage: {
    width: width * 0.2,
    height: width * 0.2,
    borderRadius: width * 0.02,
    margin: width * 0.02,
  },
  imageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  actionButton: {
    position: "absolute",
    bottom: -5,
    right: -5,
    backgroundColor: "#C6A052",
    borderRadius: 12,
    padding: 2,
  },
  errorText: {
    color: "red",
    fontSize: width * 0.03,
    marginTop: height * 0.005,
    textAlign: "right",
  },
  errorContainer: {
    marginTop: -height * 0.01,
    marginBottom: height * 0.01,
    paddingHorizontal: width * 0.04,
    marginRight: width * 0.05,
  },
  removeButton: { position: "absolute", top: -5, right: -5 },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  addText: { marginLeft: 5, color: "#C6A052" },
  publishButton: {
    backgroundColor: "#C6A052",
    padding: height * 0.015,
    borderRadius: width * 0.02,
    width: "90%",
    alignItems: "center",
    marginTop: height * 0.05,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: width * 0.04,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseButton: { position: "absolute", top: 40, right: 20 },
  fullImage: { width: "90%", height: "90%", resizeMode: "contain" },
  inputWrapper: {
    flex: 1,
    position: "relative",
  },
  suggestionsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderColor: "#C6A052",
    borderWidth: 1,
    borderRadius: 8,
    elevation: 4,
    zIndex: 10,
    maxHeight: 150,
    overflow: "hidden",
    marginRight: 18,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "right",
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
