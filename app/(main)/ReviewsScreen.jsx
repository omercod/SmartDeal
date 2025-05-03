import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  I18nManager,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import { db } from "../(auth)/firebase";
import { addDoc, collection, deleteDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ReviewsScreen = () => {
  const [rating, setRating] = useState(3);
  const [review, setReview] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const { providerName, providerEmail, reviewId } = route.params || {};

  const handleSubmit = async () => {
    if (rating === 0) {
      alert("אנא בחר דירוג כוכבים");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("יש להתחבר כדי לשלוח ביקורת");
      return;
    }

    try {
      await addDoc(collection(db, "Reviews"), {
        reviewerEmail: user.email,
        providerEmail,
        stars: rating,
        text: review || "",
        createdAt: new Date(),
      });

      if (reviewId) {
        await deleteDoc(doc(db, "PendingReviews", reviewId));
      }

      setSubmitted(true);
      setTimeout(() => {
        setRating(3);
        setReview("");
        setSubmitted(false);
        navigation.navigate("(main)/user-page");
      }, 1000);
    } catch (error) {
      console.error("שגיאה בשליחת ביקורת:", error);
      alert("הייתה שגיאה בשליחת הביקורת");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon
                name="arrow-right"
                size={SCREEN_WIDTH * 0.07}
                color="#333"
              />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>
                השארת ביקורת עבור {providerName || "נותן השירות"}
              </Text>
            </View>
          </>

          {submitted ? (
            <View style={styles.modalContent}>
              <AntDesign name="checkcircle" size={50} color="#C6A052" />
              <Text style={styles.modalTitle}>תודה על הביקורת שלך!</Text>
              <Text style={styles.modalText}>הביקורת נשלחה בהצלחה</Text>
            </View>
          ) : (
            <>
              <View style={styles.ratingContainer}>
                <Text style={styles.ratingTitle}>דרג את השירות</Text>
                <Text style={styles.ratingSubtitle}>דירוג כוכבים (חובה)</Text>

                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                    >
                      <AntDesign
                        name={rating >= star ? "star" : "staro"}
                        size={40}
                        color={rating >= star ? "#C6A052" : "#ccc"}
                        style={styles.starIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.ratingText}>
                  {rating === 5
                    ? "שירות מעולה"
                    : rating === 4
                      ? "שירות טוב מאוד"
                      : rating === 3
                        ? "שירות סביר"
                        : rating === 2
                          ? "שירות לא מספק"
                          : rating === 1
                            ? "שירות גרוע"
                            : ""}
                </Text>
              </View>

              <View style={styles.reviewContainer}>
                <Text style={styles.reviewTitle}>הוסף ביקורת </Text>
                <Text style={styles.reviewSubtitle}>(לא חובה)</Text>

                <TextInput
                  style={styles.textInput}
                  placeholder="כתוב את הביקורת שלך כאן..."
                  value={review}
                  onChangeText={setReview}
                  multiline
                  textAlignVertical="top"
                  textAlign="right"
                  writingDirection="rtl"
                />
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                <Text style={styles.buttonText}>שלח ביקורת</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: SCREEN_HEIGHT * 0.05,
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  },
  headerContainer: {
    paddingTop: SCREEN_HEIGHT * 0.17,
    paddingBottom: SCREEN_HEIGHT * 0.03,
    alignItems: "center",
    width: "100%",
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  },
  headerTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  ratingContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_HEIGHT * 0.03,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  },
  ratingTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  ratingSubtitle: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: "#666",
    marginBottom: 15,
  },
  starsContainer: {
    flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
    justifyContent: "center",
    marginVertical: 10,
  },
  starIcon: {
    marginHorizontal: 5,
  },
  ratingText: {
    marginTop: 10,
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
    color: "#C6A052",
  },
  reviewContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: SCREEN_WIDTH * 0.05,
    marginBottom: SCREEN_HEIGHT * 0.03,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  },
  reviewTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  reviewSubtitle: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: "#666",
    textAlign: "center",
    marginBottom: 10,
  },
  textInput: {
    height: 120,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginTop: 10,
    width: "100%",
    textAlign: "right",
    textAlignVertical: "top",
    writingDirection: "rtl",
  },
  button: {
    backgroundColor: "#C6A052",
    paddingVertical: 14,
    borderRadius: 20,
    alignItems: "center",
    alignSelf: "center",
    width: SCREEN_WIDTH * 0.8,
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  },
  buttonText: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  modalContent: {
    width: "100%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 30,
    alignItems: "center",
    marginTop: SCREEN_HEIGHT * 0.05,
    elevation: 3,
    direction: I18nManager.isRTL ? "rtl" : "ltr",
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
    color: "#C6A052",
    textAlign: "center",
  },
  modalText: {
    fontSize: SCREEN_WIDTH * 0.04,
    marginVertical: 5,
    color: "#333",
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.07,
    right: SCREEN_WIDTH * 0.05,
    backgroundColor: "#f9f9f9",
    borderRadius: 50,
    padding: 8,
    zIndex: 10,
    elevation: 3,
  },
});

export default ReviewsScreen;
