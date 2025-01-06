import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  ScrollView,
  TextInput,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  query,
  where,
  addDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Slider from "@react-native-community/slider";
import { db } from "../(auth)/firebase";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const UserPage = () => {
  const [posts, setPosts] = useState([]);
  const [sliderValues, setSliderValues] = useState({});
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);
  const [offerDetails, setOfferDetails] = useState({ price: "", note: "" });
  const [currentUserName, setCurrentUserName] = useState("משתמש מחובר");
  const [selectedUserName, setSelectedUserName] = useState("");
  const [isImageScrollActive, setIsImageScrollActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false); // state לסיום
  const navigation = useNavigation();
  const [activeScrollArea, setActiveScrollArea] = useState("cards");
  const [currentImageIndices, setCurrentImageIndices] = useState({});

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

  const submitProposal = async () => {
    if (!selectedPost || !offerDetails.price || !currentUserName) {
      console.log("Missing required information for submission");
      return;
    }
    const userName = await fetchUserNameByEmail(selectedPost.userEmail);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        console.error("No authenticated user found!");
        return;
      }

      const proposalData = {
        jobType: selectedPost.mainCategory || "לא צוין",
        jobTitle: selectedPost.title || "לא צוין",
        providerName: currentUserName,
        providerEmail: currentUser.email,
        OfferPrice: offerDetails.price,
        note: offerDetails.note || "",
        clientName: userName,
        clientEmail: selectedPost.userEmail || "לא צוין",
        createdAt: new Date().toISOString(),
        answer: 2,
      };

      await addDoc(collection(db, "Offers"), proposalData);

      console.log("Offers successfully submitted:", proposalData);
      alert("ההצעה נשלחה בהצלחה!");
    } catch (error) {
      console.error("Error submitting Offers:", error);
      alert("אירעה שגיאה בשליחת ההצעה. נסה שוב.");
    }

    closeOfferModal();
  };

  useEffect(() => {
    let progressValue = 0;
    const interval = setInterval(() => {
      progressValue += 20;
      setProgress(progressValue);
      if (progressValue >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsLoading(false);
          setIsComplete(true);
        }, 500);
      }
    }, 500);
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

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Posts"));
        const postsArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const initialImageIndices = {};
        postsArray.forEach((post) => {
          initialImageIndices[post.id] = 0;
        });

        const initialSliderValues = {};
        postsArray.forEach((post) => {
          const priceValue = parseFloat(
            post.price.replace("₪", "").replace(",", "")
          );
          initialSliderValues[post.id] = priceValue;
        });
        setPosts(postsArray);
        setCurrentImageIndices(initialImageIndices);
        setSliderValues(initialSliderValues);
      } catch (error) {
        console.error("Error fetching posts: ", error);
        setIsLoading(false); // עדכון שהטעינה הסתיימה גם במקרה של שגיאה
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

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
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

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <View style={styles.circleContainer}>
          <AnimatedCircularProgress
            size={120}
            width={10}
            fill={progress}
            tintColor="#C6A052"
            backgroundColor="#d3d3d3"
          />
        </View>
        <Text style={styles.loadingText}>
          מחפש את הצעות העבודה המשתלמות בשבילך...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titletop}>דרושים:</Text>
      <FlatList
        horizontal
        data={posts}
        keyExtractor={(item) => item.id}
        onTouchStart={() => setActiveScrollArea("cards")}
        renderItem={({ item }) => {
          const allImages = [item.mainImage, ...(item.additionalImages || [])];
          const currentImageIndex = currentImageIndices[item.id] || 0;
          const resetSliderValue = () => {
            setSliderValues((prev) => ({
              ...prev,
              [item.id]: parseFloat(
                item.price.replace("₪", "").replace(",", "")
              ),
            }));
          };

          return (
            <View style={[styles.card, { width: SCREEN_WIDTH * 0.85 }]}>
              <View
                style={styles.imageContainer}
                onTouchStart={() => setActiveScrollArea("images")}
                onTouchEnd={() => setActiveScrollArea("cards")}
              >
                {item.mainImage || item.additionalImages?.length > 0 ? (
                  <View>
                    <Image
                      source={{
                        uri:
                          item.additionalImages && currentImageIndex > 0
                            ? item.additionalImages[currentImageIndex - 1]
                            : item.mainImage,
                      }}
                      style={styles.image}
                    />
                    {item.additionalImages?.length > 0 && (
                      <>
                        <TouchableOpacity
                          style={styles.arrowLeft}
                          onPress={() =>
                            handlePreviousImage(item.id, allImages)
                          }
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
                    <View style={styles.dotsContainer}>
                      {[item.mainImage, ...(item.additionalImages || [])].map(
                        (_, index) => (
                          <View
                            key={index}
                            style={[
                              styles.dot,
                              currentImageIndex === index && styles.activeDot,
                            ]}
                          />
                        )
                      )}
                    </View>
                  </View>
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageIcon}>📷</Text>
                    <Text style={styles.noImageText}>אין תמונות</Text>
                  </View>
                )}
              </View>

              <Text style={styles.categoryPrimary}>{item.mainCategory}</Text>
              <Text style={styles.categorySecondary}>{item.subCategory}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.location}>מיקום: {item.city} </Text>

              <View style={styles.priceContainer}>
                <Text style={styles.price}>{item.price}</Text>
                <Text style={styles.priceLabel}>מחיר נדרש: </Text>
              </View>

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
                    Math.round(item.price.replace("₪", "").replace(",", ""))
                  }
                  minimumTrackTintColor="#C6A052"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#C6A052"
                  onValueChange={(value) => {
                    // עדכון מקומי בזמן גלילה
                    setSliderValues((prev) => ({ ...prev, [item.id]: value }));
                  }}
                  onSlidingComplete={(value) => {
                    // עדכון סופי אחרי סיום תנועה
                    handleSliderChange(item.id, value);
                  }}
                  onTouchStart={() => setActiveScrollArea("slider")}
                  onTouchEnd={() => setActiveScrollArea("cards")}
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
                    ₪ {sliderValues[item.id]}
                  </Text>
                  {/* כפתור איפוס */}
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={resetSliderValue}
                  >
                    <Text style={styles.resetButtonText}>איפוס</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        snapToInterval={SCREEN_WIDTH * 0.9}
        decelerationRate="fast"
        pagingEnabled={activeScrollArea === "cards"}
      />
      {/* פופאפ - פרטי הצעת עבודה */}
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
              onPress={closeOfferModal}
            >
              <Text style={styles.closeButtonText} onPress={submitProposal}>
                הגישו הצעה ללקוח{" "}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* פופאפ - פרטי המשרה */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
              <Text style={styles.closeIconText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>עוד צעד קטן והעבודה שלך 👏</Text>
            {selectedPost && (
              <>
                <Text style={styles.modalText}>
                  שם הלקוח: {selectedUserName}
                </Text>
                <Text style={styles.modalText}>
                  פלאפון: {selectedPost.phoneNumber || "לא זמין"}
                </Text>
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
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  titletop: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C6A052",
    textAlign: "right",
    alignSelf: "flex-end",
    marginTop: 20,
    marginBottom: 20,
    marginRight: 20,
    top: 90,
    borderBottomWidth: 2,
    borderBottomColor: "#C6A052",
  },
  card: {
    marginTop: 80,
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 1.4,
    marginHorizontal: SCREEN_WIDTH * 0.05,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15, // הקטנת הרווח הפנימי
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8, // הקטנת הצל
    shadowOffset: { width: 0, height: 8 },
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    marginRight: 1,
  },

  imageContainer: {
    width: 330,
    height: 200,

    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  image: {
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.5,
    resizeMode: "cover",
    borderRadius: 10,
  },
  categoryPrimary: {
    fontSize: 12, // הקטנת פונט
    fontWeight: "bold",
    color: "#C6A052",
    marginTop: 8, // הקטנת מרווח
    textTransform: "uppercase",
  },
  categorySecondary: {
    fontSize: 10, // הקטנת פונט
    color: "#888",
    marginTop: 8,
  },
  title: {
    fontSize: 16, // הקטנת כותרת
    fontWeight: "bold",
    marginTop: 8,
    color: "#333",
    textAlign: "center",
  },
  description: {
    fontSize: 11, // הקטנת פונט
    color: "#555",
    marginTop: 8,
    textAlign: "center",
    flexShrink: 1,
    overflow: "hidden",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  priceLabel: {
    fontSize: 12, // הקטנת פונט
    color: "#C6A052",
    fontWeight: "bold",
    marginRight: 5,
  },
  price: {
    fontSize: 12, // הקטנת פונט
    color: "#333",
    fontWeight: "bold",
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
    paddingVertical: 10, // הקטנת פדינג
    paddingHorizontal: 20, // הקטנת פדינג
    borderRadius: 20, // גודל כפתור מתאים
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14, // הקטנת פונט
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
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffff",
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
  arrowText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default UserPage;
