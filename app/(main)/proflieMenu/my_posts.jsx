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
  SafeAreaView,
  ActivityIndicator,
  Alert,
  TextInput,
  StatusBar,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import {
  getDocs,
  collection,
  doc,
  getDoc,
  query,
  where,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../(auth)/firebase";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MyPosts = () => {
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [dotCount, setDotCount] = useState(0);
  const [currentImageIndices, setCurrentImageIndices] = useState({});
  const [expandedCard, setExpandedCard] = useState(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const HEADER_HEIGHT = 70;
  const navigation = useNavigation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [editedValues, setEditedValues] = useState({
    phone: "",
    price: "",
    description: "",
    title: "",
  });

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
        }, 500);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUserPosts = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          setCurrentUserEmail(currentUser.email);

          // Query posts where userEmail matches current user's email
          const postsQuery = query(
            collection(db, "Posts"),
            where("userEmail", "==", currentUser.email)
          );

          const querySnapshot = await getDocs(postsQuery);
          const postsArray = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Set up initial image indices for carousel
          const initialImageIndices = {};
          postsArray.forEach((post) => {
            initialImageIndices[post.id] = 0;
          });

          setUserPosts(postsArray);
          setCurrentImageIndices(initialImageIndices);
          setIsLoading(false);
        } else {
          console.log("No user is signed in");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user posts: ", error);
        setIsLoading(false);
      }
    };

    fetchUserPosts();
  }, []);

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  const openDeleteModal = (post) => {
    setSelectedPost(post);
    setIsDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setSelectedPost(null);
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;

    try {
      // Delete the post from Firestore
      await deleteDoc(doc(db, "Posts", selectedPost.id));

      // Update the local state to remove the deleted post
      setUserPosts(userPosts.filter((post) => post.id !== selectedPost.id));

      Alert.alert("הצלחה", "הפוסט נמחק בהצלחה");
      closeDeleteModal();
    } catch (error) {
      console.error("Error deleting post: ", error);
      Alert.alert("שגיאה", "אירעה שגיאה בעת מחיקת הפוסט. נסה שוב.");
    }
  };

  const handleEditPost = (post) => {
    setPostToEdit(post);
    setEditedValues({
      phoneNumber: post.phoneNumber || "",
      price: post.price || "",
      description: post.description || "",
      title: post.title || "",
    });

    setEditModalVisible(true);
  };

  const handleSaveChanges = async () => {
    const { phoneNumber, price, description, title } = editedValues;

    // בדיקה אם שדה כלשהו ריק (גם אחרי רווחים)
    if (
      !phoneNumber.trim() ||
      !price.trim() ||
      !description.trim() ||
      !title.trim()
    ) {
      Alert.alert("שגיאה", "כל השדות חובה. אנא מלא את כל הפרטים.");
      return;
    }

    try {
      await updatePostInDatabase(postToEdit.id, editedValues);

      const updatedPosts = userPosts.map((post) =>
        post.id === postToEdit.id ? { ...post, ...editedValues } : post
      );
      setUserPosts(updatedPosts);

      setEditModalVisible(false);
      setPostToEdit(null);
    } catch (error) {
      console.error("שגיאה בעדכון הפוסט:", error);
    }
  };

  // פונקציה לעדכון הפוסט במסד הנתונים
  const updatePostInDatabase = async (postId, updatedData) => {
    try {
      // יוצרים Reference לפוסט עם ה-ID
      const postRef = doc(db, "Posts", postId);

      // עדכון הפוסט במסד הנתונים
      await updateDoc(postRef, updatedData);
      console.log("הפוסט עודכן בהצלחה!");
    } catch (error) {
      console.error("שגיאה בעדכון הפוסט:", error.message);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          טוען את הפוסטים שלך{".".repeat(dotCount)}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.containernew, { paddingTop: insets.top + HEADER_HEIGHT }]}
    >
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
      {userPosts.length === 0 ? (
        // If no posts, show empty state with ScrollView
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>הפוסטים שלי</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/post")}
            >
              <Text style={styles.addButtonText}>הוסף פוסט חדש +</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.emptyContainer}>
            <MaterialIcons name="post-add" size={60} color="#C6A052" />
            <Text style={styles.emptyText}>אין לך פוסטים עדיין</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => router.push("/post")}
            >
              <Text style={styles.createButtonText}>צור פוסט חדש</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        // If posts exist, use FlatList directly (without nesting in ScrollView)
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>הפוסטים שלי</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => router.push("/post")}
            >
              <Text style={styles.addButtonText}>הוסף פוסט חדש +</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            contentContainerStyle={styles.container}
            data={userPosts}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            style={Platform.OS === "android" ? { width: "100%" } : {}}
            renderItem={({ item }) => {
              const allImages = [
                item.mainImage,
                ...(item.additionalImages || []),
              ].filter(Boolean);
              const currentImageIndex = currentImageIndices[item.id] || 0;

              const handleExpandCard = () => {
                setExpandedCard(expandedCard === item.id ? null : item.id);
              };

              const handleCloseCard = () => {
                setExpandedCard(null);
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
                  style={
                    Platform.OS === "android"
                      ? { alignItems: "center", width: "100%" }
                      : {}
                  }
                >
                  <View
                    style={[
                      styles.card,
                      {
                        minHeight:
                          expandedCard === item.id
                            ? Platform.OS === "android"
                              ? SCREEN_WIDTH * 1.2
                              : SCREEN_WIDTH * 1.1
                            : Platform.OS === "android"
                              ? SCREEN_WIDTH * 0.7
                              : SCREEN_WIDTH * 0.6,
                        maxHeight:
                          expandedCard === item.id
                            ? SCREEN_HEIGHT * 0.8
                            : undefined,
                      },
                    ]}
                  >
                    {/* כפתור סגירה בחלק העליון של הכרטיס המורחב */}
                    {expandedCard === item.id && (
                      <TouchableOpacity
                        style={styles.closeButtonCard}
                        onPress={handleCloseCard}
                      >
                        <Text style={styles.closeButtonTextCard}>✖</Text>
                      </TouchableOpacity>
                    )}

                    {/* התוכן של כרטיס */}
                    <View style={styles.contentRow}>
                      {/* צד תמונה (now on the left) */}
                      <View style={styles.imageContainerLeft}>
                        {allImages.length > 0 ? (
                          <Image
                            source={{ uri: allImages[currentImageIndex] }}
                            style={styles.image}
                          />
                        ) : (
                          <View style={styles.noImageContainer}>
                            <MaterialIcons
                              name="image"
                              size={40}
                              color="#C6A052"
                            />
                            <Text style={styles.noImageText}>אין תמונה</Text>
                          </View>
                        )}

                        {allImages.length > 1 && (
                          <>
                            <TouchableOpacity
                              style={[
                                styles.arrowLeft,
                                Platform.OS === "android"
                                  ? { left: undefined, right: 20 }
                                  : {},
                              ]}
                              onPress={() =>
                                Platform.OS === "android"
                                  ? handleNextImage(item.id)
                                  : handlePreviousImage(item.id)
                              }
                            >
                              <Icon
                                name={
                                  Platform.OS === "android"
                                    ? "chevron-right"
                                    : "chevron-left"
                                }
                                size={24}
                                color="white"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.arrowRight,
                                Platform.OS === "android"
                                  ? { right: undefined, left: 20 }
                                  : {},
                              ]}
                              onPress={() =>
                                Platform.OS === "android"
                                  ? handlePreviousImage(item.id)
                                  : handleNextImage(item.id)
                              }
                            >
                              <Icon
                                name={
                                  Platform.OS === "android"
                                    ? "chevron-left"
                                    : "chevron-right"
                                }
                                size={24}
                                color="white"
                              />
                            </TouchableOpacity>

                            <View style={styles.dotsContainer}>
                              {allImages.map((_, index) => (
                                <View
                                  key={index}
                                  style={[
                                    styles.dot,
                                    currentImageIndex === index &&
                                      styles.activeDot,
                                  ]}
                                />
                              ))}
                            </View>
                          </>
                        )}
                      </View>

                      {/* צד טקסט (now on the right) */}
                      <View style={styles.textContainerRight}>
                        <Text style={[styles.title, styles.textAlign]}>
                          {item.mainCategory}
                        </Text>
                        <Text style={[styles.Seccondtitle, styles.textAlign]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.price, styles.textAlign]}>
                          <Text style={styles.boldText}>מחיר: </Text>
                          {item.price}
                        </Text>

                        <Text style={[styles.location, styles.textAlign]}>
                          <Text style={styles.boldText}>מיקום: </Text>
                          {item.city}
                        </Text>

                        <Text style={[styles.location, styles.textAlign]}>
                          <Text style={styles.boldText}>פלאפון: </Text>
                          {Platform.OS === "android"
                            ? item.phoneNumber?.replace(
                                /(\d{3})(\d{3})(\d{4})/,
                                "$1-$2-$3"
                              )
                            : item.phoneNumber}
                        </Text>

                        {/* כפתור להרחבת הכרטיס */}
                        {expandedCard !== item.id && (
                          <TouchableOpacity
                            style={styles.buttonInRow}
                            onPress={handleExpandCard}
                          >
                            <Text style={styles.buttonText}>פרטים נוספים</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* תוכן מורחב */}
                    {expandedCard === item.id && (
                      <View style={styles.expandedContent}>
                        <Text style={styles.description}>
                          <Text style={styles.boldText}>תיאור: </Text>
                          {item.description}
                        </Text>

                        {/* כפתורי פעולה */}
                        <View
                          style={{
                            flexDirection:
                              Platform.OS === "android" ? "row-reverse" : "row",
                            justifyContent: "space-around",
                            width: "100%",
                            marginTop: 15,
                            paddingBottom: 10,
                          }}
                        >
                          <TouchableOpacity
                            style={[
                              styles.button,
                              { flex: 1, marginHorizontal: 5 },
                            ]}
                            onPress={() => handleEditPost(item)}
                          >
                            <Text style={styles.buttonText}>ערוך</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.button,
                              {
                                flex: 1,
                                marginHorizontal: 5,
                                backgroundColor: "#3D3D3D",
                              },
                            ]}
                            onPress={() => openDeleteModal(item)}
                          >
                            <Text style={styles.buttonText}>מחק</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
          />
        </>
      )}

      {/* Offers Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.closeIcon} onPress={closeModal}>
              <Text style={styles.closeIconText}>×</Text>
            </TouchableOpacity>

            <Text style={styles.modalTitle}>הצעות שהתקבלו</Text>

            {selectedPost && (
              <View style={styles.offersContainer}>
                {/* Here you would fetch and display offers for this post */}
                <Text style={styles.offersInfoText}>
                  לצפייה בכל ההצעות שהתקבלו לפוסט זה, אנא בדוק את מסך "ההצעות
                  שלי"
                </Text>

                <TouchableOpacity
                  style={styles.viewOffersButton}
                  onPress={() => {
                    closeModal();
                    navigation.navigate("(main)/MyOffers");
                  }}
                >
                  <Text style={styles.buttonText}>עבור להצעות שלי</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={isDeleteModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>אישור מחיקה</Text>

            <Text
              style={[
                styles.deleteConfirmText,
                { writingDirection: "rtl", textAlign: "center" },
              ]}
            >
              האם אתה בטוח שברצונך למחוק את הפוסט?
              {selectedPost && (
                <Text style={styles.title}>
                  {"\n"}"{selectedPost.title}"
                </Text>
              )}
            </Text>

            <View
              style={[
                styles.deleteModalButtons,
                {
                  flexDirection:
                    Platform.OS === "android" ? "row-reverse" : "row",
                  marginRight: Platform.OS === "android" ? 0 : 100,
                  marginLeft: Platform.OS === "android" ? 100 : 0,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDeletePost}
              >
                <Text style={styles.buttonText}>מחק</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButtonD}
                onPress={closeDeleteModal}
              >
                <Text style={styles.cancelButtonText}>ביטול</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={editModalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.editModalContent}>
              <Text style={styles.modalTitle}>עריכת פוסט</Text>

              <Text style={styles.label}>פלאפון:</Text>
              <TextInput
                style={[styles.input, { textAlign: "right" }]}
                value={editedValues.phoneNumber}
                onChangeText={(text) => {
                  // עיצוב המספר בפורמט מתאים
                  const formattedText = text
                    .replace(/[^\d]/g, "") // מסיר כל תו לא מספרי
                    .replace(/^(\d{3})(\d{3})(\d{4})$/, "$1-$2$3"); // מוסיף מקפים בין הספרות
                  setEditedValues((prev) => ({
                    ...prev,
                    phoneNumber: formattedText,
                  }));
                }}
                placeholder="פלאפון"
                textAlign="right"
                writingDirection="rtl"
              />

              <Text style={styles.label}>מחיר:</Text>
              <TextInput
                style={[
                  styles.input,
                  { flexDirection: "row-reverse", textAlign: "right" },
                ]}
                value={editedValues.price}
                onChangeText={(text) => {
                  let formattedPrice = text.trim();

                  formattedPrice = formattedPrice.replace(/[^\d]/g, "");

                  if (formattedPrice) {
                    formattedPrice = "₪" + formattedPrice;
                  }

                  setEditedValues((prev) => ({
                    ...prev,
                    price: formattedPrice,
                  }));
                }}
                placeholder="מחיר"
                keyboardType="numeric"
                textAlign="right"
                writingDirection="rtl"
              />

              <Text style={styles.label}>כותרת:</Text>
              <TextInput
                style={[styles.input, { height: 60, textAlign: "right" }]}
                value={editedValues.title}
                onChangeText={(text) =>
                  setEditedValues((prev) => ({ ...prev, title: text }))
                }
                placeholder="כותרת"
                multiline
                textAlign="right"
                writingDirection="rtl"
              />

              <Text style={styles.label}>תיאור:</Text>
              <TextInput
                style={[styles.input, { height: 80, textAlign: "right" }]}
                value={editedValues.description}
                onChangeText={(text) =>
                  setEditedValues((prev) => ({ ...prev, description: text }))
                }
                placeholder="תיאור"
                multiline
                textAlign="right"
                writingDirection="rtl"
              />

              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSaveChanges}
                >
                  <Text style={styles.buttonText}>שמור שינויים</Text>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: "center" }}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>ביטול</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  containernew: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: Platform.OS === "android" ? 5 : 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
  },
  headerContainer: {
    flexDirection: Platform.OS === "android" ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 50 : 70,
    marginBottom: 20,
    paddingHorizontal: 10,
    width: "100%",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: Platform.OS === "android" ? "right" : "left",
  },
  addButton: {
    backgroundColor: "#C6A052",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  addButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },
  container: {
    backgroundColor: "#f9f9f9",
    justifyContent: "flex-start",
    alignItems: Platform.OS === "android" ? "center" : "stretch",
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: Platform.OS === "android" ? 10 : 0,
    width: "100%",
  },
  titletop: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: Platform.OS === "android" ? "right" : "left",
    marginLeft: Platform.OS === "android" ? 0 : 20,
    marginRight: Platform.OS === "android" ? 20 : 0,
  },
  card: {
    marginTop: 10,
    padding: 5,
    width: Platform.OS === "android" ? "90%" : "95%",
    backgroundColor: "white",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "flex-start",
    elevation: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "visible",
    alignSelf: "center",
    marginBottom: 15,
    minHeight: SCREEN_WIDTH * 0.6,
    flexGrow: 1,
  },

  image: {
    width: Platform.OS === "android" ? "95%" : "90%",
    height: "80%",
    resizeMode: "cover",
    borderRadius: 10,
    alignSelf: "center",
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    flexShrink: 1,
    paddingHorizontal: Platform.OS === "android" ? 5 : 0,
  },
  Seccondtitle: {
    fontSize: 15,
    marginTop: 4,
    color: "#333",
    textAlign: "center",
    flexShrink: 1,
    paddingHorizontal: Platform.OS === "android" ? 5 : 0,
  },

  price: {
    marginTop: 10,
    fontSize: 15,
    color: "#333",
    paddingHorizontal: Platform.OS === "android" ? 5 : 0,
  },

  location: {
    fontSize: 15,
    color: "#333",
    marginTop: 5,
    width: "100%",
  },

  button: {
    backgroundColor: "#C6A052",
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 20,
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
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    flexShrink: 0, // Prevent text shrinking
    flexWrap: "nowrap", // Prevent text wrapping
    width: "100%", // Take full width of container
  },

  description: {
    fontSize: 14,
    color: "#555",
    textAlign: Platform.OS === "android" ? "right" : "center",
    overflow: "hidden",
    flexShrink: 0,
    writingDirection: "rtl",
    paddingHorizontal: 5,
  },

  contentRow: {
    flexDirection: "row",
    width: Platform.OS === "android" ? "95%" : "100%",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: Platform.OS === "android" ? 10 : 10,
    flex: 1,
  },

  imageContainerLeft: {
    width: Platform.OS === "android" ? "50%" : "55%",
    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
    marginLeft: Platform.OS === "android" ? 5 : 10,
    marginRight: Platform.OS === "android" ? 0 : 0,
    justifyContent: "center",
    alignItems: "center",
  },

  textContainerRight: {
    width: "48%",
    alignItems: Platform.OS === "android" ? "flex-end" : "flex-start",
    marginRight: Platform.OS === "android" ? 10 : 10,
    marginLeft: Platform.OS === "android" ? 0 : 0,
    paddingRight: Platform.OS === "android" ? 5 : 0,
  },

  textAlign: {
    width: "100%",
    textAlign: Platform.OS === "android" ? "right" : "left",
    writingDirection: "rtl",
    paddingHorizontal: Platform.OS === "android" ? 2 : 0,
  },

  buttonInRow: {
    backgroundColor: "#C6A052",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginTop: 10,
    alignSelf: Platform.OS === "android" ? "flex-end" : "flex-start",
    width: 120, // Fixed width instead of minWidth
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  boldText: {
    fontWeight: "bold",
    color: "#333",
  },
  expandedContent: {
    width: "100%",
    paddingHorizontal: 5,
    alignItems: Platform.OS === "android" ? "flex-end" : "center",
    paddingVertical: 5,
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
    textAlign: "center",
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
    bottom: 50,
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
    top: 30,
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
    width: Platform.OS === "android" ? "95%" : "100%",
    height: "80%",
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
    left: Platform.OS === "android" ? undefined : 20,
    right: Platform.OS === "android" ? 20 : undefined,
    transform: [{ translateY: -10 }],
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 20,
  },
  arrowRight: {
    position: "absolute",
    top: "45%",
    right: Platform.OS === "android" ? undefined : 20,
    left: Platform.OS === "android" ? 20 : undefined,
    transform: [{ translateY: -10 }],
    zIndex: 2,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 15,
    borderRadius: 20,
  },

  closeButtonCard: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    padding: 0,
    borderRadius: 15,
    zIndex: 999,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  closeButtonTextCard: {
    fontSize: 16,
    lineHeight: 20,
    color: "#C6A052",
    textAlign: "center",
    fontWeight: "bold",
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
  deleteModalButtons: {
    flexDirection: Platform.OS === "android" ? "row-reverse" : "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginVertical: 5,
    width: "70%",
    gap: 10,
    marginRight: Platform.OS === "android" ? 0 : 100,
    marginLeft: Platform.OS === "android" ? 100 : 0,
  },
  cancelButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButtonD: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#C6A052",
    padding: 10,
    borderRadius: 8,
    width: "70%",
    height: "76%",
  },
  confirmDeleteButton: {
    backgroundColor: "#3D3D3D",
    marginTop: 10,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    width: "70%",
    height: "76%",
  },
  editModalContent: {
    backgroundColor: "white",
    width: "95%",
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  label: {
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "right",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    textAlign: "right",
  },
  saveButton: {
    backgroundColor: "#C6A052",
    padding: 10,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
    width: "70%",
  },
  cancelButton: {
    marginTop: 10,
    alignItems: "center",
    backgroundColor: "#3D3D3D",
    padding: 10,
    borderRadius: 8,
    width: "70%",
  },
  offersContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  offersInfoText: {
    marginBottom: 10,
    textAlign: "center",
  },
  viewOffersButton: {
    backgroundColor: "#C6A052",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#555",
    marginTop: 20,
    marginBottom: 30,
    textAlign: "center",
  },
  createButton: {
    backgroundColor: "#C6A052",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  createButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default MyPosts;
