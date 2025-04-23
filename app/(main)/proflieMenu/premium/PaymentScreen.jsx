import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Image,
  ScrollView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import CustomAlert from "../../../../components/CustomAlert";
import { getAuth } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../(auth)/firebase";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = Platform.OS === "ios" ? 80 : 70;

export default function PaymentScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleSuccessfulPayment = async () => {
    try {
      const user = getAuth().currentUser;
      if (!user) {
        showAlert("שגיאה", "לא נמצאה התחברות משתמש");
        return;
      }

      const userRef = doc(db, "Users", user.uid);
      await updateDoc(userRef, { isPrime: true });

      navigation.navigate("(main)/proflieMenu/premium/BusinessScreen");
    } catch (error) {
      showAlert("שגיאה", "אירעה שגיאה בעת עדכון החשבון העסקי.");
    }
  };

  const handlePayment = () => {
    const cardRegex = /^\d{4} \d{4} \d{4} \d{4}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/(\d{2})$/;
    const cvvRegex = /^\d{3}$/;
    const [month, year] = expiry.split("/");
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = parseInt(now.getFullYear().toString().slice(2));

    const inputMonth = parseInt(month);
    const inputYear = parseInt(year);

    if (!cardRegex.test(cardNumber)) {
      showAlert("שגיאה", "מספר כרטיס לא תקין");
      return;
    }

    if (cardHolder?.trim() === "") {
      showAlert("שגיאה", "נא להזין את שם בעל הכרטיס");
      return;
    }

    if (
      inputYear < currentYear ||
      (inputYear === currentYear && inputMonth < currentMonth)
    ) {
      showAlert("שגיאה", "תוקף הכרטיס פג");
      return;
    }

    if (!expiryRegex.test(expiry)) {
      showAlert("שגיאה", "תוקף הכרטיס לא תקין");
      return;
    }

    if (!cvvRegex.test(cvv)) {
      showAlert("שגיאה", "CVV לא תקין");
      return;
    }

    handleSuccessfulPayment(); // ✅ עדכון ב-DB וניווט
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s+/g, "").replace(/[^0-9]/g, "");
    const trimmed = cleaned.slice(0, 16);
    const groups = trimmed.match(/.{1,4}/g);
    return groups ? groups.join(" ") : "";
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/[^\d]/g, "");
    if (cleaned.length === 0) return "";
    if (cleaned.length <= 2) return cleaned;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top + HEADER_HEIGHT + SCREEN_HEIGHT * 0.03 },
      ]}
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

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomAlert
          visible={alertVisible}
          title={alertTitle}
          message={alertMessage}
          onClose={() => {
            setAlertVisible(false);
            if (alertTitle === "הצלחה") navigation.goBack();
          }}
        />

        <Text style={styles.header}>שדרוג לחשבון עסקי</Text>
        <Text style={styles.subHeader}>הזן פרטי אשראי</Text>

        <TouchableOpacity style={styles.cardContainer} activeOpacity={1}>
          <View style={styles.card}>
            <Image
              source={{
                uri: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Credit_card_font_awesome.svg/512px-Credit_card_font_awesome.svg.png",
              }}
              style={styles.logo}
            />
            <Text style={styles.cardLabel}>Card Number</Text>
            <TextInput
              style={styles.cardNumber}
              keyboardType="numeric"
              placeholder="1234 1234 1234 1234"
              placeholderTextColor="#666"
              value={cardNumber}
              onChangeText={(text) => setCardNumber(formatCardNumber(text))}
              maxLength={19}
            />
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardLabel}>Card Holder</Text>
                <TextInput
                  style={[styles.cardDetail, { width: SCREEN_WIDTH * 0.35 }]}
                  placeholder="Israel Israeli"
                  placeholderTextColor="#666"
                  value={cardHolder}
                  onChangeText={setCardHolder}
                  maxLength={20}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>Exp. Date</Text>
                <TextInput
                  style={styles.cardDetail}
                  placeholder="MM/YY"
                  placeholderTextColor="#666"
                  value={expiry}
                  onChangeText={(text) => setExpiry(formatExpiry(text))}
                  maxLength={5}
                  keyboardType="numeric"
                />
              </View>
              <View>
                <Text style={styles.cardLabel}>CVV</Text>
                <TextInput
                  style={styles.cardDetail}
                  placeholder="123"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                  value={cvv}
                  onChangeText={setCvv}
                  maxLength={3}
                />
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.payButton} onPress={handlePayment}>
          <Text style={styles.payButtonText}>לתשלום ₪29.90 לחודש</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  cardContainer: {
    alignItems: "center",
    marginBottom: SCREEN_HEIGHT * 0.03,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: SCREEN_WIDTH * 0.05,
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    width: SCREEN_WIDTH * 0.12,
    height: SCREEN_HEIGHT * 0.035,
    resizeMode: "contain",
    alignSelf: "flex-start",
  },
  cardLabel: {
    color: "#999",
    fontSize: SCREEN_WIDTH * 0.03,
  },
  cardNumber: {
    color: "#000",
    fontSize: SCREEN_WIDTH * 0.055,
    letterSpacing: 2,
    marginVertical: SCREEN_HEIGHT * 0.01,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: SCREEN_HEIGHT * 0.01,
  },
  cardDetail: {
    color: "#000",
    fontSize: SCREEN_WIDTH * 0.04,
    marginTop: SCREEN_HEIGHT * 0.005,
    minWidth: SCREEN_WIDTH * 0.2,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 2,
  },
  payButton: {
    backgroundColor: "#C6A052",
    paddingVertical: SCREEN_HEIGHT * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    borderRadius: 10,
    marginTop: SCREEN_HEIGHT * 0.03,
    alignItems: "center",
  },
  payButtonText: {
    color: "#fff",
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
  },
  header: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.01,
    color: "#333",
  },
  subHeader: {
    fontSize: SCREEN_WIDTH * 0.045,
    textAlign: "center",
    color: "#777",
    marginBottom: SCREEN_HEIGHT * 0.03,
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
});
