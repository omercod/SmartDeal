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
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Svg, { Path } from "react-native-svg";
import { auth, db } from "./firebase";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getDocs, setDoc, doc, collection } from "firebase/firestore";
import { use } from "react";
import bcrypt from "react-native-bcrypt";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [errors, setErrors] = useState({});

  const handleRegister = async () => {
    try {
      // קבלת כל המסמכים מאוסף ה-Users
      const querySnapshot = await getDocs(collection(db, "Users"));
      let emailExists = false;

      // בדיקת אם האימייל כבר קיים במערכת
      querySnapshot.forEach((doc) => {
        if (doc.data().email === email) {
          emailExists = true;
        }
      });

      if (emailExists) {
        Alert.alert("שגיאה", "האימייל כבר נמצא במערכת");
        return;
      }

      // אם האימייל לא קיים, המשך בתהליך ההרשמה
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log(user);

      if (user) {
        try {
          // הצפנת הסיסמה לפני שמירתה
          const saltRounds = 10; // מספר הסיבובים
          const hashedPassword = bcrypt.hashSync(password, saltRounds);

          // שמירה של פרטי המשתמש ב-Firestore
          await setDoc(doc(db, "Users", user.uid), {
            email: user.email,
            name: name,
            password: hashedPassword, // שמירת הסיסמה המוצפנת
          });

          // הצגת הודעת הצלחה רק אחרי שהמשתמש נרשם והנתונים נשמרו
          Alert.alert("נרשמת בהצלחה!");
        } catch (docError) {
          console.log("Error adding document: ", docError);
          Alert.alert("שגיאה", "לא ניתן היה לשמור את הנתונים ב-Firestore");
        }
      }
    } catch (error) {
      console.log(error.message);
      Alert.alert("שגיאה", "אירעה תקלה ברישום. נסה שוב מאוחר יותר.");
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
    } else if (password.length < 6) {
      newErrors.password = "הסיסמה חייבת להכיל לפחות 6 תווים";
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
      console.log("Form submitted", { name, email, password });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* לוגו וכותרת */}
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
                {" "}
                {/* הוספתי את רכיב ה-Text כאן */}
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
                {" "}
                {/* הוספתי את רכיב ה-Text כאן */}
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
          <Text style={styles.submitButtonText}>הרשמה</Text>
        </TouchableOpacity>

        {/* כפתור הרשמה דרך Google */}
        <TouchableOpacity style={styles.googleButton}>
          <Text style={styles.googleButtonText}>הרשמה דרך Google</Text>
          <Svg width="24" height="24" viewBox="0 0 48 48">
            <Path
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12 c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20 c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              fill="#FFC107"
            />
            <Path
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              fill="#FF3D00"
            />
            <Path
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946 l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              fill="#4CAF50"
            />
            <Path
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l4.073,3.255C40.5,33.5,42,28.5,42,24z"
              fill="#1976D2"
            />
          </Svg>
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
