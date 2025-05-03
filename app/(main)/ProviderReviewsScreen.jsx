import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
  Platform,
  useWindowDimensions,
  StatusBar,
  Dimensions,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../(auth)/firebase";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT =
  Platform.OS === "ios" ? 44 : StatusBar.currentHeight + 40 || 56;

const ProviderReviewsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const { providerEmail, providerName } = route.params || {};

  const [reviews, setReviews] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

  // Define styles inside the component to access width
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f9f9f9",
      paddingHorizontal: SCREEN_WIDTH * 0.05,
      paddingBottom: SCREEN_HEIGHT * 0.05,
      direction: "rtl",
    },
    profileContainer: {
      alignItems: "center",
      marginBottom: 30,
      paddingHorizontal: SCREEN_WIDTH * 0.05,
      width: "100%",
      marginTop: insets.top + HEADER_HEIGHT + 60, // Add top margin to avoid overlap with back button
    },
    profileImage: {
      width: SCREEN_WIDTH * 0.28,
      height: SCREEN_WIDTH * 0.28,
      borderRadius: SCREEN_WIDTH * 0.14,
      backgroundColor: "#eee",
      marginTop: 10,
    },
    providerName: {
      fontSize: SCREEN_WIDTH * 0.055, // ~22px on standard screens
      fontWeight: "bold",
      color: "#333",
      marginTop: 10,
      textAlign: "center",
    },
    averageRating: {
      fontSize: SCREEN_WIDTH * 0.045, // ~18px on standard screens
      color: "#C6A052",
      marginTop: 5,
      fontWeight: "600",
      textAlign: "center",
    },
    noReviews: {
      textAlign: "center",
      color: "#777",
      fontSize: SCREEN_WIDTH * 0.04, // ~16px on standard screens
      marginTop: 20,
    },
    reviewCard: {
      backgroundColor: "white",
      padding: 15,
      borderRadius: 10,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      paddingHorizontal: SCREEN_WIDTH * 0.04,
    },
    stars: {
      fontSize: SCREEN_WIDTH * 0.04, // ~16px on standard screens
      fontWeight: "bold",
      color: "#C6A052",
      textAlign: "right",
    },
    text: {
      marginTop: 5,
      fontSize: SCREEN_WIDTH * 0.035, // ~14px on standard screens
      color: "#333",
      textAlign: "right",
    },
    email: {
      marginTop: 8,
      fontSize: SCREEN_WIDTH * 0.03, // ~12px on standard screens
      color: "#888",
      textAlign: "right",
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
    listContent: {
      paddingBottom: 40,
    },
  });

  useEffect(() => {
    let unsubscribeReviews;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "Reviews"),
          where("providerEmail", "==", providerEmail)
        );

        unsubscribeReviews = onSnapshot(
          q,
          (querySnapshot) => {
            const fetchedReviews = querySnapshot.docs.map((doc) => doc.data());
            setReviews(fetchedReviews);
            setLoading(false);
          },
          (error) => {
            console.error(
              "\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05d6\u05de\u05df \u05d0\u05de\u05d9\u05ea \u05d1\u05d1\u05d9\u05e7\u05d5\u05e8\u05d5\u05ea:",
              error
            );
            setLoading(false);
          }
        );

        const userQuery = query(
          collection(db, "Users"),
          where("email", "==", providerEmail)
        );
        const userSnapshot = await getDocs(userQuery);
        const userData = userSnapshot.docs[0]?.data();
        if (userData?.profileImage) {
          setProfileImage(userData.profileImage);
        } else {
          setProfileImage(null);
        }
      } catch (error) {
        console.error(
          "\u05e9\u05d2\u05d9\u05d0\u05d4 \u05d1\u05d8\u05e2\u05d9\u05e0\u05ea \u05d4\u05e0\u05ea\u05d5\u05e0\u05d9\u05dd:",
          error
        );
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeReviews) unsubscribeReviews();
    };
  }, [providerEmail]);

  const averageStars =
    reviews.length > 0
      ? (
          reviews.reduce((sum, r) => sum + (r.stars || 0), 0) / reviews.length
        ).toFixed(1)
      : null;

  return (
    <SafeAreaView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      {/* חץ חזור */}
      <View
        style={[
          styles.backButtonContainer,
          { top: insets.top + HEADER_HEIGHT + 10 },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-right" size={SCREEN_WIDTH * 0.07} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileContainer}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.profileImage} />
        ) : (
          <Ionicons name="person-circle-outline" size={100} color="#ccc" />
        )}
        <Text style={styles.providerName}>{providerName || "נותן השירות"}</Text>
        {averageStars && (
          <Text style={styles.averageRating}>⭐ {averageStars}/5</Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#C6A052" />
      ) : reviews.length === 0 ? (
        <Text style={styles.noReviews}>אין עדיין ביקורות</Text>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <Text style={styles.stars}>⭐ {item.stars}/5</Text>
              <Text style={styles.text}>{item.text || "אין תוכן כתוב"}</Text>
              <Text style={styles.email}>מאת: {item.reviewerEmail}</Text>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default ProviderReviewsScreen;
