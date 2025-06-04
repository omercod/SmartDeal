import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  Platform,
  StatusBar,
  Dimensions,
  I18nManager,
  TouchableOpacity,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../(auth)/firebase";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
// Use fixed values for header height to avoid floating point issues
const HEADER_HEIGHT = Platform.OS === "ios" ? 90 : (StatusBar.currentHeight || 0) + 90;

export default function ProviderReviewsScreen() {
  const route = useRoute();
  const { providerEmail, providerName } = route.params || {};
  const [reviews, setReviews] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets(); 
  const navigation = useNavigation();

  // Force RTL
  useEffect(() => {
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);
  }, []);

  useEffect(() => {
    let unsubscribeReviews;

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, "Reviews"),
          where("providerEmail", "==", providerEmail)
        );

        unsubscribeReviews = onSnapshot(q, (querySnapshot) => {
          const fetchedReviews = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setReviews(fetchedReviews);
          setLoading(false);
        });

        const userQuery = query(
          collection(db, "Users"),
          where("email", "==", providerEmail)
        );
        const userSnapshot = await getDocs(userQuery);
        const userData = userSnapshot.docs[0]?.data();
        setProfileImage(userData?.profileImage || null);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
    return () => unsubscribeReviews?.();
  }, [providerEmail]);

  const averageStars =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + (review.stars || 0), 0) /
          reviews.length
        ).toFixed(1)
      : null;

  const ReviewItem = ({ item }) => (
    <View style={styles.reviewCard}>
      <Text style={styles.stars}>{item.stars}/5 ⭐</Text>
      {item.text && <Text style={styles.reviewText}>{item.text}</Text>}
      <Text style={styles.reviewerEmail}>מאת: {item.reviewerEmail}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen
        options={{
          title: "ביקורות",
          headerTitleAlign: "center",
          headerStyle: {
            backgroundColor: "#333",
            height: HEADER_HEIGHT,
          },
          headerTintColor: "#fff",
          headerTitleStyle: styles.headerTitle,
        }}
      />
      <View style={styles.container}>
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

        <View
          style={[styles.content, { marginTop: Math.round(HEADER_HEIGHT) }]}
        >
          <View style={styles.profileSection}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.defaultProfileImage}>
                <Ionicons
                  name="person-circle-outline"
                  size={SCREEN_WIDTH * 0.2}
                  color="#ccc"
                />
              </View>
            )}
            <Text style={styles.providerName}>
              {providerName || "נותן השירות"}
            </Text>
            {averageStars && (
              <Text style={styles.averageRating}>{averageStars}/5 ⭐</Text>
            )}
          </View>

          {loading ? (
            <ActivityIndicator
              style={styles.loader}
              size="large"
              color="#C6A052"
            />
          ) : reviews.length === 0 ? (
            <Text style={styles.noReviews}>אין עדיין ביקורות</Text>
          ) : (
            <FlatList
              data={reviews}
              renderItem={({ item }) => <ReviewItem item={item} />}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.reviewsList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  content: {
    flex: 1,
    paddingHorizontal: Math.round(SCREEN_WIDTH * 0.05),
    marginTop: HEADER_HEIGHT,
  },
  headerTitle: {
    color: "#fff",
    fontSize: Math.round(SCREEN_WIDTH * 0.05),
    fontWeight: "bold",
    textAlign: "center",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: Math.round(SCREEN_HEIGHT * 0.03),
  },
  profileImage: {
    width: Math.round(SCREEN_WIDTH * 0.25),
    height: Math.round(SCREEN_WIDTH * 0.25),
    borderRadius: Math.round(SCREEN_WIDTH * 0.125),
    backgroundColor: "#eee",
  },
  defaultProfileImage: {
    width: Math.round(SCREEN_WIDTH * 0.25),
    height: Math.round(SCREEN_WIDTH * 0.25),
    borderRadius: Math.round(SCREEN_WIDTH * 0.125),
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  providerName: {
    fontSize: Math.round(SCREEN_WIDTH * 0.05),
    fontWeight: "bold",
    color: "#333",
    marginTop: Math.round(SCREEN_HEIGHT * 0.015),
    textAlign: "center",
  },
  averageRating: {
    fontSize: Math.round(SCREEN_WIDTH * 0.045),
    color: "#C6A052",
    marginTop: Math.round(SCREEN_HEIGHT * 0.01),
    fontWeight: "600",
    textAlign: "center",
  },
  reviewsList: {
    paddingBottom: Math.round(SCREEN_HEIGHT * 0.05),
  },
  reviewCard: {
    backgroundColor: "white",
    borderRadius: Math.round(SCREEN_WIDTH * 0.03),
    padding: Math.round(SCREEN_WIDTH * 0.04),
    marginBottom: Math.round(SCREEN_HEIGHT * 0.015),
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    writingDirection: "rtl",
  },
  stars: {
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    fontWeight: "bold",
    color: "#C6A052",
    textAlign: "right",
  },
  reviewText: {
    fontSize: Math.round(SCREEN_WIDTH * 0.035),
    color: "#333",
    marginTop: Math.round(SCREEN_HEIGHT * 0.01),
    textAlign: "right",
    lineHeight: Math.round(SCREEN_WIDTH * 0.05),
  },
  reviewerEmail: {
    fontSize: Math.round(SCREEN_WIDTH * 0.03),
    color: "#666",
    marginTop: Math.round(SCREEN_HEIGHT * 0.01),
    textAlign: "right",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noReviews: {
    textAlign: "center",
    color: "#666",
    fontSize: Math.round(SCREEN_WIDTH * 0.04),
    marginTop: Math.round(SCREEN_HEIGHT * 0.05),
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
