import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import { getDocs, collection, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Slider from "@react-native-community/slider";
import { db } from "../(auth)/firebase";

const UserPage = () => {
  const [posts, setPosts] = useState([]);
  const [sliderValues, setSliderValues] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [offerDetails, setOfferDetails] = useState({ price: "", note: "" });
  const [currentUserName, setCurrentUserName] = useState("משתמש מחובר");

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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Posts"));
        const postsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const initialSliderValues = {};
        postsArray.forEach((post) => {
          const priceValue = parseFloat(
            post.price.replace("₪", "").replace(",", "")
          );
          initialSliderValues[post.id] = priceValue;
        });
        setPosts(postsArray);
        setSliderValues(initialSliderValues);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };
    fetchPosts();
  }, []);

  const handleSliderChange = (id, value) => {
    setSliderValues((prev) => ({ ...prev, [id]: value }));
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

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  const openOfferModal = (postId, price) => {
    const selected = posts.find((post) => post.id === postId);
    setOfferDetails({ ...offerDetails, price });
    setSelectedPost(selected);
    setIsOfferModalVisible(true);
  };

  const closeOfferModal = () => {
    setIsOfferModalVisible(false);
    setOfferDetails({ price: "", note: "" });
  };

  // פונקציות לשליטה בתמונות
  const images = [
    "https://via.placeholder.com/300x200.png?text=תמונה+1",
    "https://via.placeholder.com/300x200.png?text=תמונה+2",
    "https://via.placeholder.com/300x200.png?text=תמונה+3",
  ];

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <FlatList
        horizontal
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const priceValue = parseFloat(
            item.price.replace("₪", "").replace(",", "")
          );
          const minValue = priceValue * 0.5;
          const maxValue = priceValue * 1.2;

          return (
            <View style={styles.card}>
              <View style={styles.imageContainer}>
                <ScrollView
                  horizontal
                  pagingEnabled
                  onMomentumScrollEnd={(e) => {
                    const contentOffsetX = e.nativeEvent.contentOffset.x;
                    const newIndex = Math.floor(contentOffsetX / 320);
                    setCurrentImageIndex(newIndex);
                  }}
                  showsHorizontalScrollIndicator={false}
                >
                  {images.map((imageUri, index) => (
                    <Image
                      key={index}
                      source={{ uri: imageUri }}
                      style={styles.image}
                    />
                  ))}
                </ScrollView>

                <View style={styles.dotsContainer}>
                  {images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleImageChange(index)}
                      style={[
                        styles.dot,
                        index === currentImageIndex && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <Text style={styles.categoryPrimary}>{item.mainCategory}</Text>
              <Text style={styles.categorySecondary}>{item.subCategory}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.location}>מיקום: </Text>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>מחיר נדרש:</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderText}>הגש הצעה:</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={minValue}
                  maximumValue={maxValue}
                  step={10}
                  value={sliderValues[item.id]}
                  minimumTrackTintColor="#C6A052"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#C6A052"
                  onValueChange={(value) => handleSliderChange(item.id, value)}
                />
              </View>

              {isAcceptedValue(item.id, sliderValues[item.id]) ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => openModal(item)}
                >
                  <Text style={styles.buttonText}>מקובל עליי</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.offerContainer}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() =>
                      openOfferModal(item.id, sliderValues[item.id])
                    }
                  >
                    <Text style={styles.buttonText}>הגש הצעה</Text>
                  </TouchableOpacity>
                  <Text style={styles.sliderValue}>
                    {sliderValues[item.id]?.toFixed(2)} ₪
                  </Text>
                </View>
              )}
            </View>
          );
        }}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={320}
      />

      {/* פופאפ - פרטי הצעת עבודה */}
      <Modal visible={isOfferModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* כפתור איקס */}
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
                  עבודה: {selectedPost.subCategory}
                </Text>
                <Text style={styles.modalText}>
                  שם נותן השירות : {currentUserName} {/* כאן מציגים את השם */}
                </Text>
                <Text style={styles.modalText}>
                  מחיר מוצע: {offerDetails.price} ₪
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="הוסף הערה..."
                  placeholderTextColor="#C6A052"
                  value={offerDetails.note}
                  onChangeText={(text) =>
                    setOfferDetails((prev) => ({ ...prev, note: text }))
                  }
                />
              </>
            )}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeOfferModal}
            >
              <Text style={styles.closeButtonText}>הגש הצעה ללקוח </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* פופאפ - פרטי המשרה */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* כפתור איקס */}
            <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
              <Text style={styles.closeIconText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>עוד צעד קטן והעבודה שלך 👏</Text>
            {selectedPost && (
              <>
                <Text style={styles.modalText}>
                  שם מציע העבודה: {selectedPost.title}
                </Text>
                <Text style={styles.modalText}>פלאפון: 050-1234567</Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // צבע הרקע של הקונטיינר
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // צבע הרקע השקוף למחצה של ה-modal
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white", // צבע הרקע של התוכן בתוך ה-modal
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },

  card: {
    marginTop: 100,
    width: 320,
    height: 620,
    marginHorizontal: 15,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 },
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    borderWidth: 2,
    borderColor: "#C6A052",
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  image: {
    width: 320,
    height: 180,
  },
  categoryPrimary: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C6A052",
    marginBottom: 5,
    textTransform: "uppercase",
  },
  categorySecondary: {
    fontSize: 12,
    color: "#888",
    marginBottom: 5,
    fontStyle: "italic",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  location: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  priceLabel: {
    fontSize: 16,
    color: "#C6A052",
    fontWeight: "bold",
    marginRight: 5,
  },
  price: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  sliderContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sliderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C6A052",
    marginBottom: 10,
  },
  slider: {
    width: 280,
    height: 30,
  },
  offerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  button: {
    backgroundColor: "#C6A052",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    position: "absolute",
    bottom: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffff",
    margin: 5,
  },
  activeDot: {
    backgroundColor: "#C6A052",
  },
  textInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    width: "100%",
    textAlign: "right",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 1, // להבטיח שהאייקון יישאר מעל כל אלמנט אחר
    backgroundColor: "transparent",
    padding: 5,
  },
  closeIconText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#C6A052",
  },
});

export default UserPage;
