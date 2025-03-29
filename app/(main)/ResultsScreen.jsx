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
import { useLocalSearchParams } from "expo-router";
import { getDocs, collection, query, where, addDoc } from "firebase/firestore";
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

  const handleNextImage = (postId, images) => {
    setCurrentImageIndices((prev) => ({
      ...prev,
      [postId]: prev[postId] < images.length - 1 ? prev[postId] + 1 : 0,
    }));
  };

  const handlePreviousImage = (postId, images) => {
    setCurrentImageIndices((prev) => ({
      ...prev,
      [postId]: prev[postId] > 0 ? prev[postId] - 1 : images.length - 1,
    }));
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
    const selected = posts.find((post) => post.id === postId);
    setOfferDetails({ ...offerDetails, price });
    setSelectedPost(selected);
    setIsOfferModalVisible(true);
  };

  const closeOfferModal = () => {
    setIsOfferModalVisible(false);
    setOfferDetails({ price: "", note: "" });
  };

  const submitProposal = async () => {
    // יישום דומה לקוד מהמסך הקודם
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
      setExpandedCard(expandedCard === item.id ? null : item.id);
    };

    return (
      <View
        style={[
          styles.card,
          {
            height:
              expandedCard === item.id
                ? SCREEN_WIDTH * 1.1
                : SCREEN_WIDTH * 0.8,
          },
        ]}
      >
        {expandedCard === item.id && (
          <TouchableOpacity
            style={styles.closeButtonCard}
            onPress={handleCloseCard}
          >
            <Text style={styles.closeButtonTextCard}>✖</Text>
          </TouchableOpacity>
        )}

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: allImages[currentImageIndex] }}
            style={styles.image}
          />
          {item.additionalImages?.length > 0 && (
            <>
              <TouchableOpacity
                style={styles.arrowLeft}
                onPress={() => handlePreviousImage(item.id, allImages)}
              >
                <Icon name="chevron-left" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.arrowRight}
                onPress={() => handleNextImage(item.id, allImages)}
              >
                <Icon name="chevron-right" size={24} color="white" />
              </TouchableOpacity>
            </>
          )}

          {item.additionalImages?.length > 0 && (
            <View style={styles.dotsContainer}>
              {allImages.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentImageIndex === index && styles.activeDot,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <Text style={styles.title}>{item.mainCategory}</Text>
        <Text style={styles.Seccondtitle}>{item.title}</Text>
        <Text style={styles.price}>מחיר: {item.price}</Text>
        <Text style={styles.location}>מיקום: {item.city}</Text>

        {expandedCard !== item.id && (
          <TouchableOpacity style={styles.button} onPress={handleExpandCard}>
            <Text style={styles.buttonText}>מידע נוסף והגשת הצעה</Text>
          </TouchableOpacity>
        )}

        {expandedCard === item.id && (
          <View style={styles.expandedContent}>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderText}>הגש הצעה:</Text>
              <Slider
                style={styles.slider}
                minimumValue={Math.ceil(
                  Math.round(item.price.replace("₪", "").replace(",", "") * 0.5)
                )}
                maximumValue={Math.floor(
                  Math.round(item.price.replace("₪", "").replace(",", "") * 1.2)
                )}
                step={1}
                value={
                  sliderValues[item.id] ||
                  Math.round(item.price.replace("₪", "").replace(",", ""))
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

            {isAcceptedValue(item.id, sliderValues[item.id]) ? (
              <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>מקובל עליי</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.offerContainer}>
                <TouchableOpacity
                  style={styles.buttongetoffers}
                  onPress={() => openOfferModal(item.id, sliderValues[item.id])}
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
    );
  };

  if (loading) {
    return <Text>טוען...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>תוצאות חיפוש</Text>
      <FlatList
        horizontal
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListEmptyComponent={
          <Text style={styles.emptyText}>לא נמצאו תוצאות</Text>
        }
        showsHorizontalScrollIndicator={false}
      />

      {/* מודאל להגשת הצעה */}
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
                  שם נותן השירות: {currentUserName}
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
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    padding: 16,
  },
  titletop: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginLeft: 20,
  },
  card: {
    marginTop: 20,
    marginBottom: 20,
    width: SCREEN_WIDTH * 0.8,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    elevation: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    width: "100%",
    height: 150,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    paddingHorizontal: 15,
  },
  Seccondtitle: {
    fontSize: 18,
    marginTop: 4,
    color: "#333",
    textAlign: "center",
    paddingHorizontal: 15,
  },
  price: {
    marginTop: 6,
    fontSize: 16,
    color: "#C6A052",
    paddingHorizontal: 15,
  },
  location: {
    fontSize: 14,
    color: "#666",
    paddingHorizontal: 15,
    padding: 7,
  },
  button: {
    backgroundColor: "#C6A052",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    margin: 15,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "white",
  },
  description: {
    fontSize: 11,
    color: "#555",
    textAlign: "center",
    flexShrink: 1,
    overflow: "hidden",
  },
  arrowLeft: {
    position: "absolute",
    left: 10,
    top: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 15,
    zIndex: 2,
  },
  arrowRight: {
    position: "absolute",
    right: 10,
    top: "50%",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 15,
    zIndex: 2,
  },
  arrowText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 4,
    borderWidth: 2,
    borderColor: "#C6A052",
  },
  activeDot: {
    backgroundColor: "#C6A052",
    borderColor: "#C6A052",
  },
});
