import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  I18nManager,
  ActivityIndicator,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { useLocalSearchParams } from "expo-router";
import {
  getDocs,
  collection,
  query,
  where,
  addDoc,
  getDoc,
  doc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../(auth)/firebase";
import { Slider } from "@miblanchard/react-native-slider";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT =
  Platform.OS === "ios" ? 44 : StatusBar.currentHeight + 40 || 56;

const ResultsScreen = () => {
  const { width: SCREEN_WIDTH } = useWindowDimensions();
  const CARD_WIDTH = Math.min(SCREEN_WIDTH * 0.92, 480);
  const CARD_PADDING = Platform.OS === "android" ? 10 : 12;
  const { category, subCategory, minPrice, maxPrice, location } =
    useLocalSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [sliderValues, setSliderValues] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [offerDetails, setOfferDetails] = useState({ price: "", note: "" });
  const [currentUserName, setCurrentUserName] = useState("משתמש מחובר");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState("לא זמין");
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showReadMore, setShowReadMore] = useState({});

  // Ensure RTL is enforced
  useEffect(() => {
    if (!I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
    }
  }, []);

  const closeModal = () => setIsModalVisible(false);

  const fetchUserNameByEmail = async (email) => {
    if (!email) {
      console.log("Email is not available");
      return;
    }

    try {
      const userQuery = query(
        collection(db, "Users"),
        where("email", "==", email)
      );
      const querySnapshot = await getDocs(userQuery);

      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userData = userDoc.data();

        return userData.name;
      } else {
        console.log("No user found with this email");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
      return null;
    }
  };
  const openModal = async (post) => {
    setSelectedPost(post);

    const email = post.userEmail;

    if (email) {
      const userName = await fetchUserNameByEmail(email);
      if (userName) {
        setSelectedUserName(userName);
      }
    } else {
      console.log("Email is missing in post");
    }

    setIsModalVisible(true);
  };

  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const allPostsSnapshot = await getDocs(collection(db, "Posts"));
        let postsArray = [];

        allPostsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const postId = doc.id;
          const postData = { id: postId, ...data };

          let cityMatch = true;
          let categoryMatch = true;
          let subCategoryMatch = true;
          let minPriceMatch = true;
          let maxPriceMatch = true;

          if (category && category !== "defaultCategory") {
            categoryMatch = data.mainCategory === category;
          }

          if (subCategory) {
            subCategoryMatch = data.subCategory === subCategory;
          }

          if (location && location.trim && location.trim() !== "") {
            const normalizedSearchLocation = location.trim().toLowerCase();
            const normalizedPostLocation = (data.city || "")
              .trim()
              .toLowerCase();

            cityMatch = normalizedPostLocation === normalizedSearchLocation;
          }

          let postPrice = 0;

          if (data.price !== undefined && data.price !== null) {
            if (typeof data.price === "number") {
              postPrice = data.price;
            } else if (typeof data.price === "string") {
              const cleanPriceStr = data.price.replace(/[^\d.-]/g, "");
              postPrice = parseFloat(cleanPriceStr) || 0;
            }
          }

          if (minPrice && minPrice !== "0") {
            const minPriceNum = parseInt(minPrice);
            minPriceMatch = postPrice >= minPriceNum;
          }

          if (maxPrice && maxPrice !== "1000000000") {
            const maxPriceNum = parseInt(maxPrice);
            maxPriceMatch = postPrice <= maxPriceNum;
          }

          const matchesAllCriteria =
            cityMatch &&
            categoryMatch &&
            subCategoryMatch &&
            minPriceMatch &&
            maxPriceMatch;

          if (matchesAllCriteria) {
            postsArray.push(postData);
          }
        });

        setPosts(postsArray);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [category, subCategory, minPrice, maxPrice, location]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const userDocRef = doc(db, "Users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            setCurrentUserName(userDoc.data().name);
          } else {
            console.log("No such user document!");
          }
        } else {
          console.log("No user is signed in");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleNextImage = (id) => {
    setCurrentImageIndices((prev) => {
      const post = posts.find((post) => post.id === id);
      if (!post) return prev;

      const postImages = [post.mainImage, ...(post.additionalImages || [])];

      const newIndex = Math.min((prev[id] || 0) + 1, postImages.length - 1);
      return { ...prev, [id]: newIndex };
    });
  };

  const handlePreviousImage = (id) => {
    setCurrentImageIndices((prev) => {
      const post = posts.find((post) => post.id === id);
      if (!post) return prev;

      const postImages = [post.mainImage, ...(post.additionalImages || [])];

      const newIndex = Math.max((prev[id] || 0) - 1, 0);
      return { ...prev, [id]: newIndex };
    });
  };

  const isAcceptedValue = (id, value) => {
    const post = posts.find((post) => post.id === id);
    if (!post) return false;

    const priceValue = parseFloat(post.price.replace(/[^\d.-]/g, "")) || 0;
    return Math.abs(value - priceValue) < 1; // Using a small threshold for floating point comparisons
  };

  const openOfferModal = async (postId, price) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        console.error("No authenticated user found!");
        return;
      }

      const selected = posts.find((post) => post.id === postId);
      if (currentUser.email === selected.userEmail) {
        alert(" לא ניתן להגיש הצעה לפוסט של עצמך .");
        return;
      }

      setOfferDetails({ ...offerDetails, price });
      setSelectedPost(selected);
      setIsOfferModalVisible(true);
    } catch (error) {
      console.error("Error opening offer modal:", error);
    }
  };

  const closeOfferModal = () => {
    setIsOfferModalVisible(false);
    setOfferDetails({ price: "", note: "" });
  };

  const submitProposal = async () => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      const proposalData = {
        jobType: selectedPost.mainCategory || "לא צוין",
        jobTitle: selectedPost.title || "לא צוין",
        providerName: currentUserName,
        providerEmail: currentUser.email,
        OfferPrice: offerDetails.price,
        note: offerDetails.note || "",
        clientName: selectedPost.userName || "לא צוין",
        clientEmail: selectedPost.userEmail || "לא צוין",
        createdAt: new Date().toISOString(),
        answer: 2,
      };

      await addDoc(collection(db, "Offers"), proposalData);
      alert("ההצעה נשלחה בהצלחה!");
    } catch (error) {
      console.error("Error submitting Offers:", error);
      alert("אירעה שגיאה בשליחת ההצעה. נסה שוב.");
    }

    closeOfferModal();
  };

  const renderPost = ({ item }) => {
    const allImages = [item.mainImage, ...(item.additionalImages || [])];
    const currentImageIndex = currentImageIndices[item.id] || 0;

    const resetSliderValue = () => {
      setSliderValues((prev) => ({
        ...prev,
        [item.id]: parseFloat(item.price.replace(/[^\d.-]/g, "")),
      }));
    };

    const handleCloseCard = () => {
      setExpandedCard(null);
    };

    const handleExpandCard = () => {
      setSliderValues((prev) => ({
        ...prev,
        [item.id]: parseFloat(item.price.replace(/[^\d.-]/g, "")),
      }));
      setExpandedCard(expandedCard === item.id ? null : item.id);
    };

    // Platform specific touch handling for better responsiveness
    const touchProps =
      Platform.OS === "android"
        ? {
            activeOpacity: 0.7,
            delayPressIn: 0,
            hitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
          }
        : {
            activeOpacity: 0.8,
          };

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.postContainer}>
          <View
            style={[
              styles.card,
              {
                minHeight:
                  expandedCard === item.id
                    ? Math.min(SCREEN_WIDTH * 1.1, 580)
                    : Math.min(SCREEN_WIDTH * 0.7, 280),
              },
            ]}
          >
            {expandedCard === item.id && (
              <TouchableOpacity
                style={styles.closeButtonCard}
                onPress={handleCloseCard}
                {...touchProps}
              >
                <Text style={styles.closeButtonTextCard}>✖</Text>
              </TouchableOpacity>
            )}
            <View style={styles.cardRow}>
              {/* Left side - image */}
              <View style={styles.cardImageWrapper}>
                {allImages[currentImageIndex] ? (
                  <Image
                    source={{ uri: allImages[currentImageIndex] }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noImageContainer}>
                    <MaterialIcons
                      name="image-not-supported"
                      size={70}
                      color="#C6A052"
                    />
                  </View>
                )}
                {item.additionalImages?.length > 0 && (
                  <>
                    <TouchableOpacity
                      style={styles.arrowLeft}
                      onPress={() => handlePreviousImage(item.id)}
                      {...touchProps}
                    >
                      <Icon
                        name={
                          I18nManager.isRTL ? "chevron-right" : "chevron-left"
                        }
                        size={Platform.OS === "android" ? 24 : 22}
                        color="white"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.arrowRight}
                      onPress={() => handleNextImage(item.id)}
                      {...touchProps}
                    >
                      <Icon
                        name={
                          I18nManager.isRTL ? "chevron-left" : "chevron-right"
                        }
                        size={Platform.OS === "android" ? 24 : 22}
                        color="white"
                      />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Right side - text */}
              <View style={styles.cardInfo}>
                <Text
                  style={styles.title}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.mainCategory}
                </Text>

                <Text
                  style={styles.Seccondtitle}
                  numberOfLines={showReadMore[item.id] ? 5 : 2}
                  ellipsizeMode="tail"
                  onTextLayout={(e) => {
                    if (
                      e.nativeEvent.lines.length > 2 &&
                      !showReadMore[item.id]
                    ) {
                      setShowReadMore((prev) => ({ ...prev, [item.id]: true }));
                    }
                  }}
                >
                  {item.title}
                </Text>

                {showReadMore[item.id] && (
                  <TouchableOpacity
                    onPress={() =>
                      setExpandedDescriptions((prev) => ({
                        ...prev,
                        [item.id]: !prev[item.id],
                      }))
                    }
                  >
                  </TouchableOpacity>
                )}

                <Text style={styles.price}>מחיר: {item.price}</Text>
                <Text style={styles.location}>מיקום: {item.city}</Text>
              </View>
            </View>

            {/* Button container - outside of the row layout */}
            {expandedCard !== item.id && (
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleExpandCard}
                  {...touchProps}
                >
                  <Text style={styles.buttonText}>מידע נוסף והגשת הצעה</Text>
                </TouchableOpacity>
              </View>
            )}

            {expandedCard === item.id && (
              <View style={styles.expandedContent}>
                <Text
                  style={styles.description}
                  numberOfLines={4}
                  ellipsizeMode="tail"
                >
                  {item.description}
                </Text>
                <View style={styles.sliderContainer}>
                  <Text style={styles.sliderText}>הגש הצעה:</Text>
                  <View
                    style={{
                      width: "100%",
                      paddingVertical: Platform.OS === "android" ? 15 : 0,
                      marginBottom: Platform.OS === "android" ? 0 : 0,
                      zIndex: 10,
                    }}
                    pointerEvents="box-none"
                  >
                    <Slider
                      style={[
                        styles.slider,
                        Platform.OS === "android" && {
                          transform: [{ scaleX: 0.95 }, { scaleY: 0.95 }],
                        },
                      ]}
                      minimumValue={Math.ceil(
                        parseFloat(item.price.replace(/[^\d.-]/g, "")) * 0.5
                      )}
                      maximumValue={Math.ceil(
                        parseFloat(item.price.replace(/[^\d.-]/g, "")) * 1.5
                      )}
                      step={getStepValue(item.price)}
                      value={
                        sliderValues[item.id] ||
                        parseFloat(item.price.replace(/[^\d.-]/g, ""))
                      }
                      onValueChange={(value) => {
                        // Round to nearest step for smoother sliding
                        const step = getStepValue(item.price);
                        const roundedValue = Math.round(value / step) * step;
                        setSliderValues((prev) => ({
                          ...prev,
                          [item.id]: roundedValue,
                        }));
                      }}
                      minimumTrackTintColor="#C6A052"
                      maximumTrackTintColor="#d3d3d3"
                      thumbTintColor="#C6A052"
                      thumbStyle={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#C6A052",
                        shadowColor: "#000",
                        shadowOffset: {
                          width: 0,
                          height: 2,
                        },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                      }}
                      trackStyle={{
                        height: 3,
                        borderRadius: 2,
                      }}
                      tapToSeek={true}
                      animateTransitions={true}
                      animationType="spring"
                    />
                  </View>
                </View>

                {isAcceptedValue(item.id, sliderValues[item.id]) ? (
                  <TouchableOpacity
                    style={styles.buttongood}
                    onPress={() => openModal(item)}
                    {...touchProps}
                  >
                    <Text style={styles.buttonText}>מקובל עליי</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.offerContainer}>
                    <TouchableOpacity
                      style={styles.buttongetoffers}
                      onPress={() =>
                        openOfferModal(item.id, sliderValues[item.id])
                      }
                      {...touchProps}
                    >
                      <Text style={styles.buttonText}>הגש הצעה</Text>
                    </TouchableOpacity>

                    <Text style={styles.sliderValue}>
                      ₪ {sliderValues[item.id]}
                    </Text>
                    <TouchableOpacity
                      style={styles.resetButton}
                      onPress={resetSliderValue}
                      {...touchProps}
                    >
                      <Text style={styles.resetButtonText}>איפוס</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  };

  const getStepValue = (price) => {
    const numericPrice = parseFloat(price.replace("₪", "").replace(",", ""));
    if (numericPrice < 100) return 5;
    if (numericPrice < 500) return 10;
    if (numericPrice < 2000) return 50;
    return 100;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#C6A052" />
        <Text style={styles.loadingText}>טוען...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
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
      <FlatList
        contentContainerStyle={styles.container}
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListEmptyComponent={
          <Text style={styles.emptyText}>לא נמצאו תוצאות</Text>
        }
        showsVerticalScrollIndicator={false}
        initialNumToRender={4}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === "android"}
        ListHeaderComponent={
          <View style={styles.filterBar}>
            <Text
              style={styles.filterText}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {[
                category && `${category}`,
                subCategory && `${subCategory}`,
                minPrice &&
                minPrice !== "0" &&
                minPrice !== 0 &&
                maxPrice &&
                maxPrice !== "1000000000" &&
                maxPrice !== 1000000000
                  ? `מחיר: ₪${minPrice} - ₪${maxPrice}`
                  : minPrice &&
                    minPrice !== "0" &&
                    minPrice !== 0 &&
                    `מחיר מינ: ₪${minPrice}`,
                maxPrice &&
                  maxPrice !== "1000000000" &&
                  maxPrice !== 0 &&
                  location &&
                  `מיקום: ${location}`,
              ]
                .filter(Boolean)
                .join(" , ") || "חיפוש: הכל"}
            </Text>
            <TouchableOpacity
              style={styles.filterIcon}
              onPress={() => router.push("/search")}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="tune" size={24} color="#C6A052" />
            </TouchableOpacity>
          </View>
        }
        ListFooterComponent={<View style={{ height: 20 }} />}
      />

      {/* Move the modals here, outside of FlatList */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={closeModal}
            ></TouchableOpacity>
            <Text style={styles.modalTitle}>עוד צעד קטן והעבודה שלך 👏</Text>
            {selectedPost && (
              <>
                <Text style={styles.modalText}>
                  <Text style={styles.boldLabel}>שם הלקוח: </Text>
                  {selectedUserName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.boldLabel}>פלאפון: </Text>
                  {selectedPost.phoneNumber || "לא זמין"}
                </Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={isOfferModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={closeOfferModal}
            >
              <Text style={styles.closeIconText}>×</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>סיכום ההצעה</Text>
            {selectedPost && (
              <>
                <Text style={styles.modalText}>
                  <Text style={styles.boldLabel}>שירות: </Text>
                  {selectedPost.subCategory}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.boldLabel}>נותן השירות: </Text>
                  {currentUserName}
                </Text>
                <Text style={styles.modalText}>
                  <Text style={styles.boldLabel}>מחיר מוצע: </Text>
                  {offerDetails.price} ₪
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="הוסף הערה..."
                  placeholderTextColor="#C6A052"
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="default"
                  value={offerDetails.note}
                  onChangeText={(text) =>
                    setOfferDetails((prev) => ({ ...prev, note: text }))
                  }
                />
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={submitProposal}
            >
              <Text style={styles.closeButtonText}>הגישו הצעה ללקוח</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    justifyContent: "flex-start",
    alignItems: "stretch",
    flexGrow: 1,
  },
  postContainer: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    padding: 5,
    width: "95%",
    backgroundColor: "white",
    borderRadius: Platform.OS === "android" ? 12 : 15,
    alignItems: "center",
    justifyContent: "flex-start",
    elevation: Platform.OS === "android" ? 6 : 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    alignSelf: "center",
    maxWidth: 480,
    paddingBottom: Platform.OS === "android" ? 40 : 45,
  },
  cardRow: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 10,
    paddingTop: 10,
    alignItems: "flex-start",
  },
  cardImageWrapper: {
    width: "45%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardInfo: {
    width: "50%",
    paddingVertical: 5,
  },
  title: {
    fontSize: Platform.OS === "android" ? 16 : 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginTop: 5,
    writingDirection: "rtl",
  },
  Seccondtitle: {
    fontSize: Platform.OS === "android" ? 14 : 14,
    marginTop: 4,
    color: "#333",
    textAlign: "right",
    lineHeight: 20,
    writingDirection: "rtl",
  },
  price: {
    marginTop: 6,
    fontSize: Platform.OS === "android" ? 15 : 15,
    color: "#333",
    textAlign: "right",
    fontWeight: "600",
    writingDirection: "rtl",
  },
  location: {
    marginTop: 4,
    marginBottom: 4,
    fontSize: Platform.OS === "android" ? 15 : 15,
    textAlign: "right",
    writingDirection: "rtl",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "flex-end",
    marginTop: 15,
    paddingRight: Platform.OS === "android" ? 12 : 15,
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#C6A052",
    paddingVertical: Platform.OS === "android" ? 8 : 10,
    paddingHorizontal: Platform.OS === "android" ? 16 : 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    alignSelf: "flex-end",
  },
  buttonText: {
    fontSize: Platform.OS === "android" ? 12 : 13,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  description: {
    fontSize: Platform.OS === "android" ? 13 : 14,
    color: "#555",
    textAlign: "right",
    paddingHorizontal: 10,
    lineHeight: 20,
    writingDirection: "rtl",
  },
  sliderContainer: {
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 15,
  },
  sliderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C6A052",
    marginTop: 2,
  },
  slider: {
    width: Platform.OS === "android" ? "100%" : "90%",
    height:
      Platform.OS === "android" ? SCREEN_WIDTH * 0.01 : SCREEN_WIDTH * 0.01,
    flexShrink: 1,
    marginBottom: 0,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  offerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Platform.OS === "android" ? 12 : 15,
    marginTop: 15,
    marginBottom: 25,
    flexWrap: "wrap",
    paddingHorizontal: 10,
  },
  noImageContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
  },
  buttongood: {
    backgroundColor: "#C6A052",
    paddingVertical: Platform.OS === "android" ? 10 : 12,
    paddingHorizontal: Platform.OS === "android" ? 20 : 24,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 10,
    alignSelf: "center",
  },
  buttongetoffers: {
    paddingVertical: Platform.OS === "android" ? 10 : 12,
    paddingHorizontal: Platform.OS === "android" ? 22 : 26,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C6A052",
  },
  resetButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  expandedContent: {
    width: "100%",
    paddingVertical: 10,
    flex: 1,
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: Platform.OS === "android" ? "90%" : "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: Platform.OS === "android" ? 15 : 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#C6A052",
  },
  modalText: {
    fontSize: Platform.OS === "android" ? 14 : 16,
    marginVertical: 5,
    color: "#333",
    textAlign: "center",
  },
  boldLabel: {
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#C6A052",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  arrowLeft: {
    position: "absolute",
    top: "45%",
    left: 10,
    transform: [{ translateY: -10 }],
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: Platform.OS === "android" ? 12 : 10,
    borderRadius: 20,
  },
  arrowRight: {
    position: "absolute",
    top: "45%",
    right: 10,
    transform: [{ translateY: -10 }],
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: Platform.OS === "android" ? 12 : 10,
    borderRadius: 20,
  },
  closeButtonCard: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.3)",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonTextCard: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  filterBar: {
    marginTop: Platform.OS === "android" ? 130 : 110,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: "95%",
    alignSelf: "center",
    elevation: Platform.OS === "android" ? 4 : 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    maxWidth: 480,
  },
  filterText: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
    paddingRight: 5,
    textAlign: "right",
    writingDirection: "rtl",
  },
  filterIcon: {
    padding: 5,
  },
  textInput: {
    height: Platform.OS === "android" ? 120 : 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
    marginTop: 10,
    width: "100%",
    textAlign: "right",
    textAlignVertical: "top",
    minHeight: 120,
    maxHeight: 200,
    fontSize: 14,
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1,
    backgroundColor: "transparent",
    padding: 5,
  },
  closeIconText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#C6A052",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 20,
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
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingTop: Platform.OS === "android" ? 0 : 0,
  },
});

export default ResultsScreen;
