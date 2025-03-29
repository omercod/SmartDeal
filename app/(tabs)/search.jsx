import { useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TextInput, Button } from "react-native-paper";
import { israeliCities, categories } from "../../constants/data";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";

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

  const getSubCategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find((cat) => cat.value === selectedCategory);
    return category ? category.subItems : [];
  };

  const handleSelect = (type, value) => {
    if (value === "הכל") {
      // Reset selected category or subCategory when "הכל" is selected
      if (type === "category") {
        setSelectedCategory(null);
      } else if (type === "subCategory") {
        setSelectedSubCategory(null);
      }
    } else {
      if (type === "category") {
        setSelectedCategory(value);
        setSelectedSubCategory(null); // Reset subcategory when category changes
      } else if (type === "subCategory") {
        if (!selectedCategory || selectedCategory === "הכל") {
          Alert.alert("שגיאה", "נא לבחור קודם קטגוריה ראשית");
          return;
        }
        setSelectedSubCategory(value);
      } else if (type === "location") {
        setSelectedLocation(value);
        setLocationSearch(""); // Reset search when a location is selected
      }
    }
    setVisibleModal(null);
  };

  const handleSearch = () => {
    // המרה של minPrice ו-maxPrice למספרים במקרה שהם עדיין string
    const numericMinPrice = Number(minPrice) || 0; // אם minPrice הוא לא מספר, הגדר 0
    const numericMaxPrice = Number(maxPrice) || Infinity; // אם maxPrice הוא לא מספר, הגדר Infinity

    const searchParams = {
      category: selectedCategory || "defaultCategory",
      subCategory: selectedSubCategory,
      minPrice: numericMinPrice,
      maxPrice: numericMaxPrice,
      location: selectedLocation,
    };

    console.log("חיפושים:", searchParams);

    // Use router.push with query params
    router.push({
      pathname: "/ResultsScreen",
      params: searchParams,
    });
  };

  // Filter cities based on search input
  const filteredCities = israeliCities.filter((city) =>
    city.toLowerCase().includes(locationSearch.toLowerCase())
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>כאן תמצאו העבודה הבאה שלכם</Text>

        <View style={styles.filterItem}>
          <Text style={styles.label}>קטגוריה ראשית:</Text>
          <Button
            mode="contained"
            buttonColor="#C6A052"
            textColor="black"
            onPress={() => setVisibleModal("category")}
            style={styles.button}
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
              onChangeText={(text) => setMinPrice(Number(text))} // המרת המחרוזת למספר
              keyboardType="numeric"
              mode="outlined"
              outlineColor="#C6A052"
              activeOutlineColor="#C6A052"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />
            <Text style={styles.priceSeparator}>-</Text>
            <TextInput
              textColor="black"
              style={styles.priceInput}
              label="מחיר מקסימלי"
              onChangeText={(text) => setMaxPrice(Number(text))} // המרת המחרוזת למספר
              keyboardType="numeric"
              mode="outlined"
              outlineColor="#C6A052"
              activeOutlineColor="#C6A052"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
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
          >
            {selectedLocation || "בחר מיקום"}
          </Button>
        </View>

        <Button
          mode="contained"
          textColor="white"
          onPress={handleSearch}
          style={styles.searchButton}
        >
          חפש
        </Button>

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
              >
                סגור
              </Button>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    justifyContent: "flex-start",
    alignItems: "stretch",
    padding: 16,
    alignItems: "stretch",
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#C6A052",
    marginTop: 110,
  },
  filterItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
    color: "#333",
  },
  dropdown: {
    width: "100%",
    borderRadius: 8,
    borderColor: "#C6A052", // עדכון צבע הגבול לאותו הצבע כמו למחיר
    borderWidth: 1, // גבול עם עובי
    backgroundColor: "white", // רקע לבן כמו מחיר
  },
  buttonContent: {
    flexDirection: "row-reverse", // For RTL
  },
  menu: {
    width: "80%",
  },
  cityScrollView: {
    maxHeight: 300,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceInput: {
    flex: 1,
    backgroundColor: "white",
  },
  priceSeparator: {
    marginHorizontal: 10,
    fontSize: 18,
    color: "#333",
  },
  searchButton: {
    marginTop: 20,
    paddingVertical: 8,
    backgroundColor: "#C6A052", // רקע לבן כמו במחירים
    borderRadius: 8, // פינות מעוגלות
    borderColor: "#C6A052", // גבול בצבע של המחירים
    borderWidth: 1, // גבול עם עובי 1 כמו למחיר
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    maxHeight: "80%",
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#C6A052",
  },
  option: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  closeButton: {
    marginTop: 15,
    alignSelf: "center",
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  button: {
    paddingVertical: 8,
    backgroundColor: "white", // רקע לבן כמו במחירים
    borderRadius: 8, // פינות מעוגלות
    borderColor: "#C6A052", // גבול בצבע של המחירים
    borderWidth: 1, // גבול עם עובי 1 כמו למחיר
  },
  searchInput: {
    marginBottom: 10,
    backgroundColor: "white",
  },
});
