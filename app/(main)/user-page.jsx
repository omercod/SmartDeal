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
import { MaterialIcons } from "@expo/vector-icons";
import CustomerBanner from "../(main)/CustomerBanner";

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
  const [expandedCard, setExpandedCard] = useState(null);
  const categories = [
    { id: "1", name: "אירועים ובידור", icon: "celebration" },
    { id: "2", name: "הובלות", icon: "local-shipping" },
    { id: "3", name: "לימוד  והדרכה", icon: "school" },
    { id: "4", name: "קולינריה", icon: "restaurant" },
    { id: "5", name: "קוסמטיקה", icon: "spa" },
    { id: "6", name: "צילום", icon: "camera-alt" },
    { id: "7", name: "שיפוצים", icon: "construction" },
  ];

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
    <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
      <View style={styles.containerCircale}>
        <Text style={styles.categoryTitle}>חפשו לפי תחום:</Text>
        <FlatList
          horizontal
          data={categories}
          scrollEnabled={true}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.storyCircle}>
              <MaterialIcons name={item.icon} size={32} color="white" />
              <Text style={styles.storyText}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <CustomerBanner />
      </View>
      <Text style={styles.titletop}>דרושים:</Text>
      <FlatList
        horizontal
        scrollEventThrottle={16} // משפר את חוויית הגלילה
        decelerationRate="fast" // ✖ נסה לשנות ל-"normal" או להסיר
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
          // הוסף את הפונקציה הזאת בקוד
          const handleCloseCard = () => {
            setExpandedCard(null); // סוגר את הכרטיס המורחב
          };

          const handleExpandCard = () => {
            setExpandedCard(expandedCard === item.id ? null : item.id); // אם הכרטיס פתוח, נסגור אותו, אחרת נפתח אותו
          };

          const handlePreviousImage = (id) => {
            setCurrentImageIndices((prev) => {
              const newIndex = Math.max(currentImageIndices[id] - 1, 0); // מבטיח שלא יגיע מתחת ל-0
              return { ...prev, [id]: newIndex };
            });
          };

          const handleNextImage = (id) => {
            setCurrentImageIndices((prev) => {
              const newIndex = Math.min(
                currentImageIndices[id] + 1,
                allImages.length - 1
              );
              return { ...prev, [id]: newIndex };
            });
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
              {/* כפתור סגירה בחלק הימני העליון של הכרטיס */}
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
                  source={{
                    uri: allImages[currentImageIndex],
                  }}
                  style={styles.image}
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

                {/* נקודות התמונה ממוקמות בתחתית התמונה */}
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
              <Text style={styles.price}>מחיר:{item.price}</Text>
              <Text style={styles.location}>מיקום: {item.city}</Text>

              {/* כפתור "עוד מידע" - יוסר כאשר הכרטיס נפתח */}
              {expandedCard !== item.id && (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleExpandCard}
                >
                  <Text style={styles.buttonText}>מידע נוסף והגשת הצעה</Text>
                </TouchableOpacity>
              )}

              {/* תוכן מורחב של הכרטיס */}
              {expandedCard === item.id && (
                <View style={styles.expandedContent}>
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
                      onSlidingComplete={(value) => {
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
          );
        }}
        showsHorizontalScrollIndicator={false}
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
    backgroundColor: "#f9f9f9",
    justifyContent: "flex-start", // שמתחיל מלמעלה
    alignItems: "stretch", // זה מבטיח שהאלמנטים יתפוס את כל הרוחב

    flexGrow: 1, // להבטיח שהתוכן יוכל להתפשט כלפי מטה
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
    width: SCREEN_WIDTH * 0.65,
    height: "auto", // שיתאים לגודל התוכן
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "flex-start", // שלא ימרכז אנכית בכוח
    elevation: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden", // לוודא שהתוכן לא יוצא
    marginLeft: 15, // קצת רווח בין הכרטיסים
  },

  expandedContent: {
    marginTop: 10,
  },

  imageContainer: {
    width: "100%", // נוודא שהתמונה תתפוס את כל רוחב הכרטיס
    height: 150, // הגבה את התמונה כך שתתפוס יותר מקום
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  image: {
    width: "100%", // נוודא שהתמונה תתפוס את כל רוחב הכרטיס
    height: "100%", // התמונה תתפוס את כל הגובה של container
    resizeMode: "cover", // לשמור על יחס התמונה
    borderRadius: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  Seccondtitle: {
    fontSize: 14,
    marginTop: 4,
    color: "#333",
    textAlign: "center",
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
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
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
    bottom: 10, // מיקום הנקודות למטה
    width: "100%",
    zIndex: 1, // לוודא שהנקודות יהיו מעל שאר האלמנטים
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ffffff", // צבע הרקע של הנקודות
    margin: 5,
    borderWidth: 2,
    borderColor: "#C6A052", // צבע גבול
  },
  activeDot: {
    backgroundColor: "#C6A052", // צבע של הנקודה הפעילה
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
    marginLeft: 3,
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
  closeButtonCard: {
    position: "absolute",
    top: 170, // מרחק מהחלק העליון של הכרטיס
    left: 10, // מרחק מהצד הימני
    padding: 10,
    borderRadius: 20, // עיגול פינות
    zIndex: 1, // לוודא שהכפתור יופיע מעל שאר האלמנטים
  },
  closeButtonTextCard: {
    color: "#C6A052", // צבע טקסט ירוק כהה
    fontSize: 24, // גודל טקסט גדול וברור
    fontWeight: "bold", // טקסט מודגש
    textAlign: "center",
  },
  containerCircale: {
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
  },
  storyCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#C6A052", // צבע זהב לדוגמה
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  storyText: {
    fontSize: 12,
    color: "black",
    textAlign: "center",
    width: 70,
  },
  categoryTitle: {
    padding: 20,
    marginTop: 50,
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
  },
});

export default UserPage;
