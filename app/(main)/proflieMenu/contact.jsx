import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../(auth)/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT =
  Platform.OS === "ios" ? 44 : StatusBar.currentHeight + 40 || 56;
export default function ContactScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [subject, setSubject] = useState(null);
  const [customSubject, setCustomSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [subjectOpen, setSubjectOpen] = useState(false);

  const subjects = [
    { label: "בעיה טכנית", value: "בעיה טכנית" },
    { label: "שאלות על מנוי פרימיום", value: "שאלות על מנוי פרימיום" },
    { label: "דיווח על משתמש", value: "דיווח על משתמש" },
    { label: "בקשת פיצ'ר חדש", value: "בקשת פיצ'ר חדש" },
    { label: "אחר", value: "אחר" },
  ];

  const handleSend = async () => {
    const finalSubject = isOtherSelected ? customSubject : subject;

    if (!email.trim() || !finalSubject?.trim() || !message.trim()) {
      Alert.alert("שגיאה", "יש למלא את כל השדות.");
      return;
    }

    try {
      setLoading(true);
      await addDoc(collection(db, "SupportMessages"), {
        email,
        subject: finalSubject,
        message,
        createdAt: serverTimestamp(),
      });

      Alert.alert("הצלחה", "ההודעה נשלחה לצוות התמיכה!");
      setSubject(null);
      setCustomSubject("");
      setMessage("");
      setIsOtherSelected(false);
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("שגיאה", "אירעה תקלה בשליחת ההודעה.");
    } finally {
      setLoading(false);
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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: SCREEN_HEIGHT * 0.2 },
        ]}
      >
        <Text style={styles.header}>צור קשר</Text>

        <TextInput
          style={styles.emailInput}
          placeholder="האימייל שלך"
          value={email}
          editable={false}
        />

        <View style={[styles.inputContainer, { zIndex: 3000 }]}>
          <DropDownPicker
            open={subjectOpen}
            value={subject}
            items={subjects}
            showTickIcon={false}
            setOpen={setSubjectOpen}
            setValue={(value) => {
              setSubject(value);
              setIsOtherSelected(value === "אחר");
            }}
            placeholder="בחרו נושא פנייה"
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownBox}
            placeholderStyle={styles.placeholderStyle}
            labelStyle={styles.labelStyle}
            listMode="SCROLLVIEW"
            textStyle={{ textAlign: "right" }}
            selectedItemContainerStyle={styles.selectedItem}
          />
        </View>

        {isOtherSelected && (
          <TextInput
            style={styles.input}
            placeholder="הקלד נושא מותאם אישית"
            value={customSubject}
            onChangeText={setCustomSubject}
          />
        )}

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="תוכן ההודעה"
          value={message}
          onChangeText={setMessage}
          multiline
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>שלח פנייה</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: SCREEN_WIDTH * 0.05,
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  header: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  emailInput: {
    backgroundColor: "#E0E0E0",
    padding: SCREEN_WIDTH * 0.035,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    fontSize: 16,
    color: "#777",
  },
  input: {
    backgroundColor: "#fff",
    padding: SCREEN_WIDTH * 0.035,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    marginTop: 12,
    height: 120,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#C6A052",
    padding: SCREEN_WIDTH * 0.04,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backButtonContainer: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 50,
    padding: 8,
    elevation: 3,
  },
  dropdown: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  dropdownBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    zIndex: 3000,
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#888",
    textAlign: "right",
  },
  labelStyle: {
    fontSize: 16,
    textAlign: "right",
  },
  selectedItem: {
    backgroundColor: "#E0E0E0",
  },
});
