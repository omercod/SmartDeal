import React, { useState, useEffect } from "react";
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
import Slider from "@react-native-community/slider";
import Icon from "react-native-vector-icons/FontAwesome";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function ResultsScreen() {
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
  const [isModalVisible, setIsModalVisible] = useState(false); // כדי לשלוט בהצגת המודל
  const [selectedUserName, setSelectedUserName] = useState("לא זמין");

  const closeModal = () => setIsModalVisible(false); // פונקציה לסגור את המודל

  // פונקציה לפתוח את המודל

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
      } else {
        setSelectedUserName("לא זמין");
      }
    } else {
      console.log("Email is missing in post");
      setSelectedUserName("לא זמין"); // הוסף טיפול במקרה שאין אימייל
    }

    setIsModalVisible(true); // העבר את setIsModalVisible(true) לכאן
  };

  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // קודם נטען את כל הפוסטים
        const allPostsSnapshot = await getDocs(collection(db, "Posts"));
        let postsArray = [];

        // סינון מפורט
        allPostsSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          const postId = doc.id;
          const postData = { id: postId, ...data };

          // בדיקת כל הקריטריונים
          let cityMatch = true;
          let categoryMatch = true;
          let subCategoryMatch = true;
          let minPriceMatch = true;
          let maxPriceMatch = true;

          // בדיקת קטגוריה ראשית
          if (category && category !== "defaultCategory") {
            categoryMatch = data.mainCategory === category;
          }

          // בדיקת תת-קטגוריה
          if (subCategory) {
            subCategoryMatch = data.subCategory === subCategory;
          }

          // בדיקת מיקום
          if (location && location.trim && location.trim() !== "") {
            const normalizedSearchLocation = location.trim().toLowerCase();
            const normalizedPostLocation = (data.city || "")
              .trim()
              .toLowerCase();

            cityMatch = normalizedPostLocation === normalizedSearchLocation;
          }

          // טיפול במחיר בצורה בטוחה
          let postPrice = 0;

          if (data.price !== undefined && data.price !== null) {
            if (typeof data.price === "number") {
              postPrice = data.price;
            } else if (typeof data.price === "string") {
              const cleanPriceStr = data.price.replace(/[^\d.-]/g, "");
              postPrice = parseFloat(cleanPriceStr) || 0;
            }
          }

          // בדיקת מחיר מינימלי
          if (minPrice && minPrice !== "0") {
            const minPriceNum = parseInt(minPrice);
            minPriceMatch = postPrice >= minPriceNum;
          }

          // בדיקת מחיר מקסימלי
          if (maxPrice && maxPrice !== "1000000000") {
            const maxPriceNum = parseInt(maxPrice);
            maxPriceMatch = postPrice <= maxPriceNum;
          }

          // האם הפוסט עומד בכל הקריטריונים
          const matchesAllCriteria =
            cityMatch &&
            categoryMatch &&
            subCategoryMatch &&
            minPriceMatch &&
            maxPriceMatch;

          // אם הפוסט מתאים לכל הקריטריונים, הוסף אותו למערך
          if (matchesAllCriteria) {
            postsArray.push(postData);
          }
        });

        setPosts(postsArray); // עדכון הפוסטים אחרי סינון
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
      // מצא את הפוסט הנוכחי כדי לקבל את התמונות שלו
      const post = posts.find((post) => post.id === id);
      if (!post) return prev;

      // חשב את כל התמונות עבור פוסט זה
      const postImages = [post.mainImage, ...(post.additionalImages || [])];

      const newIndex = Math.min((prev[id] || 0) + 1, postImages.length - 1);
      return { ...prev, [id]: newIndex };
    });
  };

  const handlePreviousImage = (id) => {
    setCurrentImageIndices((prev) => {
      // מצא את הפוסט הנוכחי כדי לקבל את התמונות שלו
      const post = posts.find((post) => post.id === id);
      if (!post) return prev;

      // חשב את כל התמונות עבור פוסט זה
      const postImages = [post.mainImage, ...(post.additionalImages || [])];

      const newIndex = Math.max((prev[id] || 0) - 1, 0);
      return { ...prev, [id]: newIndex };
    });
  };

  const isAcceptedValue = (id, value) => {
    const priceValue = parseFloat(
      posts
        .find((post) => post.id === id)
        ?.price.replace("₪", "")
        .replace(",", "")
    );
    return value === priceValue;
  };

  const openOfferModal = async (postId, price) => {
    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        console.error("No authenticated user found!");
        return;
      }

      // בדיקה אם המשתמש המחובר הוא בעל הפוסט
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
        [item.id]: parseFloat(item.price.replace("₪", "").replace(",", "")),
      }));
    };

    const handleCloseCard = () => {
      setExpandedCard(null);
    };

    const handleExpandCard = () => {
      setSliderValues((prev) => ({
        ...prev,
        [item.id]: parseFloat(item.price.replace("₪", "").replace(",", "")),
      }));
      setExpandedCard(expandedCard === item.id ? null : item.id);
    };
    return (
      <View>
        {/* התוכן שלך כאן */}
        <View
          style={[
            styles.card,
            {
              height:
                expandedCard === item.id
                  ? SCREEN_WIDTH * 0.9
                  : SCREEN_WIDTH * 0.45,
            },
          ]}
        >
          {/* כפתור סגירה בחלק הימני העליון של הכרטיס */}
          {expandedCard === item.id && (
            <TouchableOpacity
              style={styles.closeButtonCard}
              onPress={handleCloseCard}
            >
              <Text style={styles.closeButtonTextCard}>✖</Text>
            </TouchableOpacity>
          )}
          {/* התוכן של כרטיס */}
          <View
            style={{
              flexDirection: "row",
              width: "100%",
              paddingHorizontal: 10,
              paddingTop: 10,
            }}
          >
            {/* צד שמאל - תמונה */}
            <View
              style={{
                width: "45%",
                height: SCREEN_WIDTH * 0.4,
                borderRadius: 10,
                overflow: "hidden",
                marginRight: 10,
              }}
            >
              <Image
                source={{ uri: allImages[currentImageIndex] }}
                style={{ width: "100%", height: "100%", resizeMode: "cover" }}
              />
              {item.additionalImages?.length > 0 && (
                <>
                  <TouchableOpacity
                    style={styles.arrowLeft}
                    onPress={() => handlePreviousImage(item.id)}
                  >
                    <Icon name="chevron-left" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.arrowRight}
                    onPress={() => handleNextImage(item.id)}
                  >
                    <Icon name="chevron-right" size={24} color="white" />
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* צד ימין - טקסט */}
            <View style={{ width: "50%", paddingVertical: 5 }}>
              <Text style={[styles.title, { textAlign: "left" }]}>
                {item.mainCategory}
              </Text>
              <Text style={[styles.Seccondtitle, { textAlign: "left" }]}>
                {item.title}
              </Text>
              <Text style={[styles.price, { textAlign: "left" }]}>
                מחיר: {item.price}
              </Text>
              <Text style={[styles.location, { textAlign: "left" }]}>
                מיקום: {item.city}
              </Text>

              {/* כפתור להרחבת הכרטיס */}
              {expandedCard !== item.id && (
                <TouchableOpacity
                  style={[styles.button]}
                  onPress={handleExpandCard}
                >
                  <Text style={styles.buttonText}>מידע נוסף והגשת הצעה</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* תוכן מורחב */}
          {expandedCard === item.id && (
            <View style={styles.expandedContent}>
              {/* תוכן של סליידר */}
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderText}>הגש הצעה:</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={Math.ceil(
                    Math.round(
                      item.price.replace("₪", "").replace(",", "") * 0.5
                    )
                  )}
                  maximumValue={Math.floor(
                    Math.round(
                      item.price.replace("₪", "").replace(",", "") * 1.2
                    )
                  )}
                  step={1}
                  value={
                    sliderValues[item.id] ||
                    parseFloat(item.price.replace("₪", "").replace(",", ""))
                  }
                  minimumTrackTintColor="#C6A052"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#C6A052"
                  onValueChange={(value) => {
                    setSliderValues((prev) => ({
                      ...prev,
                      [item.id]: value,
                    }));
                  }}
                />
              </View>

              {/* הצגת כפתור להגיש הצעה */}
              {isAcceptedValue(item.id, sliderValues[item.id]) ? (
                <TouchableOpacity
                  style={styles.buttongood}
                  onPress={() => openModal(item)}
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
                  >
                    <Text style={styles.buttonText}>הגש הצעה</Text>
                  </TouchableOpacity>

                  <Text style={styles.sliderValue}>
                    ₪ {sliderValues[item.id]}
                  </Text>
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetSliderValue}
                  >
                    <Text style={styles.resetButtonText}>איפוס</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        </View>

        {/* מודאל להצגת הצעה */}
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
                    שירות: {selectedPost.subCategory}
                  </Text>
                  <Text style={styles.modalText}>
                    שם נותן השירות : {currentUserName}
                  </Text>
                  <Text style={styles.modalText}>
                    מחיר מוצע: {offerDetails.price} ₪
                  </Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="הוסף הערה..."
                    placeholderTextColor="#C6A052"
                    multiline={true}
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
                <Text style={styles.closeButtonText}>הגישו הצעה ללקוח </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* פרטים לאחר לחיצה על מקובל עליי   */}
        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
                <Text style={styles.closeIconText}>×</Text>
              </TouchableOpacity>

              <Text style={styles.modalTitle}>עוד צעד קטן והעבודה שלך 👏</Text>
              {selectedPost ? (
                <>
                  <Text style={styles.modalText}>
                    שם הלקוח: {selectedUserName || "לא זמין"}
                  </Text>
                  <Text style={styles.modalText}>
                    פלאפון: {selectedPost.phoneNumber || "לא זמין"}
                  </Text>
                </>
              ) : (
                <Text style={styles.modalText}>הנתונים אינם זמינים</Text>
              )}

              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>סגור</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  if (loading) {
    return <Text>טוען...</Text>;
  }

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={posts}
      keyExtractor={(item) => item.id}
      renderItem={renderPost}
      ListEmptyComponent={<Text style={styles.emptyText}>לא נמצאו תוצאות</Text>}
      ListHeaderComponent={
        <View style={styles.filterBar}>
          <Text style={styles.filterText}>
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
          >
            <Icon name="sliders" size={24} color="#C6A052" />
          </TouchableOpacity>
        </View>
      }
      ListFooterComponent={null}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    justifyContent: "flex-start",
    alignItems: "stretch",
    flexGrow: 1,
    paddingBottom: 40,
  },
  titletop: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: 20,
  },
  card: {
    marginTop: 7,
    padding: 5,
    width: "95%",
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "flex-start",
    elevation: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    marginLeft: 10,
  },

  imageContainer: {
    width: "50%",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    flexDirection: "row",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    flexShrink: 1, // מאפשר לטקסט להתכווץ
  },
  Seccondtitle: {
    fontSize: 14,
    marginTop: 4,
    color: "#333",
    textAlign: "center",
    flexShrink: 1, // מאפשר לטקסט להתכווץ
  },

  price: {
    marginTop: 6,
    fontSize: 15,
    color: "#333",
  },

  location: {
    padding: 7,

    fontSize: 15,
  },

  button: {
    backgroundColor: "#C6A052",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },

  buttonText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "white",
  },

  description: {
    fontSize: 11,
    color: "#555",
    textAlign: "center",
    overflow: "hidden",
    flexShrink: 0,
    whiteSpace: "nowrap",
    padding: 10,
  },

  sliderContainer: {
    alignItems: "center",
  },

  sliderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C6A052",
    marginTop: 10,
  },

  slider: {
    width: 260,
    height: 30,
    flexShrink: 1,
    overflow: "hidden",
  },

  sliderValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },

  offerContainer: {
    gap: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginTop: 20,
  },

  button: {
    backgroundColor: "#C6A052",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  buttongood: {
    backgroundColor: "#C6A052",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#C6A052",
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#333",
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
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    width: "100%",
    zIndex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff",
    margin: 5,
    borderWidth: 2,
    borderColor: "#C6A052",
  },
  activeDot: {
    backgroundColor: "#C6A052",
    borderColor: "#C6A052",
  },

  textInput: {
    height: 100,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    width: "100%",
    textAlign: "right",
    paddingBottom: 60,
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
  noImageContainer: {
    width: 320,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  noImageIcon: {
    fontSize: 40,
    color: "#888",
  },
  noImageText: {
    marginTop: 10,
    fontSize: 16,
    color: "#C6A052",
    fontWeight: "bold",
  },
  offerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginLeft: 50,
  },
  buttongetoffers: {
    paddingVertical: 8,
    paddingHorizontal: 20,
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
  loadingContainer: {
    backgroundColor: "#f9f9f9",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  circleContainer: {
    position: "relative",
  },

  loadingText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#C6A052",
    letterSpacing: 1.5,
  },
  arrowLeft: {
    position: "absolute",
    top: "45%",
    left: 20,
    transform: [{ translateY: -10 }],
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 20,
  },
  arrowRight: {
    position: "absolute",
    top: "45%",
    right: 20,
    transform: [{ translateY: -10 }],
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 20,
  },

  closeButtonCard: {
    position: "absolute",
    top: 190,
    left: 10,
    padding: 10,
    borderRadius: 20,
    zIndex: 1,
  },

  filterBar: {
    marginTop: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 10,
    width: "95%",
    alignSelf: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    paddingTop: 10,
    paddingBottom: 10,
  },
  filterText: {
    fontSize: 14,
    color: "#333",
    flexShrink: 1,
  },
  filterIcon: {
    padding: 5,
  },
  contentRow: {
    flexDirection: "row-reverse",
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingTop: 10,
    flex: 1,
  },

  imageContainerRight: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    marginLeft: 10,
  },

  textContainerLeft: {
    width: "48%",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    paddingVertical: 5,
  },

  textAlign: {
    textAlign: "right",
    width: "100%",
  },

  buttonInRow: {
    backgroundColor: "#C6A052",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    alignSelf: "flex-start",
  },

  // You might need to modify your existing expandedContent style
  expandedContent: {
    width: "100%",
    paddingHorizontal: 10,
  },
});
