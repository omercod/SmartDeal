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
  StatusBar,
  ActivityIndicator,
  I18nManager,
  Platform,
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
import { Slider } from "@miblanchard/react-native-slider";
import { db } from "../(auth)/firebase";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import CustomerBanner from "../(main)/CustomerBanner";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import CustomAlert from "../../components/CustomAlert";

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
  const [isComplete, setIsComplete] = useState(false); 
  const [activeScrollArea, setActiveScrollArea] = useState("cards");
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 70;
  const [randomPosts, setRandomPosts] = useState([]);
  const [dotCount, setDotCount] = useState(0); 
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [showReadMore, setShowReadMore] = useState({});

  const [expandedCard, setExpandedCard] = useState(null);
  const categories = [
    { id: "1", name: "אירועים ובידור", icon: "celebration" },
    { id: "2", name: "הובלות ותחבורה", icon: "local-shipping" },
    { id: "3", name: "לימוד והדרכה", icon: "school" },
    { id: "4", name: "קולינריה", icon: "restaurant" },
    { id: "5", name: "קוסמטיקה וטיפוח", icon: "spa" },
    { id: "6", name: "צילום", icon: "camera-alt" },
    { id: "7", name: "שיפוצים ותיקונים", icon: "construction" },
  ];

  const navigation = useNavigation();
  const handleCategoryPress = (category) => {
    const searchParams = {
      category: category.name,
    };

    // Use navigation to navigate to the ResultsScreen
    navigation.navigate("(main)/ResultsScreen", { ...searchParams });
  };

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
  });

  const submitProposal = async () => {
    if (!selectedPost || !offerDetails.price || !currentUserName) {
      setAlertConfig({
        title: "שגיאה",
        message: "חסר מידע נדרש להגשת ההצעה",
      });
      setAlertVisible(true);
      return;
    }

    const userName = await fetchUserNameByEmail(selectedPost.userEmail);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        setAlertConfig({
          title: "שגיאה",
          message: "לא נמצא משתמש מחובר",
        });
        setAlertVisible(true);
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
      setAlertConfig({
        title: "הצלחה",
        message: "ההצעה נשלחה בהצלחה!",
      });
      setAlertVisible(true);
      closeOfferModal();
    } catch (error) {
      console.error("Error submitting Offers:", error);
      setAlertConfig({
        title: "שגיאה",
        message: "אירעה שגיאה בשליחת ההצעה. נסה שוב.",
      });
      setAlertVisible(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((prevCount) => {
        if (prevCount === 3) {
          return 1;
        }
        return prevCount + 1;
      });

      setProgress((prevProgress) => {
        if (prevProgress < 100) {
          return prevProgress + 1;
        }
        return prevProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

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

  useFocusEffect(
    React.useCallback(() => {
      const fetchData = async () => {
        setIsLoading(true);
        try {
          // Fetch posts
          const querySnapshot = await getDocs(collection(db, "Posts"));
          const postsArray = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setPosts(postsArray);

          const readMoreFlags = {};
          postsArray.forEach((post) => {
            if (post.description && post.description.length > 60) {
              readMoreFlags[post.id] = true;
            }
          });
          setShowReadMore(readMoreFlags);

          // Initialize random posts
          const shuffledPosts = postsArray.sort(() => 0.5 - Math.random());
          setRandomPosts(shuffledPosts.slice(0, 7));

          // Initialize other states
          const initialImageIndices = {};
          const initialSliderValues = {};
          postsArray.forEach((post) => {
            const numericPrice = parseFloat(
              post.price.replace("₪", "").replace(",", "")
            );
            initialSliderValues[post.id] = numericPrice; 
          });
          setSliderValues(initialSliderValues);

          // Fetch current user
          const auth = getAuth();
          const user = auth.currentUser;
          if (user) {
            const userDocRef = doc(db, "Users", user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              setCurrentUserName(userDoc.data().name);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }, [])
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (!expandedCard) {
        const shuffled = [...posts].sort(() => Math.random() - 0.5);
        setRandomPosts(shuffled.slice(0, 7));
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [posts, expandedCard]);

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
        setIsLoading(false);
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

  const getStepValue = (price) => {
    const numericPrice = parseFloat(price.replace("₪", "").replace(",", ""));
    if (numericPrice < 100) return 5;
    if (numericPrice < 500) return 10;
    if (numericPrice < 2000) return 50;
    return 100;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          מחפש את הצעות העבודה המשתלמות בשבילך{".".repeat(dotCount)}{" "}
          {/* נקודות זזות */}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.containernew,
        { paddingTop: Platform.OS === "android" ? 90 : insets.top + 80 },
      ]}
    >
      <ScrollView contentContainerStyle={[styles.container, { flexGrow: 1 }]}>
        <View style={styles.containerCircale}>
          <Text style={styles.categoryTitle}>חפשו לפי תחום:</Text>
          <FlatList
            horizontal
            data={categories}
            scrollEnabled={true}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
              paddingHorizontal: Platform.OS === "android" ? 5 : 10,
              paddingBottom: Platform.OS === "android" ? 10 : 0,
            }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.storyCircle}
                onPress={() => handleCategoryPress(item)}
              >
                <MaterialIcons name={item.icon} size={32} color="white" />
                <Text style={styles.storyText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: Platform.OS === "android" ? 15 : 10,
            marginTop: Platform.OS === "android" ? 10 : 5,
            width: "100%",
            direction: I18nManager.isRTL ? "rtl" : "ltr",
          }}
        >
          <CustomerBanner />
        </View>
        <Text style={styles.titletop}>דרושים:</Text>
        <FlatList
          horizontal
          scrollEventThrottle={16}
          decelerationRate="fast"
          data={[...randomPosts, { id: "more", type: "more" }]}
          keyExtractor={(item) => item.id}
          onTouchStart={() => setActiveScrollArea("cards")}
          contentContainerStyle={{
            paddingRight: Platform.OS === "android" ? 5 : 15,
          }}
          renderItem={({ item }) => {
            if (item.type === "more") {
              return (
                <TouchableOpacity
                  style={styles.moreCard}
                  onPress={() => navigation.navigate("(main)/ResultsScreen")} // לא מעבירים פרמטרים
                >
                  <Text style={styles.moreText}>לכל הפוסטים </Text>
                  <View style={styles.circleButton}>
                    <Icon name="arrow-left" size={24} color="white" />
                  </View>
                </TouchableOpacity>
              );
            }

            const allImages = [
              item.mainImage,
              ...(item.additionalImages || []),
            ];
            const currentImageIndex = currentImageIndices[item.id] || 0;

            const resetSliderValue = () => {
              setSliderValues((prev) => ({
                ...prev,
                [item.id]: parseFloat(
                  item.price.replace("₪", "").replace(",", "")
                ),
              }));
            };

            const handleCloseCard = () => {
              setExpandedCard(null);
            };

            const handleExpandCard = () => {
              setExpandedCard(expandedCard === item.id ? null : item.id);
            };

            const handlePreviousImage = (id) => {
              setCurrentImageIndices((prev) => {
                const newIndex = Math.max(currentImageIndices[id] - 1, 0);
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
                    minHeight:
                      expandedCard === item.id
                        ? Platform.OS === "android"
                          ? SCREEN_WIDTH * 1.6
                          : SCREEN_WIDTH * 1.5
                        : undefined,
                    width:
                      Platform.OS === "android"
                        ? SCREEN_WIDTH * 0.7 // Made wider on Android
                        : SCREEN_WIDTH * 0.8, // Made wider on iOS
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
                  {allImages[currentImageIndex] ? (
                    <Image
                      source={{ uri: allImages[currentImageIndex] }}
                      style={styles.image}
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
                    <Text
                      style={styles.description}
                      numberOfLines={
                        expandedDescriptions[item.id] ? undefined : 3
                      }
                      ellipsizeMode="tail"
                    >
                      {item.description}
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
                        <Text style={styles.readMore}>
                          {expandedDescriptions[item.id]
                            ? "הצג פחות"
                            : "קרא עוד"}
                        </Text>
                      </TouchableOpacity>
                    )}
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
                            parseFloat(
                              item.price.replace("₪", "").replace(",", "")
                            ) * 0.5
                          )}
                          maximumValue={Math.ceil(
                            parseFloat(
                              item.price.replace("₪", "").replace(",", "")
                            ) * 1.5
                          )}
                          step={getStepValue(item.price)}
                          value={
                            sliderValues[item.id] ||
                            parseFloat(
                              item.price.replace("₪", "").replace(",", "")
                            )
                          }
                          onValueChange={(value) => {
                            // Round to nearest step for smoother sliding
                            const step = getStepValue(item.price);
                            const roundedValue =
                              Math.round(value / step) * step;
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
                          tapToSeek={true} // Enable tap-to-seek functionality
                          animateTransitions={true} // Enable smooth transitions
                          animationType="spring" // Use spring animation
                          onSlidingComplete={(value) => {
                            const step = getStepValue(item.price);
                            const roundedValue =
                              Math.round(value / step) * step;
                            handleSliderChange(item.id, roundedValue);
                            setActiveScrollArea("cards");
                          }}
                        />
                      </View>
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
                          ₪{sliderValues[item.id]}
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

        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          onClose={() => setAlertVisible(false)}
        />
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  containernew: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: Platform.OS === "android" ? 10 : 20,
    paddingTop: Platform.OS === "android" ? 90 : 90,
  },
  container: {
    backgroundColor: "#f9f9f9",
    justifyContent: "flex-start",
    alignItems: "stretch",

    flexGrow: 1,
  },
  titletop: {
    fontSize: Platform.OS === "android" ? 16 : 18,
    fontWeight: "bold",
    textAlign: "right",
    marginRight: 20,
    marginTop: Platform.OS === "android" ? 10 : 0,
    marginBottom: Platform.OS === "android" ? 3 : 0,
  },
  card: {
    marginTop: Platform.OS === "android" ? 10 : 15,
    marginBottom: Platform.OS === "android" ? 10 : 15,
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "flex-start",
    elevation: Platform.OS === "android" ? 5 : 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    marginHorizontal: SCREEN_WIDTH * 0.02,
    alignSelf: "center",
  },
  expandedContent: {
    width: "90%",
    paddingVertical: 10,
    paddingBottom: 5,
    alignItems: "center",
  },
  imageContainer: {
    width: "95%",
    height:
      Platform.OS === "android" ? SCREEN_WIDTH * 0.45 : SCREEN_WIDTH * 0.4,
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
    borderRadius: 10,
  },

  title: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "bold",
    marginVertical: 8,
    textAlign: "center",
    color: "#333",
  },
  Seccondtitle: {
    fontSize: SCREEN_WIDTH * 0.035,
    marginVertical: 5,
    textAlign: "center",
    color: "#333",
    paddingHorizontal: 10,
  },
  price: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: "500",
    marginVertical: 5,
    textAlign: "center",
  },
  location: {
    fontSize: SCREEN_WIDTH * 0.035,
    marginVertical: 5,
    textAlign: "center",
  },
  noImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    width: "100%",
    height: "100%",
  },
  button: {
    backgroundColor: "#C6A052",
    paddingVertical: SCREEN_WIDTH * 0.02,
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    borderRadius: SCREEN_WIDTH * 0.05,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    minWidth: SCREEN_WIDTH * 0.3,
  },

  buttonText: {
    fontSize: SCREEN_WIDTH * 0.03,
    fontWeight: "bold",
    color: "white",
    marginBottom: 0,
  },
  description: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: "#555",
    textAlign: "center",
    paddingHorizontal: 10,
    lineHeight: SCREEN_WIDTH * 0.045,
    marginBottom: 3,
  },
  sliderContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: SCREEN_WIDTH * 0.02,
    
    marginVertical: 0,
    marginBottom: 0,
  },
  sliderText: {
    fontSize: SCREEN_WIDTH * 0.055,
    fontWeight: "bold",
    color: "#C6A052",
    textAlign: "center",
    marginBottom: SCREEN_WIDTH * 0.01,
  },
  slider: {
    width: Platform.OS === "android" ? "100%" : "90%",
    height:
      Platform.OS === "android" ? SCREEN_WIDTH * 0.01 : SCREEN_WIDTH * 0.01,
    flexShrink: 1,
    marginBottom: 0,
  },
  sliderValue: {
    fontSize: SCREEN_WIDTH * 0.032,
    fontWeight: "bold",
    color: "#333",
    marginLeft: SCREEN_WIDTH * 0.02,
  },
  offerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    marginTop: 0,
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
  buttongetoffers: {
    paddingVertical: SCREEN_WIDTH * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    borderRadius: SCREEN_WIDTH * 0.02,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C6A052",
  },
  resetButton: {
    backgroundColor: "#333",
    paddingVertical: SCREEN_WIDTH * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    borderRadius: SCREEN_WIDTH * 0.02,
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    color: "white",
    fontSize: SCREEN_WIDTH * 0.03,
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
    letterSpacing: 2,
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
  readMore: {
    color: "#33",
    fontWeight: "bold",
    fontSize: SCREEN_WIDTH * 0.03,
    marginTop: 2,
    textAlign: "center",
  },
  closeButtonCard: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 100,
    backgroundColor: "#fff",
    padding: 6,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  closeButtonTextCard: {
    color: "#C6A052",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  containerCircale: {
    flexDirection: "column",
    justifyContent: "center",
    backgroundColor: "#f9f9f9",
    marginTop: Platform.OS === "android" ? 0 : 0,
  },
  storyCircle: {
    width: Platform.OS === "android" ? 78 : 80,
    height: Platform.OS === "android" ? 78 : 80,
    borderRadius: Platform.OS === "android" ? 35 : 40,
    backgroundColor: "#C6A052",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: Platform.OS === "android" ? 3 : 5,
  },
  storyText: {
    fontSize: Platform.OS === "android" ? 10 : 12,
    color: "black",
    textAlign: "center",
    width: Platform.OS === "android" ? 60 : 70,
  },
  categoryTitle: {
    padding: 20,
    fontSize: Platform.OS === "android" ? 16 : 18,
    fontWeight: "bold",
    textAlign: "right",
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
  moreCard: {
    width: Platform.OS === "android" ? SCREEN_WIDTH * 0.35 : SCREEN_WIDTH * 0.4,
    height: Platform.OS === "android" ? SCREEN_WIDTH * 0.5 : SCREEN_WIDTH * 0.4, // Made taller
    borderRadius: Platform.OS === "android" ? 15 : 20,
    backgroundColor: "#fffbe6",
    borderWidth: 1,
    borderColor: "#C6A052",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: Platform.OS === "android" ? 5 : 10,
    marginTop: Platform.OS === "android" ? 50 : 110, // Reduced from 80 to 50
  },

  moreText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C6A052",
    marginBottom: 10,
  },

  circleButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#C6A052",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default UserPage;
