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
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { auth, db } from "../../(auth)/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function ContactScreen() {
  const navigation = useNavigation();
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
    <SafeAreaView style={styles.container}>
      {/* חץ חזור */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>צור קשר</Text>

      <TextInput
        style={styles.emailInput}
        placeholder="האימייל שלך"
        value={email}
        editable={false}
      />

      {/* תפריט בחירה לנושא */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  emailInput: {
    backgroundColor: "#E0E0E0",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    fontSize: 16,
    color: "#777",
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
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
    padding: 14,
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
    top: 100,
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
