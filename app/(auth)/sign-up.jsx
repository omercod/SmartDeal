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

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // מצב טעינה

  const handleRegister = async () => {
    try {
      setLoading(true); // מפעילים את טעינה

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
          // הצפנת הסיסמה עם crypto-js
          const hashedPassword = CryptoJS.SHA256(password).toString();

          // שמירת המשתמש ב-Firestore
          await setDoc(doc(db, "Users", user.uid), {
            email: user.email,
            name: name,
            password: hashedPassword,
          });

          Alert.alert("נרשמת בהצלחה!");
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
      // סיום טעינה לאחר התהליך
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
      newErrors.password = "הסיסמה חייבת להיות באורך מינימלי של 8 תווים";
      valid = false;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "הסיסמה חייבת להכיל לפחות אות גדולה אחת";
      valid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password = "הסיסמה חייבת להכיל לפחות סימן מיוחד";
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
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

        <View style={styles.linkContainer}>
          <Text style={styles.text}>יש לך כבר משתמש? </Text>
          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Text style={styles.link}> התחבר כאן</Text>
            </TouchableOpacity>
          </Link>
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
    marginTop: 2,
    textAlign: "right",
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
});
