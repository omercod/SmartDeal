import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
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

const { width } = Dimensions.get("window");

const ProviderReviewsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const { providerEmail, providerName } = route.params || {};

  const [reviews, setReviews] = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-right" size={28} color="#333" />
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
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: width * 0.05,
  },
  headerBar: {
    marginTop: Platform.OS === "ios" ? 50 : 20,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileImage: {
    width: width * 0.28,
    height: width * 0.28,
    borderRadius: width * 0.14,
    backgroundColor: "#eee",
  },
  providerName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  averageRating: {
    fontSize: 18,
    color: "#C6A052",
    marginTop: 5,
    fontWeight: "600",
  },
  noReviews: {
    textAlign: "center",
    color: "#777",
    fontSize: 16,
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
  },
  stars: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C6A052",
  },
  text: {
    marginTop: 5,
    fontSize: 14,
    color: "#333",
  },
  email: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
    textAlign: "left",
  },
});

export default ProviderReviewsScreen;
