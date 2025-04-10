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
import Icon from "react-native-vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
                <View>
                  <View
                    style={[
                      styles.card,
                      {
                        height:
                          expandedCard === item.id
                            ? SCREEN_WIDTH * 0.7
                            : SCREEN_WIDTH * 0.4,
                      },
                    ]}
                  >
                    {/* כפתור סגירה בחלק הימני העליון של הכרטיס המורחב */}
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
                      {/* צד שמאל - טקסט */}
                      <View style={styles.textContainerLeft}>
                        <Text style={[styles.title, styles.textAlign]}>
                          {item.mainCategory}
                        </Text>
                        <Text style={[styles.Seccondtitle, styles.textAlign]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.price, styles.textAlign]}>
                          מחיר: {item.price}
                        </Text>
                        <Text style={[styles.location, styles.textAlign]}>
                          מיקום: {item.city}
                        </Text>
                        <Text style={[styles.location, styles.textAlign]}>
                          פלאפון: {item.phoneNumber}
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

                      {/* צד ימין - תמונה */}
                      <View style={styles.imageContainerRight}>
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
                              style={styles.arrowLeft}
                              onPress={() => handlePreviousImage(item.id)}
                            >
                              <Icon
                                name="chevron-left"
                                size={24}
                                color="white"
                              />
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.arrowRight}
                              onPress={() => handleNextImage(item.id)}
                            >
                              <Icon
                                name="chevron-right"
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
                    </View>

                    {/* תוכן מורחב */}
                    {expandedCard === item.id && (
                      <View style={styles.expandedContent}>
                        <Text style={styles.description}>
                          תיאור: {item.description}
                        </Text>

                        {/* כפתורי פעולה */}
                        <View
                          style={{
                            flexDirection: "row",
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

            <Text style={styles.deleteConfirmText}>
              האם אתה בטוח שברצונך למחוק את הפוסט?
              {selectedPost && (
                <Text style={styles.title}>
                  {"\n"}"{selectedPost.title}"
                </Text>
              )}
            </Text>

            <View style={styles.deleteModalButtons}>
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
                style={styles.input}
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
              />

              <Text style={styles.label}>כותרת:</Text>
              <TextInput
                style={[styles.input, { height: 60 }]}
                value={editedValues.title}
                onChangeText={(text) =>
                  setEditedValues((prev) => ({ ...prev, title: text }))
                }
                placeholder="כותרת"
                multiline
              />

              <Text style={styles.label}>תיאור:</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={editedValues.description}
                onChangeText={(text) =>
                  setEditedValues((prev) => ({ ...prev, description: text }))
                }
                placeholder="תיאור"
                multiline
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 50,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 70,
    marginBottom: 20,

    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  addButton: {
    backgroundColor: "#C6A052",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
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

  image: {
    width: "95%",
    height: "80%",
    resizeMode: "cover",
    borderRadius: 10,
    marginLeft: 10,
  },

  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginTop: 10,
    flexShrink: 1,
  },
  Seccondtitle: {
    fontSize: 15,
    marginTop: 4,
    color: "#333",
    textAlign: "center",
    flexShrink: 1,
  },

  price: {
    marginTop: 10,
    fontSize: 15,
    color: "#333",
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
    matgintop: 200,
    fontSize: 11,
    color: "#555",
    textAlign: "center",
    overflow: "hidden",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },

  sliderContainer: {
    alignItems: "center",
  },

  button: {
    backgroundColor: "#C6A052",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
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
    width: "100%",
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
    top: 165,
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
    flex: 1,
  },

  imageContainerRight: {
    width: "55%",

    aspectRatio: 1,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },

  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // רווחים שווים בין השניים
    alignItems: "flex-start", // יתחילו מאותו גובה
    marginVertical: 5,
  },

  textContainerRight: {
    width: "48%",
    alignItems: "flex-end", // טקסט מיושר לימין
    paddingVertical: 5,
  },

  textContainerLeft: {
    width: "48%",
    alignItems: "flex-start", // טקסט מיושר לשמאל
    marginLeft: 10,
  },

  textAlign: {
    width: "100%",
    textAlign: "left",
  },

  buttonInRow: {
    backgroundColor: "#C6A052",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginLeft: 40,
    marginTop: 10,
    alignSelf: "flex-start",
  },

  expandedContent: {
    width: "100%",
    paddingHorizontal: 10,
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

  deleteModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between", // רווחים שווים בין השניים
    alignItems: "flex-start", // יתחילו מאותו גובה
    marginVertical: 5,
    width: "70%",
    gap: 10,
    marginRight: 100,
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
});

export default MyPosts;
