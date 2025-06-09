import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  I18nManager,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";
import { israeliCities, categories } from "../../constants/data";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Dimensions } from "react-native";
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");


export default function SearchScreen() {
  const [visibleModal, setVisibleModal] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [minPrice, setMinPrice] = useState(0); // עבור ערך התחלתי מספרי
  const [maxPrice, setMaxPrice] = useState(1000000000);
  const [locationSearch, setLocationSearch] = useState("");
  const navigation = useNavigation();
  const router = useRouter();
  const scrollRef = useRef(null);

  const getSubCategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find((cat) => cat.value === selectedCategory);
    return category ? category.subItems : [];
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/sign-in");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSelect = (type, value) => {
    if (value === "הכל") {
      if (type === "category") {
        setSelectedCategory(null);
      } else if (type === "subCategory") {
        setSelectedSubCategory(null);
      }
    } else {
      if (type === "category") {
        setSelectedCategory(value);
        setSelectedSubCategory(null);
      } else if (type === "subCategory") {
        if (!selectedCategory || selectedCategory === "הכל") {
          Alert.alert("שגיאה", "נא לבחור קודם קטגוריה ראשית");
          return;
        }
        setSelectedSubCategory(value);
      } else if (type === "location") {
        setSelectedLocation(value);
        setLocationSearch("");
      }
    }
    setVisibleModal(null);
  };

  const handleSearch = () => {
    const numericMinPrice = Number(minPrice) || 0;
    const numericMaxPrice = Number(maxPrice) || Infinity;

    const searchParams = {
      category: selectedCategory,
      subCategory: selectedSubCategory,
      minPrice: numericMinPrice,
      maxPrice: numericMaxPrice,
      location: selectedLocation,
    };

    router.push({
      pathname: "/ResultsScreen",
      params: searchParams,
    });
  };

  const filteredCities = israeliCities.filter((city) =>
    city.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{
              flexGrow: 1,
              paddingBottom: SCREEN_HEIGHT * 0.002,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>כאן תמצאו העבודה הבאה שלכם</Text>

            <View style={styles.filterItem}>
              <Text style={styles.label}>קטגוריה ראשית:</Text>
              <Button
                mode="contained"
                buttonColor="#C6A052"
                textColor="black"
                onPress={() => setVisibleModal("category")}
                style={styles.button}
                contentStyle={{
                  flexDirection:
                    Platform.OS === "android" ? "row-reverse" : "row-reverse",
                }}
                labelStyle={{ writingDirection: "rtl" }}
              >
                {selectedCategory || "בחר קטגוריה"}
              </Button>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.label}>קטגוריה משנית:</Text>
              <Button
                mode="contained"
                buttonColor="#C6A052"
                textColor="black"
                onPress={() => {
                  if (!selectedCategory || selectedCategory === "הכל") {
                    Alert.alert("שגיאה", "נא לבחור קודם קטגוריה ראשית");
                    return;
                  }
                  setVisibleModal("subCategory");
                }}
                style={styles.button}
                contentStyle={{
                  flexDirection:
                    Platform.OS === "android" ? "row-reverse" : "row-reverse",
                }}
                labelStyle={{ writingDirection: "rtl" }}
              >
                {selectedSubCategory || "בחר קטגוריה משנית"}
              </Button>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.label}>טווח מחירים:</Text>
              <View style={styles.priceContainer}>
                <TextInput
                  textColor="black"
                  style={styles.priceInput}
                  label="מחיר מינימלי"
                  onChangeText={(text) => setMinPrice(Number(text))}
                  keyboardType="numeric"
                  mode="outlined"
                  outlineColor="#C6A052"
                  activeOutlineColor="#C6A052"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  textAlign={Platform.OS === "ios" ? "right" : "right"}
                  textAlignVertical="center"
                  writingDirection="rtl"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 200);
                  }}
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  textColor="black"
                  style={styles.priceInput}
                  label="מחיר מקסימלי"
                  onChangeText={(text) => setMaxPrice(Number(text))}
                  keyboardType="numeric"
                  mode="outlined"
                  outlineColor="#C6A052"
                  activeOutlineColor="#C6A052"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  textAlign={Platform.OS === "ios" ? "right" : "right"}
                  textAlignVertical="center"
                  writingDirection="rtl"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollRef.current?.scrollToEnd({ animated: true });
                    }, 200);
                  }}
                />
              </View>
            </View>

            <View style={styles.filterItem}>
              <Text style={styles.label}>מיקום:</Text>
              <Button
                mode="contained"
                buttonColor="#C6A052"
                textColor="black"
                onPress={() => setVisibleModal("location")}
                style={styles.button}
                contentStyle={{
                  flexDirection:
                    Platform.OS === "android" ? "row-reverse" : "row-reverse",
                }}
                labelStyle={{ writingDirection: "rtl" }}
              >
                {selectedLocation || "בחר מיקום"}
              </Button>
            </View>

            <Button
              mode="contained"
              textColor="white"
              onPress={handleSearch}
              style={styles.searchButton}
              contentStyle={{
                flexDirection:
                  Platform.OS === "android" ? "row-reverse" : "row-reverse",
              }}
              labelStyle={{ writingDirection: "rtl" }}
            >
              חפש
            </Button>

            {/* מודאל בחוץ */}
            <Modal visible={!!visibleModal} transparent animationType="slide">
              <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {visibleModal === "category"
                      ? "בחר קטגוריה"
                      : visibleModal === "subCategory"
                        ? "בחר קטגוריה משנית"
                        : "בחר מיקום"}
                  </Text>
                  {visibleModal === "location" && (
                    <TextInput
                      style={styles.searchInput}
                      placeholder="חפש עיר"
                      value={locationSearch}
                      onChangeText={setLocationSearch}
                      mode="outlined"
                      textAlign={Platform.OS === "ios" ? "right" : "right"}
                      textAlignVertical="center"
                      writingDirection="rtl"
                      outlineColor="#C6A052"
                      activeOutlineColor="#C6A052"
                    />
                  )}
                  {visibleModal === "subCategory" && !selectedCategory ? (
                    <Text style={styles.subCategoryWarning}>
                      נא לבחור קודם קטגוריה ראשית
                    </Text>
                  ) : (
                    <FlatList
                      data={
                        visibleModal === "category"
                          ? ["הכל", ...categories.map((c) => c.value)]
                          : visibleModal === "subCategory"
                            ? ["הכל", ...getSubCategories()]
                            : filteredCities
                      }
                      keyExtractor={(item) => item}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.option}
                          onPress={() => handleSelect(visibleModal, item)}
                        >
                          <Text style={styles.optionText}>{item}</Text>
                        </TouchableOpacity>
                      )}
                    />
                  )}
                  <Button
                    textColor="black"
                    onPress={() => setVisibleModal(null)}
                    style={styles.closeButton}
                    contentStyle={{
                      flexDirection:
                        Platform.OS === "android"
                          ? "row-reverse"
                          : "row-reverse",
                    }}
                    labelStyle={{ writingDirection: "rtl" }}
                  >
                    סגור
                  </Button>
                </View>
              </View>
            </Modal>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "flex-start",
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingTop:
      Platform.OS === "ios" ? SCREEN_HEIGHT * 0.02 : SCREEN_HEIGHT * 0.01,
    paddingBottom: SCREEN_HEIGHT * 0.015,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    marginBottom: SCREEN_HEIGHT * 0.04, 
    textAlign: "center",
    color: "#C6A052",
    marginTop: SCREEN_HEIGHT * 0.08, 
    writingDirection: "rtl",
  },
  filterItem: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  label: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
    marginBottom: SCREEN_HEIGHT * 0.01,
    textAlign: Platform.OS === "android" ? "right" : "right",
    color: "#333",
    writingDirection: "rtl",
  },
  priceContainer: {
    flexDirection: Platform.OS === "android" ? "row-reverse" : "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  priceInput: {
    flex: 1,
    backgroundColor: "white",
    textAlign: "right",
    fontSize: SCREEN_WIDTH * 0.035,
  },
  priceSeparator: {
    marginHorizontal: SCREEN_WIDTH * 0.02,
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#333",
  },
  searchButton: {
    marginTop: SCREEN_HEIGHT * 0.002,
    marginBottom: SCREEN_HEIGHT * 0.008,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    backgroundColor: "#C6A052",
    borderRadius: 8,
    borderColor: "#C6A052",
    borderWidth: 1,
    width: "100%",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SCREEN_WIDTH * 0.04,
  },
  modalContent: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: "#fff",
    padding: SCREEN_WIDTH * 0.05,
    borderRadius: 15,
    maxHeight: SCREEN_HEIGHT * 0.7,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    marginBottom: SCREEN_HEIGHT * 0.02,
    textAlign: "center",
    color: "#C6A052",
    writingDirection: "rtl",
  },
  option: {
    padding: SCREEN_WIDTH * 0.03,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: SCREEN_WIDTH * 0.04,
    textAlign: "center",
    color: "#333",
    writingDirection: "rtl",
  },
  closeButton: {
    marginTop: SCREEN_HEIGHT * 0.02,
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingVertical: SCREEN_HEIGHT * 0.01,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    borderRadius: SCREEN_WIDTH * 0.05,
  },
  button: {
    paddingVertical: SCREEN_HEIGHT * 0.012,
    backgroundColor: "white",
    borderRadius: 8,
    borderColor: "#C6A052",
    borderWidth: 1,
    width: "100%",
  },
  searchInput: {
    marginBottom: SCREEN_HEIGHT * 0.015,
    backgroundColor: "white",
    textAlign: "right",
    fontSize: SCREEN_WIDTH * 0.035,
  },
  subCategoryWarning: {
    textAlign: "center",
    color: "red",
    marginVertical: SCREEN_HEIGHT * 0.015,
    writingDirection: "rtl",
    fontSize: SCREEN_WIDTH * 0.035,
  },
});
