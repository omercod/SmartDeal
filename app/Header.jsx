import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../app/(auth)/firebase";
import { Alert } from "react-native";
import { Modal } from "react-native";
import { TouchableWithoutFeedback} from "react-native";

const Header = () => {
  const navigation = useNavigation();
  const [currentPopup, setCurrentPopup] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState([]);
  const [calendarOffers, setCalendarOffers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(1);
  const [currentOfferIndex, setCurrentOfferIndex] = useState(0);
  const [showReviewPrompt, setShowReviewPrompt] = useState(false);
  const [reviewProvider, setReviewProvider] = useState(null);
  const [pendingReviews, setPendingReviews] = useState([]);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsLoggedIn(true);

        const offersQuery = query(
          collection(db, "Offers"),
          where("clientEmail", "==", user.email),
          where("answer", "==", 2)
        );

        const reviewQuery = query(
          collection(db, "PendingReviews"),
          where("clientEmail", "==", user.email),
          where("reviewed", "==", false)
        );

        const unsubscribeReview = onSnapshot(reviewQuery, (snapshot) => {
          const reviews = snapshot.docs.map((doc) => ({
            id: doc.id,
            type: "review", // מזהה שהיא ביקורת
            ...doc.data(),
          }));
          if (reviews.length > 0) {
            setPendingReviews(reviews);
          } else {
            setPendingReviews([]);
          }
        });

        const calendarQuery = query(
          collection(db, "Offers"),
          where("providerEmail", "==", user.email)
        );

        const unsubscribeMessages = onSnapshot(offersQuery, (querySnapshot) => {
          const messages = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setUnreadMessages(messages);
        });

        const handleDelete = (id) => {
          Alert.alert(
            "אישור מחיקה",
            "האם אתה בטוח שברצונך למחוק את ההצעה הזו?",
            [
              {
                text: "ביטול",
                style: "cancel",
              },
              {
                text: "מחק",
                style: "destructive",
                onPress: async () => {
                  try {
                    const offerRef = doc(db, "Offers", id);
                    await deleteDoc(offerRef);
                    setCalendarOffers((prev) =>
                      prev.filter((offer) => offer.id !== id)
                    );
                  } catch (error) {
                    console.error("שגיאה במחיקה:", error);
                  }
                },
              },
            ],
            { cancelable: true }
          );
        };

        const unsubscribeCalendar = onSnapshot(
          calendarQuery,
          (querySnapshot) => {
            const calendarData = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setCalendarOffers(calendarData);
          }
        );
        return () => {
          unsubscribeMessages();
          unsubscribeCalendar();
          unsubscribeReview();
        };
      } else {
        setIsLoggedIn(false);
        setUnreadMessages([]);
        setCalendarOffers([]);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleMessagesPress = () => {
    if (!isLoggedIn) {
      navigation.navigate("(auth)/sign-in");
    } else {
      if (currentPopup === "messages") {
        setCurrentPopup(null);
      } else {
        setCurrentPopup("messages");
      }
    }
  };

  const handleCalendarPress = () => {
    if (currentPopup === "calendar") {
      setCurrentPopup(null);
    } else {
      setCurrentPopup("calendar");
    }
  };

  const handleAccept = async (id) => {
    const offer = unreadMessages.find((msg) => msg.id === id);
    setUnreadMessages((prev) => prev.filter((msg) => msg.id !== id));

    try {
      const offerRef = doc(db, "Offers", id);
      await updateDoc(offerRef, { answer: 1 });

      // שמירה של בקשת ביקורת במסד
      await addDoc(collection(db, "PendingReviews"), {
        clientEmail: offer.clientEmail,
        providerEmail: offer.providerEmail,
        providerName: offer.providerName,
        offerId: id,
        jobTitle: offer.jobTitle,
        createdAt: new Date(),
        reviewed: false,
      });

      console.log("Offer accepted and review task added");
    } catch (error) {
      console.error("Error accepting offer:", error);
    }
  };

  const handleReject = async (id) => {
    setUnreadMessages((prev) => prev.filter((message) => message.id !== id));
    try {
      const offerRef = doc(db, "Offers", id);
      await updateDoc(offerRef, { answer: 0 });
    } catch (error) {
      console.error("Error rejecting offer:", error);
    }
  };

  const getFilteredOffers = () => {
    return calendarOffers.filter((offer) => offer.answer === selectedFilter);
  };

  const getFilterButtonStyle = (filterValue) => {
    let backgroundColor;
    switch (filterValue) {
      case 1: // התקבלה
        backgroundColor =
          selectedFilter === filterValue ? "#136f3c" : "#e6f4ea";
        break;
      case 0: // נדחתה
        backgroundColor =
          selectedFilter === filterValue ? "#9c2430" : "#fdeaea";
        break;
      case 2: // ממתינה
        backgroundColor =
          selectedFilter === filterValue ? "#C6A052" : "#fff3e0";
        break;
      default:
        backgroundColor = "#f0f0f0";
    }
    return {
      ...styles.filterButton,
      backgroundColor,
    };
  };

  const getFilterTextStyle = (filterValue) => {
    let color;
    if (selectedFilter === filterValue) {
      color = "white"; // טקסט לבן כשהכפתור נבחר
    } else {
      switch (filterValue) {
        case 1: // התקבלה
          color = "#136f3c";
          break;
        case 0: // נדחתה
          color = "#9c2430";
          break;
        case 2: // ממתינה
          color = "#f49d1a";
          break;
        default:
          color = "#333";
      }
    }
    return {
      ...styles.filterButtonText,
      color,
    };
  };
  const handleDelete = async (id) => {
    try {
      const offerRef = doc(db, "Offers", id);
      await deleteDoc(offerRef);
      setUnreadMessages((prev) => prev.filter((message) => message.id !== id));
      setCalendarOffers((prev) => prev.filter((offer) => offer.id !== id));
    } catch (error) {
      console.error("Error deleting offer:", error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.navigate("(tabs)")}>
          <Image
            source={require("../assets/logo/logo2.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.rightIcons}>
          <View style={{ position: "relative" }}>
            <TouchableOpacity style={styles.icon} onPress={handleMessagesPress}>
              <Ionicons name="chatbubble-outline" size={24} color="white" />
              {isLoggedIn &&
                unreadMessages.length + pendingReviews.length > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadMessages.length + pendingReviews.length}
                    </Text>
                  </View>
                )}
            </TouchableOpacity>
            <Modal
              visible={currentPopup === "messages"}
              transparent
              animationType="fade"
              onRequestClose={() => setCurrentPopup(null)}
            >
              <View style={styles.modalOverlay}>
                {/* Overlay לסגירה – רק הרקע מסביב! */}
                <TouchableWithoutFeedback onPress={() => setCurrentPopup(null)}>
                  <View style={StyleSheet.absoluteFillObject} />
                </TouchableWithoutFeedback>

                {/* הפופאפ עצמו – גלילה מלאה מכל נקודה */}
                <View style={styles.messagesPopup}>
                  <FlatList
                    data={[
                      ...pendingReviews,
                      ...unreadMessages.map((msg) => ({
                        type: "offer",
                        ...msg,
                      })),
                    ]}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="always"
                    showsVerticalScrollIndicator={true}
                    style={{ flex: 1 }}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => {
                      if (item.type === "review") {
                        return (
                          <View style={styles.reviewPopup}>
                            <Text style={styles.reviewPromptText}>
                              האם {item.providerName} נתן לך שירות?
                            </Text>
                            <Text style={styles.jobInfo}>
                              <Text style={styles.boldText}>עבור: </Text>
                              {item.jobTitle || "לא צוין"}
                            </Text>
                            <Text style={styles.reviewPromptText}>
                              רוצה להשאיר ביקורת?
                            </Text>
                            <View style={styles.aceeptornot}>
                              <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={() => {
                                  navigation.navigate("(main)/ReviewsScreen", {
                                    providerEmail: item.providerEmail,
                                    providerName: item.providerName,
                                    offerId: item.offerId,
                                    reviewId: item.id,
                                  });
                                }}
                              >
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color="white"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={async () => {
                                  await deleteDoc(
                                    doc(db, "PendingReviews", item.id)
                                  );
                                  setPendingReviews((prev) =>
                                    prev.filter(
                                      (review) => review.id !== item.id
                                    )
                                  );
                                }}
                              >
                                <Ionicons
                                  name="close"
                                  size={20}
                                  color="white"
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        );
                      }

                      // אחרת - זו הצעת מחיר רגילה
                      return (
                        <View style={styles.messageItem}>
                          <Text style={styles.messageMainText}>
                            {item.providerName} הציע:{" "}
                            <Text style={[styles.offerText, styles.greenText]}>
                              ₪{item.OfferPrice}
                            </Text>
                          </Text>
                          <Text style={styles.jobInfo}>
                            <Text style={styles.boldText}>עבור: </Text>
                            {item.jobType}
                          </Text>
                          <Text style={styles.descriptionTitle}>
                            <Text style={styles.boldText}>שירות: </Text>
                            <Text style={styles.descriptionContent}>
                              {item.jobTitle || "לא צוין"}
                            </Text>
                          </Text>
                          <Text style={styles.descriptionTitle}>
                            <Text style={styles.boldText}>תיאור: </Text>
                            <Text style={styles.descriptionContent}>
                              {item.note || "לא צוין"}
                            </Text>
                          </Text>
                          <View style={styles.actionButtons}>
                            <View style={styles.aceeptornot}>
                              <TouchableOpacity
                                style={styles.acceptButton}
                                onPress={() => handleAccept(item.id)}
                              >
                                <Ionicons
                                  name="checkmark"
                                  size={20}
                                  color="white"
                                />
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.rejectButton}
                                onPress={() => handleReject(item.id)}
                              >
                                <Ionicons
                                  name="close"
                                  size={20}
                                  color="white"
                                />
                              </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                              style={styles.moreInfoButton}
                              onPress={() => {
                                navigation.navigate(
                                  "(main)/ProviderReviewsScreen",
                                  {
                                    providerEmail: item.providerEmail,
                                    providerName: item.providerName,
                                  }
                                );
                              }}
                            >
                              <Text style={styles.moreInfoButtonText}>
                                ביקורות
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    }}
                    getItemLayout={(data, index) => ({
                      length: 380,
                      offset: 380 * index,
                      index,
                    })}
                    ListEmptyComponent={
                      <Text style={styles.messageSubText}>
                        אין הודעות חדשות כרגע.
                      </Text>
                    }
                  />
                </View>
              </View>
            </Modal>
          </View>

          <View style={{ position: "relative" }}>
            <TouchableOpacity style={styles.icon} onPress={handleCalendarPress}>
              <Ionicons name="calendar-outline" size={24} color="white" />
              {isLoggedIn && calendarOffers.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{calendarOffers.length}</Text>
                </View>
              )}
            </TouchableOpacity>

            {currentPopup === "calendar" && (
              <View style={styles.calendarPopup} pointerEvents="box-none">
                <View style={styles.filterContainer}>
                  <TouchableOpacity
                    style={getFilterButtonStyle(1)}
                    onPress={() => setSelectedFilter(1)}
                  >
                    <Text style={getFilterTextStyle(1)}>התקבלה</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={getFilterButtonStyle(0)}
                    onPress={() => setSelectedFilter(0)}
                  >
                    <Text style={getFilterTextStyle(0)}>נדחתה</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={getFilterButtonStyle(2)}
                    onPress={() => setSelectedFilter(2)}
                  >
                    <Text style={getFilterTextStyle(2)}>ממתינה</Text>
                  </TouchableOpacity>
                </View>

                {getFilteredOffers().length > 0 ? (
                  <FlatList
                    data={getFilteredOffers()}
                    scrollEnabled={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="always"
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    showsVerticalScrollIndicator={true}
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.offerItem}>
                        {/* כפתור איקס למחיקה */}
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDelete(item.id)}
                        >
                          <Ionicons name="close" size={22} color="#C6A052" />
                        </TouchableOpacity>

                        {/* תוכן ההצעה */}
                        <Text style={styles.jobInfo}>
                          <Text style={styles.boldText}>שם הלקוח: </Text>
                          {item.clientName || "לא ידוע"}
                        </Text>
                        <Text style={styles.jobInfo}>
                          <Text style={styles.boldText}>הצעה על סך: </Text>₪
                          {item.OfferPrice || "לא צוין"}
                        </Text>
                        <Text style={styles.jobInfo}>
                          <Text style={styles.boldText}>תיאור השירות: </Text>
                          {item.jobTitle || "אין תיאור"}
                        </Text>
                        <Text
                          style={[
                            styles.jobInfo,
                            {
                              color:
                                item.answer === 1
                                  ? "#136f3c" // התקבלה
                                  : item.answer === 0
                                    ? "#9c2430" // נדחתה
                                    : "#C6A052", // ממתינה
                            },
                          ]}
                        >
                          <Text style={styles.boldText}>סטטוס: </Text>
                          {item.answer === 1
                            ? "התקבלה"
                            : item.answer === 0
                              ? "נדחתה"
                              : "ממתינה"}
                        </Text>
                      </View>
                    )}
                    getItemLayout={(data, index) => ({
                      length: 120,
                      offset: 120 * index,
                      index,
                    })}
                  />
                ) : (
                  <Text style={styles.messagesText}>
                    אין הצעות בקטגוריה זו.
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
  
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "transparent",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingHorizontal: 16,
    height: 90,
    width: "100%",
    backgroundColor: "#333",
    zIndex: 999,
  },
  logo: {
    width: 150,
    height: 40,
  },
  rightIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    marginLeft: 20,
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "red",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },

  messagesPopup: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    minWidth: 300,
    maxHeight: 378,
    height: 378,
    zIndex: 1000,
  },
  messageItem: {
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  messageContent: {
    flex: 1,
    marginRight: 10,
  },
  messageMainText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#222",
    marginBottom: 0,
    textAlign: "center",
  },
  offerText: {
    fontSize: 14,
    textAlign: "right",
    marginTop: 0,
    marginBottom: 0,
  },
  jobInfo: {
    padding: 0.3,
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    marginTop: 0,
    marginBottom: 0,
  },
  descriptionTitle: {
    padding: 0.3,
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    marginTop: 2,
    marginBottom: 0,
  },
  descriptionContent: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    marginTop: 0,
    marginBottom: 0,
  },
  boldText: {
    fontWeight: "bold",
    color: "#000",
  },
  messageSubText: {
    fontSize: 13,
    color: "#555",
    textAlign: "right",
    marginRight: 10,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 30,
  },
  aceeptornot: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
    gap: 5,
  },
  acceptButton: {
    backgroundColor: "#C6A052",
    padding: 8,
    borderRadius: 50,
    marginRight: 5,
    shadowColor: "#8C733A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 90,
    paddingRight: 10,
    marginRight: 5,
    marginTop: 15,
  },
  rejectButton: {
    backgroundColor: "#3D3D3D",
    padding: 8,
    borderRadius: 50,
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  calendarPopup: {
    position: "absolute",
    top: 30,
    right: 0,
    backgroundColor: "#f7f7f7",
    borderRadius: 10,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    minWidth: 300,
    maxHeight: 353,
    height: 353,
    zIndex: 1000,
  },
  offerItem: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    height: 100,
  },

  acceptedText: {
    color: "#136f3c",
  },
  rejectedText: {
    color: "#9c2430",
  },
  pendingText: {
    color: "#C6A052",
  },
  messagesText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    paddingVertical: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  closeIcon: {
    position: "absolute",

    zIndex: 1,
    backgroundColor: "transparent",
    padding: 5,
  },
  closeIconText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#C6A052",
  },
  greenText: {
    color: "#C6A052",
  },
  boldText: {
    fontWeight: "bold",
  },
  moreInfoButton: {
    backgroundColor: "#C6A052",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  moreInfoButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  reviewPopup: {
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  reviewPromptText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    left: 5,
    padding: 5,
    zIndex: 1,
  },
});

export default Header;
