import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Svg, { Path } from "react-native-svg";
import { Link } from "expo-router";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./firebase";
import { Alert } from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import SuccessAnimation from "../../components/SuccessAnimation";

export default function SignIn() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetEmail, setResetEmail] = useState("");
  const navigations = useNavigation();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // פונקציה לשליחת מייל לאיפוס סיסמה
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert("אנא הזן אימייל לאיפוס סיסמה");
      return;
    }

    // בדיקת תקינות של האימייל
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      Alert.alert("אנא הזן כתובת אימייל חוקית.");
      return;
    }

    try {
      // שליחת המייל לאיפוס סיסמה
      await sendPasswordResetEmail(auth, resetEmail);

      // הודעת הצלחה
      Alert.alert("ההוראות לאיפוס סיסמה נשלחו אליך!", "בדוק את האימייל שלך.");
      setIsPopupVisible(false); // סגירת הפופ-אפ אחרי שליחה
    } catch (error) {
      // טיפול בשגיאות נפוצות
      switch (error.code) {
        case "auth/invalid-email":
          Alert.alert("האימייל שגוי. ודא שהאימייל נכון.");
          break;
        case "auth/user-not-found":
          Alert.alert("לא נמצא משתמש עם האימייל הזה.");
          break;
        default:
          Alert.alert("אירעה שגיאה: " + error.message);
      }
    }
  };

  const handleSubmitLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigations.navigate("(tabs)");
      }, 3000);

      Alert.alert("התחברת בהצלחה!", "ברוך הבא!", [
        { text: "אוקי", onPress: () => console.log("המשתמש לחץ אוקי") },
      ]);
      navigation.navigate("(main)/user-page");
    } catch (error) {
      switch (error.code) {
        case "auth/invalid-email":
          Alert.alert("האימייל שגוי. ודא שהאימייל נכון.");
          break;
        case "auth/wrong-password":
          Alert.alert("הסיסמה שגויה. נסה שוב.");
          break;
        case "auth/user-not-found":
          Alert.alert("לא נמצא משתמש עם האימייל הזה. ודא שהאימייל נכון.");
          break;
        case "auth/too-many-requests":
          Alert.alert("יותר מדי ניסיונות. נסה שוב מאוחר יותר.");
          break;
        default:
          Alert.alert("אירעה שגיאה: " + error.message);
      }
    }
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!email) {
      newErrors.email = "האימייל הוא שדה חובה";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "אנא הזן כתובת אימייל תקינה";
      valid = false;
    }

    if (!password) {
      newErrors.password = "הסיסמה היא שדה חובה";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validate()) {
      handleSubmitLogin();
      console.log("Signed in with:", { email, password });
    }
  };

  if (showSuccess) {
    return (
      <SuccessAnimation
        message="התחברת בהצלחה!"
        onAnimationEnd={() => navigations.navigate("(tabs)")}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity onPress={() => navigations.navigate("(tabs)")}>
            <Icon name="arrow-right" size={28} color="#333" />
          </TouchableOpacity>
        </View>
        <View style={styles.logoContainer}>
          <Icon name="account-circle" size={80} color="#C6A052" />
          <Text style={styles.title}>ברוך הבא!</Text>
          <Text style={styles.subtitle}>אנא התחבר כדי להמשיך</Text>
        </View>

        {/* Email Field */}
        <View>
          <View style={styles.inputContainer}>
            <Icon
              name="email-outline"
              size={24}
              color="#C6A052"
              style={styles.iconLeft}
            />
            <TextInput
              style={[
                styles.input,
                { textAlign: "right", writingDirection: "rtl" },
              ]}
              placeholder="אימייל"
              placeholderTextColor="#aaa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Password Field */}
        <View>
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? "eye" : "eye-off"}
                size={24}
                color="#C6A052"
              />
            </TouchableOpacity>
            <TextInput
              style={[
                styles.input,
                { textAlign: "right", writingDirection: "ltr" },
              ]}
              placeholder="סיסמה"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Forgot Password */}
        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => setIsPopupVisible(true)} // פתיחת הפופ-אפ
        >
          <View style={{ width: "100%", alignItems: "flex-end" }}>
            <Text style={styles.forgotPasswordText}>שכחתי סיסמה</Text>
          </View>
        </TouchableOpacity>

        {/* Reset Password Popup */}
        {isPopupVisible && (
          <View style={[styles.popup, { opacity: 1 }]}>
            <Text style={styles.title}>איפוס סיסמה</Text>
            <TextInput
              style={styles.emailInput}
              placeholder="הזן את האימייל שלך"
              keyboardType="email-address"
              autoCapitalize="none"
              value={resetEmail}
              onChangeText={setResetEmail}
            />
            <TouchableOpacity
              onPress={handlePasswordReset}
              style={styles.submitButton}
            >
              <Text style={styles.submitButtonText}>
                שלח אימייל לאיפוס סיסמה
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsPopupVisible(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>ביטול</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Sign In Button */}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>התחבר</Text>
        </TouchableOpacity>

        {/* כפתור הרשמה דרך Google */}
        <TouchableOpacity style={styles.googleButton}>
          <Svg
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="30"
            height="30"
            viewBox="0 0 48 48"
          >
            <Path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            ></Path>
            <Path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            ></Path>
            <Path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            ></Path>
            <Path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            ></Path>
          </Svg>
          <Text style={styles.googleButtonText}>התחבר דרך Google </Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.footerLink}> הירשם כאן</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.footerText}>אין לך חשבון? </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F9F9F9" },
  container: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 20 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333", marginTop: 10 },
  subtitle: { fontSize: 16, color: "#666", marginTop: 5 },
  inputContainer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
    paddingHorizontal: 15,
    elevation: 2,
  },
  input: { flex: 1, padding: 10, fontSize: 16, color: "#333" },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    color: "#C6A052",
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: "#C6A052",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 15,
    justifyContent: "center",
    marginTop: 15,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
    color: "#fff",
  },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "#666", fontSize: 14 },
  footerLink: { color: "#C6A052", fontSize: 14, fontWeight: "bold" },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },

  popup: {
    position: "absolute",
    top: "42%", // להוריד את הפופ-אפ מעט למטה
    left: "10%",
    right: "10%",
    backgroundColor: "#f5f5f5", // רקע בהיר
    padding: 25,
    borderRadius: 15, // פינות מעוגלות יותר
    borderWidth: 2,
    borderColor: "#C6A052", // גבול צבעוני
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // הצללה
    zIndex: 9999, // כדי להבטיח שהפופ-אפ יופיע מעל כל הכפתורים
  },
  emailInput: {
    height: 45,
    borderColor: "#C6A052",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20, // הוספת מרווח בין שדה האימייל לכפתור
    fontSize: 16,
    textAlign: "right", // מיקום הטקסט מצד ימין
    fontWeight: "bold", // הדגשת הטקסט
    writingDirection: "ltr", // כתיבה מ-לשמאל לימין
  },

  sendButton: {
    backgroundColor: "#C6A052", // צבע הכפתור
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20, // מרווח נוסף בין שדה האימייל לכפתור
    alignItems: "center",
    transition: "background-color 0.3s ease", // אפקט ריחוף
  },

  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  cancelButton: {
    backgroundColor: "#333",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20, // המרווח בין שדה האימייל לכפתור
    alignItems: "center",
    transition: "background-color 0.3s ease", // אפקט ריחוף
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorText: {
    color: "#ff5722", // צבע טקסט שגיאה יותר חזק
    fontSize: 14,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20, // מרווח בין הכותרת לשדה האימייל
    textAlign: "center", // למרכז את הכותרת
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
  },
  footerText: {
    fontSize: 18,
    color: "#333", // צבע טקסט כהה לפוטר
  },
  footerLink: {
    fontSize: 18,
    color: "#C6A052", // צבע גוון כסף/זהב לפוטר
    fontWeight: "bold",
    textDecoration: "underline", // קו תחתון
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
