// כל האימפורטים נשארו זהים
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { getAuth } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../../../(auth)/firebase";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CustomAlert from "../../../../components/CustomAlert";
import { israeliCities } from "../../../../constants/data";
import { deleteDoc } from "firebase/firestore";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = Platform.OS === "ios" ? 80 : 70;

export default function BusinessScreen() {
  const [banner, setBanner] = useState(null);
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const scrollRef = useRef(null);

  const [query, setQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [cityError, setCityError] = useState(false);

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return;

        const businessRef = doc(db, "BusinessUsers", user.email);
        const docSnap = await getDoc(businessRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setBusinessName(data.businessName || "");
          setDescription(data.description || "");
          setQuery(data.location || "");
          setSelectedCity(data.location || "");
          setPhoneNumber(data.phoneNumber || "");
          if (data.bannerImage) {
            setBanner({ uri: data.bannerImage });
          }
        }
      } catch (error) {
        console.error("שגיאה בטעינת פרטי עסק:", error);
      }
    };

    fetchBusinessData();
  }, []);

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

  const handlePhoneChange = (text) => {
    const onlyDigits = text.replace(/\D/g, "").slice(0, 10);
    let formatted = onlyDigits;
    if (onlyDigits.length > 3) {
      formatted = `${onlyDigits.slice(0, 3)}-${onlyDigits.slice(3)}`;
    }

    setPhoneNumber(formatted);
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setQuery(city);
    setFilteredCities([]);
    setCityError(false);
  };

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setBanner(result.assets[0]);
    }
  };

  const saveBusinessDetails = async () => {
    try {
      if (
        !businessName ||
        !selectedCity ||
        !description ||
        !banner ||
        !phoneNumber
      ) {
        showAlert("שגיאה", "נא למלא את כל השדות ולהעלות באנר.");
        return;
      }

      // בדיקת תקינות טלפון
      const cleanedPhone = phoneNumber.replace(/\D/g, ""); // הסרת מקפים
      if (cleanedPhone.length !== 10 || !cleanedPhone.startsWith("05")) {
        showAlert("שגיאה", "מספר טלפון לא תקני.");
        return;
      }

      setIsUploading(true);
      const user = getAuth().currentUser;
      if (!user) return;

      let base64Image = null;
      if (banner?.base64) {
        base64Image = `data:image/jpeg;base64,${banner.base64}`;
        const estimatedSizeKB = (base64Image.length * 3) / 4 / 1024;
        if (estimatedSizeKB > 900) {
          showAlert("שגיאה", "התמונה גדולה מדי! אנא בחר תמונה קלה יותר.");
          return;
        }
      }

      const businessRef = doc(db, "BusinessUsers", user.email);
      await updateDoc(businessRef, {
        email: user.email,
        businessName,
        location: selectedCity,
        description,
        ...(base64Image && { bannerImage: base64Image }),
        phoneNumber,
      });

      showAlert("בוצע בהצלחה", "הפרטים העסקיים שלך נשמרו בהצלחה!");
    } catch (error) {
      console.error("Error saving business info:", error);
      showAlert("שגיאה", "אירעה שגיאה בעת שמירת הנתונים.");
    } finally {
      setIsUploading(false);
    }
  };

  const deleteBusinessAccount = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) return;

      const businessRef = doc(db, "BusinessUsers", user.email);
      await deleteDoc(businessRef);

      showAlert("החשבון נמחק", "החשבון העסקי שלך נמחק בהצלחה.");
      navigation.goBack(); 
    } catch (error) {
      console.error("שגיאה במחיקת החשבון העסקי:", error);
      showAlert("שגיאה", "אירעה שגיאה בעת מחיקת החשבון.");
    }
  };
  

  return (
    <SafeAreaView
      style={[styles.container, { paddingTop: insets.top + HEADER_HEIGHT }]}
    >
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
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.header}>חשבון עסקי</Text>

            <TouchableOpacity style={styles.bannerBox} onPress={pickImage}>
              {banner ? (
                <Image
                  source={{ uri: banner.uri }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderBox}>
                  <Icon name="image-plus" size={50} color="#C6A052" />
                  <Text style={styles.placeholderText}>העלה באנר</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* שם העסק */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>שם העסק</Text>
              <TextInput
                placeholder="שם העסק"
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
              />
            </View>

            {/* מיקום */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>מיקום</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="מיקום של העסק"
                  value={query}
                  onChangeText={handleCitySearch}
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 200);
                  }}
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
            </View>

            {/* תיאור העסק */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>תיאור העסק</Text>
              <TextInput
                placeholder="תיאור העסק"
                style={[
                  styles.input,
                  { height: 100, textAlignVertical: "top" },
                ]}
                multiline
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* טלפון */}
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>טלפון</Text>
              <TextInput
                style={[styles.input]}
                placeholder="050-1234567"
                keyboardType="numeric"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                maxLength={11}
              />
            </View>

            {/* כפתור */}
            <TouchableOpacity
              onPress={saveBusinessDetails}
              style={[styles.saveButton, isUploading && { opacity: 0.6 }]}
              disabled={isUploading}
            >
              <Text style={styles.saveButtonText}>
                {isUploading ? "שומר..." : "שמור פרטים"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setConfirmDeleteVisible(true)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>ביטול חשבון עסקי</Text>
            </TouchableOpacity>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={() => setAlertVisible(false)}
      />
      <CustomAlert
        visible={confirmDeleteVisible}
        title="האם אתה בטוח?"
        message="פעולה זו תמחק את כל פרטי החשבון העסקי שלך."
        onClose={() => setConfirmDeleteVisible(false)}
        confirmMode
        onConfirm={() => {
          setConfirmDeleteVisible(false);
          deleteBusinessAccount();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff8f0" },
  scrollContainer: {
    paddingHorizontal: SCREEN_WIDTH * 0.06,
    paddingBottom: SCREEN_HEIGHT * 0.1,
    alignItems: "center",
  },
  header: {
    fontSize: SCREEN_WIDTH * 0.08,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#C6A052",
  },
  deleteButton: {
    backgroundColor: "#333",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: SCREEN_WIDTH * 0.045,
  },
  bannerBox: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.25,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#C6A052",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 20,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  placeholderBox: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#C6A052",
    fontSize: SCREEN_WIDTH * 0.045,
    marginTop: 10,
    fontWeight: "600",
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#333",
  },
  phoneInput: {
    textAlign: "right",
  },
  inputRow: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 5,
  },
  label: {
    fontSize: SCREEN_WIDTH * 0.045,
    marginRight: 10,
    marginTop: 12,
    color: "#333",
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
    zIndex: 10,
  },
  inputFieldCity: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 12,
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#333",
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    elevation: 4,
    marginTop: 5,
    width: "100%",
    zIndex: 20,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: SCREEN_WIDTH * 0.045,
    textAlign: "right",
    writingDirection: "rtl",
  },
  errorText: {
    color: "red",
    fontSize: SCREEN_WIDTH * 0.04,
    alignSelf: "flex-end",
    marginBottom: 10,
    marginTop: -5,
  },
  saveButton: {
    backgroundColor: "#C6A052",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: SCREEN_WIDTH * 0.045,
  },
  backButtonContainer: {
    position: "absolute",
    right: SCREEN_WIDTH * 0.05,
    zIndex: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 50,
    padding: 8,
    elevation: 3,
  },
  inputBlock: {
    width: "100%",
  },

  inputLabel: {
    fontSize: SCREEN_WIDTH * 0.038,
    color: "#555",
    marginBottom: 5,
    textAlign: "right",
    writingDirection: "rtl",
  },
});
