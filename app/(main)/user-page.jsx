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

  const submitProposal = async () => {
    if (!selectedPost || !offerDetails.price || !currentUserName) {
      console.log("Missing required information for submission");
      return;
    }

    try {
      // שליפה של האימייל של המשתמש המחובר
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser || !currentUser.email) {
        console.error("No authenticated user found!");
        return;
      }

      // הכנה של המידע להצעה
      const proposalData = {
        jobType: selectedPost.mainCategory || "לא צוין", // סוג העבודה
        providerName: currentUserName, // שם נותן העבודה
        providerEmail: currentUser.email, // אימייל נותן העבודה
        OfferPrice: offerDetails.price, // המחיר המוצע
        note: offerDetails.note || "", // הערה
        clientName: selectedUserName || "לא צוין", // שם הלקוח
        clientEmail: selectedPost.userEmail || "לא צוין", // אימייל הלקוח
        createdAt: new Date().toISOString(), // תאריך יצירת ההצעה
        isreading: 0,
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
        console.log(userData.name);
        setSelectedUserName(userData.name);
      } else {
        console.log("No user found with this email");
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    }
  };

  const openModal = (post) => {
    console.log("Selected post: ", post); // הדפסת הפוסט על מנת לוודא שהוא כולל את האימייל
    setSelectedPost(post);

    const email = post.userEmail; // שליפת האימייל מתוך הפוסט

    if (email) {
      fetchUserNameByEmail(email); // שליחה לפונקציה לחיפוש שם המשתמש
    } else {
      console.log("Email is missing in post");
    }

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

  const handleImageChange = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titletop}>דרושים:</Text>
      <FlatList
        horizontal
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          // יצירת מערך של כל התמונות כולל התמונה הראשית
          const allImages = [item.mainImage, ...(item.additionalImages || [])];
          const resetSliderValue = () => {
            setSliderValues((prev) => ({
              ...prev,
              [item.id]: parseFloat(
                item.price.replace("₪", "").replace(",", "")
              ),
            }));
          };

          return (
            <View style={styles.card}>
              <View style={styles.imageContainer}>
                {item.mainImage ? (
                  <ScrollView
                    horizontal
                    pagingEnabled
                    onMomentumScrollEnd={(e) => {
                      const contentOffsetX = e.nativeEvent.contentOffset.x;
                      const newIndex = Math.floor(contentOffsetX / 320); // רוחב התמונה
                      setCurrentImageIndex(newIndex);
                    }}
                    showsHorizontalScrollIndicator={false}
                  >
                    {/* הצגת תמונות נוספות אם יש */}
                    {[item.mainImage, ...(item.additionalImages || [])].map(
                      (imageUri, index) => (
                        <Image
                          key={index}
                          source={{ uri: imageUri }}
                          style={styles.image}
                        />
                      )
                    )}
                  </ScrollView>
                ) : (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageIcon}>📷</Text>
                    <Text style={styles.noImageText}>אין תמונות</Text>
                  </View>
                )}

                {/* עיגולים לתצוגת תמונות */}
                {item.mainImage && (
                  <View style={styles.dotsContainer}>
                    {allImages.map((_, index) => (
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
                )}
              </View>

              <Text style={styles.categoryPrimary}>{item.mainCategory}</Text>
              <Text style={styles.categorySecondary}>{item.subCategory}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.location}>מיקום: {item.city} </Text>

              <View style={styles.priceContainer}>
                <Text style={styles.priceLabel}>מחיר נדרש:</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderText}>הגש הצעה:</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={Math.ceil(
                    parseFloat(item.price.replace("₪", "").replace(",", "")) *
                      0.5
                  )}
                  maximumValue={Math.floor(
                    parseFloat(item.price.replace("₪", "").replace(",", "")) *
                      1.2
                  )}
                  step={1}
                  value={
                    sliderValues[item.id] ||
                    parseFloat(item.price.replace("₪", "").replace(",", ""))
                  }
                  minimumTrackTintColor="#C6A052"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#C6A052"
                  onValueChange={(value) => handleSliderChange(item.id, value)} // עדכון הערך כשיש שינוי
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
        snapToInterval={390}
        decelerationRate="fast"
        pagingEnabled={true}
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
                  עבודה: {selectedPost.subCategory}
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
                הגש הצעה ללקוח{" "}
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
    backgroundColor: "#f9f9f9",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  titletop: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C6A052",
    marginTop: 20,
    marginBottom: 20,
    right: 150,
    top: 90,
    borderBottomWidth: 2,
    borderBottomColor: "#C6A052",
  },
  card: {
    marginTop: 100,
    width: 350,
    height: 540,
    marginHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 },
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
  },
  imageContainer: {
    width: 320,
    height: 210,

    overflow: "hidden",
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
    marginTop: 10,
    textTransform: "uppercase",
  },
  categorySecondary: {
    fontSize: 12,
    color: "#888",
    marginTop: 10,
    fontStyle: "italic",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    color: "#333",
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    color: "#555",
    marginTop: 10,
    textAlign: "center",
    flexShrink: 1,
    overflow: "hidden",
  },
  location: {
    fontSize: 12,
    color: "#555",
    marginTop: 10,
    textAlign: "center",
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  priceLabel: {
    fontSize: 14,
    color: "#C6A052",
    fontWeight: "bold",
    marginRight: 5,
  },
  price: {
    fontSize: 14,
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
    bottom: 0,
    borderColor: "#C6A052",
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
});

export default UserPage;
