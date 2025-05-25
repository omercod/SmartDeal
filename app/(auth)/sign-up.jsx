import React, { useState } from "react";
import { Link } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { auth, db } from "./firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDocs, setDoc, doc, collection } from "firebase/firestore";
import CryptoJS from "crypto-js";
import Svg, { Path } from "react-native-svg";
import { useNavigation, useRoute } from "@react-navigation/native";
import SuccessAnimation from "../../components/SuccessAnimation";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigations = useNavigation();
  const [showSuccess, setShowSuccess] = useState(false);

  const handleRegister = async () => {
    try {
      setLoading(true);

      const querySnapshot = await getDocs(collection(db, "Users"));
      let emailExists = false;

      querySnapshot.forEach((doc) => {
        if (doc.data().email === email) {
          emailExists = true;
        }
      });

      if (emailExists) {
        Alert.alert("שגיאה", "האימייל כבר נמצא במערכת");
        return;
      }

      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      if (user) {
        try {
          const hashedPassword = CryptoJS.SHA256(password).toString();

          await setDoc(doc(db, "Users", user.uid), {
            email: user.email,
            name: name,
            password: hashedPassword,
            IsAdmin: 0,
          });

          // הצגת אנימציה לאחר הצלחה
          setShowSuccess(true);
        } catch (docError) {
          console.log("Error adding document: ", docError);
          Alert.alert("שגיאה", "לא ניתן היה לשמור את הנתונים ב-Firestore");
        }
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert(
          "שגיאה",
          "האימייל כבר רשום במערכת. נסה להתחבר או השתמש באימייל אחר."
        );
      } else {
        console.log(error.message);
        Alert.alert("שגיאה", "אירעה תקלה ברישום. נסה שוב מאוחר יותר.");
      }
    } finally {
      setLoading(false);
    }
  };
  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!name) {
      newErrors.name = "שם מלא הוא שדה חובה";
      valid = false;
    }

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
    } else if (password.length < 8) {
      newErrors.password =
        "הסיסמה חייבת להכיל לפחות אות גדולה אחת, לפחות סימן מיוחד אחד, ואורך מינימלי של 8 תווים.";
      valid = false;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "הסיסמה חייבת להכיל לפחות אות גדולה אחת, לפחות סימן מיוחד אחד, ואורך מינימלי של 8 תווים.";
      valid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password =
        "הסיסמה חייבת להכיל לפחות אות גדולה אחת, לפחות סימן מיוחד אחד, ואורך מינימלי של 8 תווים.";
      valid = false;
    }

    if (password !== passwordConfirm) {
      newErrors.passwordConfirm = "הסיסמאות אינן תואמות";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = () => {
    if (validate()) {
      handleRegister();
    }
  };

  if (showSuccess) {
    return (
      <SuccessAnimation
        message="נרשמת בהצלחה!"
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
          <Text style={styles.title}>צעד אחד ואתם שם!</Text>
          <Text style={styles.subtitle}>צור חשבון חדש עם SmartDeal</Text>
        </View>

        {/* שדה שם מלא */}
        <View>
          <View style={styles.inputContainer}>
            <Icon
              name="account"
              size={24}
              color="#C6A052"
              style={styles.iconLeft}
            />
            <TextInput
              style={[styles.input, { textAlign: "right" }]}
              placeholder="שם מלא"
              placeholderTextColor="#aaa"
              value={name}
              onChangeText={setName}
            />
          </View>
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* שדה אימייל */}
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
                { textAlign: "right", writingDirection: "ltr" },
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

        {/* שדה סיסמה */}
        <View>
          <View style={styles.inputContainer}>
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text>
                <Icon
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="#C6A052"
                />
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { textAlign: "right" }]}
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

        {/* שדה אימות סיסמה */}
        <View>
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={() => setShowPasswordConfirm(!showPasswordConfirm)}
            >
              <Text>
                <Icon
                  name={showPasswordConfirm ? "eye" : "eye-off"}
                  size={24}
                  color="#C6A052"
                />
              </Text>
            </TouchableOpacity>
            <TextInput
              style={[styles.input, { textAlign: "right" }]}
              placeholder="אימות סיסמה"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPasswordConfirm}
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
            />
          </View>
          {errors.passwordConfirm && (
            <Text style={styles.errorText}>{errors.passwordConfirm}</Text>
          )}
        </View>

        {/* כפתור הרשמה */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          {loading ? (
            <ActivityIndicator
              animating={true}
              color="#ffffff"
              size="small"
              style={styles.spinner}
            />
          ) : (
            <Text style={styles.submitButtonText}>הרשמה</Text>
          )}
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

        <View style={styles.linkContainer}>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.link}> התחבר כאן</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.text}>יש לך כבר משתמש? </Text>
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
    marginBottom: 10,
    paddingHorizontal: 15,
    elevation: 2,
  },
  input: { flex: 1, padding: 10, fontSize: 16, color: "#333" },

  errorText: {
    color: "#FF3D00",
    fontSize: 12,
    marginBottom: 6,
    textAlign: "left",
    marginLeft: 10,
  },
  submitButton: {
    backgroundColor: "#C6A052",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 20,
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 10,
    paddingVertical: 15,
    justifyContent: "center",
    marginTop: 15,
    elevation: 2,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 5,
  },
  googleIcon: {
    marginRight: 5,
  },

  linkContainer: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  text: {
    fontSize: 16,
  },
  link: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C6A052",
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
