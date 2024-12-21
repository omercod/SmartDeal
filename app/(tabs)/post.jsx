import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { Appbar, Divider } from "react-native-paper";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { categories } from "../../constants/data";
import { auth } from "../(auth)/firebase";

export default function Post() {
  const navigation = useNavigation();
  const [mainCategory, setMainCategory] = useState(null);
  const [mainCategoryOpen, setMainCategoryOpen] = useState(false);
  const [subCategory, setSubCategory] = useState(null);
  const [subCategoryOpen, setSubCategoryOpen] = useState(false);
  const [subCategories, setSubCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      navigation.replace("(auth)/sign-in");
    }
  }, [navigation]);

  useEffect(() => {
    if (mainCategory) {
      const selectedCategory = categories.find(
        (cat) => cat.value === mainCategory
      );
      setSubCategories(selectedCategory ? selectedCategory.subItems : []);
      setSubCategory(null);
    }
  }, [mainCategory]);

  const handleSubmit = () => {
    let newErrors = {};

    if (!mainCategory) newErrors.mainCategory = "חובה לבחור קטגוריה ראשית";
    if (!subCategory) newErrors.subCategory = "חובה לבחור קטגוריה משנית";
    if (!title.trim()) newErrors.title = "חובה להזין כותרת";
    if (!description.trim()) newErrors.description = "חובה להזין תיאור";
    if (!price.trim()) newErrors.price = "חובה להזין מחיר מקסימלי";
    if (!description.trim()) newErrors.description = "חובה להזין תיאור";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setErrors({});
      navigation.navigate("(main)/post2", {
        mainCategory,
        subCategory,
        title,
        description,
        price,
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content
          title="פרסום דרישת שירות"
          titleStyle={styles.appBarTitle}
        />
      </Appbar.Header>

      {/* KeyboardAwareScrollView */}
      <KeyboardAwareScrollView
        style={styles.container}
        resetScrollToCoords={{ x: 0, y: 0 }}
        contentContainerStyle={styles.content}
        scrollEnabled
        extraScrollHeight={20}
      >
        <Text style={styles.header}>
          <Text style={styles.title}>?מה אתם מחפשים</Text>
        </Text>

        {/* קטגוריה ראשית */}
        <View style={[styles.inputContainer, { zIndex: 3000 }]}>
          <Text style={styles.label}>קטגוריה ראשית</Text>
          <DropDownPicker
            open={mainCategoryOpen}
            value={mainCategory}
            items={categories.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            setOpen={setMainCategoryOpen}
            setValue={setMainCategory}
            placeholder="בחרו קטגוריה ראשית"
            style={styles.dropdown}
            dropDownContainerStyle={[
              styles.dropdownBox,
              { direction: "rtl", maxHeight: 400 },
            ]}
            placeholderStyle={[styles.placeholderStyle, { textAlign: "right" }]}
            labelStyle={{ textAlign: "right" }}
            listMode="SCROLLVIEW"
            nestedScrollEnabled={true}
            zIndex={3000}
            zIndexInverse={1000}
          />
          {errors.mainCategory && (
            <Text style={styles.errorText}>{errors.mainCategory}</Text>
          )}
        </View>

        {/* קטגוריה משנית */}
        <View style={[styles.inputContainer, { zIndex: 2000 }]}>
          <Text style={styles.label}>תת קטגוריה</Text>
          <DropDownPicker
            open={subCategoryOpen}
            value={subCategory}
            items={subCategories.map((item) => ({ label: item, value: item }))}
            setOpen={setSubCategoryOpen}
            setValue={setSubCategory}
            placeholder="בחרו תת קטגוריה"
            style={styles.dropdown}
            dropDownContainerStyle={[
              styles.dropdownBox,
              { direction: "rtl", maxHeight: 400 },
            ]}
            placeholderStyle={[styles.placeholderStyle, { textAlign: "right" }]}
            labelStyle={{ textAlign: "right" }}
            disabled={!subCategories.length}
            listMode="SCROLLVIEW"
            nestedScrollEnabled={true}
            zIndex={2000}
            zIndexInverse={500}
          />
          {errors.subCategory && (
            <Text style={styles.errorText}>{errors.subCategory}</Text>
          )}
        </View>

        {/* כותרת */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>כותרת</Text>
          <TextInput
            style={styles.input}
            placeholder="רשמו כותרת"
            value={title}
            onChangeText={(text) => {
              setTitle(text);
              setErrors((prev) => ({ ...prev, title: "" })); // איפוס השגיאה בעת הזנת טקסט
            }}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
        </View>

        {/* תיאור הדרישה */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>תיאור</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={`לדוגמא:
מחפש הובלה לדירת 3 חדרים מבאר שבע לתל אביב בתאריך 25.12.2024, החל משעה 08:00. דרוש צוות סבלים ואריזה.`}
            placeholderTextColor="#888"
            value={description}
            onChangeText={(text) => {
              setDescription(text);
              setErrors((prev) => ({ ...prev, description: "" })); // איפוס שגיאה בעת הזנת טקסט
            }}
            multiline
            textAlign="right" // יישור הטקסט לימין
            writingDirection="rtl" // כתיבה מימין לשמאל
          />
          {errors.description && (
            <Text style={styles.errorText}>{errors.description}</Text>
          )}
        </View>

        {/* מחיר מקסימלי */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>מחיר מקסימלי</Text>
          <TextInput
            style={styles.input}
            placeholder="מחיר"
            keyboardType="numeric"
            value={price}
            onChangeText={(text) => {
              const formattedText = text.replace(/[^0-9]/g, "");
              const formattedPrice = formattedText
                ? `₪${parseInt(formattedText, 10).toLocaleString()}`
                : "";
              setPrice(formattedPrice);
              setErrors((prev) => ({ ...prev, price: "" }));
            }}
            textAlign="right"
          />
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
        </View>

        {/* כפתור שליחה */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>המשך</Text>
        </TouchableOpacity>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  appBarTitle: { fontSize: 20, color: "#fff", fontWeight: "bold" },
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 20 },
  header: { fontSize: 26, textAlign: "center", marginBottom: 20 },
  title: { fontWeight: "700", color: "#333" },
  subtitle: { color: "#C6A052" },
  divider: { marginVertical: 10, height: 1, backgroundColor: "#ccc" },
  dropdownContainer: { marginBottom: 15 },
  dropdown: { borderColor: "#C6A052", borderRadius: 8 },
  dropdownBox: { backgroundColor: "#fff", borderColor: "#C6A052" },
  placeholderStyle: { textAlign: "right", color: "#aaa" },
  label: { fontSize: 16, marginBottom: 5, textAlign: "right" },
  inputContainer: { marginBottom: 15 },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    textAlign: "right",
  },
  textArea: {
    height: 160, // גובה מותאם לטקסט ארוך
    textAlignVertical: "top",
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    fontSize: 16,
    backgroundColor: "#fdfdfd",
    color: "#333",
    lineHeight: 22,
  },
  submitButton: {
    backgroundColor: "#C6A052",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    textAlign: "right",
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    textAlign: "right",
    fontSize: 16,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 4,
    textAlign: "right",
  },
  submitButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
