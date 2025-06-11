import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  TouchableOpacity,
  Modal,
  I18nManager,
  Platform,
  Linking,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../(auth)/firebase";

const { width } = Dimensions.get("window");

const CustomerBanner = () => {
  const [customers, setCustomers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [showContactInfo, setShowContactInfo] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);

  // טעינת הלקוחות מה-DB
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "BusinessUsers"));
        const fetched = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCustomers(fetched);
      } catch (error) {
        console.error("שגיאה בטעינת לקוחות:", error);
      }
    };

    fetchCustomers();
  }, []);

  // אפקט האנימציה
  useEffect(() => {
    if (customers.length === 0 || showFullImage) return; // Add showFullImage check

    const startSlideshow = () => {
      const slideDirection = I18nManager.isRTL ? 50 : -50;
      const initialSlide = I18nManager.isRTL ? -50 : 50;

      intervalRef.current = setInterval(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: slideDirection,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % customers.length);
          slideAnim.setValue(initialSlide);

          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
          ]).start();
        });
      }, 5000);
    };

    startSlideshow();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [customers, fadeAnim, slideAnim, showFullImage]); // Add showFullImage to dependencies

  // Force RTL at the component level
  useEffect(() => {
    // Force RTL
    if (I18nManager.isRTL === false) {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    }
  }, []);

  if (customers.length === 0) {
    return (
      <Text style={{ textAlign: "center", marginTop: 20 }}>טוען לקוחות...</Text>
    );
  }

  const customer = customers[currentIndex];

  const handleMoreInfo = () => {
    setShowContactInfo(true);
  };

  const handleCall = () => {
    if (customer.phoneNumber) {
      Linking.openURL(`tel:${customer.phoneNumber}`);
    }
    setShowContactInfo(false);
  };

  // Update the image press handler
  const handleImagePress = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setShowFullImage(true);
  };

  // Update the modal close handler
  const handleCloseModal = () => {
    setShowFullImage(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>הלקוחות הקבועים שלנו:</Text>
      </View>

      <Animated.View
        style={[
          styles.bannerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        <View style={styles.contentContainer}>
          {/* מידע על העסק בצד ימין */}
          <View style={styles.infoContainer}>
            <View style={styles.businessHeader}>
              <Text style={styles.nameText} numberOfLines={1}>
                {customer.businessName}
              </Text>
              <Text style={styles.locationText}>{customer.location}</Text>
            </View>

            <Text style={styles.testimonialText} numberOfLines={3}>
              {customer.description}
            </Text>
          </View>

          {/* תמונה בצד שמאל */}
          <TouchableOpacity
            testID="imageTouchable"
            style={[
              styles.imageContainer,
              I18nManager.isRTL
                ? { marginRight: 12, marginLeft: 0 }
                : { marginLeft: 12 },
            ]}
            onPress={handleImagePress}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: customer.bannerImage }}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.imageBadge}>
              <Text style={styles.badgeText}>לחץ להגדלה</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* כפתור יצירת קשר בחלק התחתון ימין */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            testID="contactButton"
            style={styles.moreInfoButton}
            onPress={handleMoreInfo}
          >
            <Text style={styles.moreInfoButtonText}>ליצירת קשר</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* מודל להצגת התמונה בגודל מלא */}
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleCloseModal}
        >
          <View style={styles.modalContent}>
            <Image
              source={{ uri: customer.bannerImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              testID="closeImageModal"
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* מודל ליצירת קשר */}
      <Modal
        visible={showContactInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowContactInfo(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowContactInfo(false)}
        >
          <View style={styles.contactModalContent}>
            <Text style={styles.contactModalTitle}>
              {customer.businessName}
            </Text>
            <Text style={styles.contactModalPhone}>
              טלפון: {customer.phoneNumber || "לא זמין"}
            </Text>
            {customer.phoneNumber && (
              <TouchableOpacity
                testID="callNowButton"
                style={styles.callButton}
                onPress={handleCall}
              >
                <Text style={styles.callButtonText}>התקשר עכשיו</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              testID="closeContactModal"
              style={styles.closeContactButton}
              onPress={() => setShowContactInfo(false)}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Platform.OS === "android" ? width - 10 : width - 20,
    marginHorizontal: Platform.OS === "android" ? 15 : 10,
    marginTop: Platform.OS === "android" ? 10 : 15,
    marginBottom: Platform.OS === "android" ? 15 : 15,
  },
  headerContainer: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 8,
    paddingRight: 5,
  },
  headerText: {
    fontSize: Platform.OS === "android" ? 18 : 18,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
  },

  bannerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: Platform.OS === "android" ? 12 : 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    minHeight: Platform.OS === "android" ? 150 : 160,
  },
  contentContainer: {
    flexDirection: I18nManager.isRTL ? "row" : "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  imageContainer: {
    width: Platform.OS === "android" ? 150 : 160,
    height: Platform.OS === "android" ? 130 : 140,
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  imageBadge: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 3,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    textAlign: "center",
    fontWeight: "500",
  },
  infoContainer: {
    flex: 1,
    justifyContent: "flex-start",
    height: Platform.OS === "android" ? 130 : 140,
    paddingLeft: Platform.OS === "android" ? 5 : 5,
    paddingRight: Platform.OS === "android" ? 5 : 5,
    alignItems: "flex-end",
  },
  businessHeader: {
    alignItems: "flex-end",
    width: "100%",
  },
  nameText: {
    fontSize: Platform.OS === "android" ? 18 : 18,
    fontWeight: "bold",
    color: "#C6A052",
    textAlign: "right",
    width: "100%",
  },
  locationText: {
    fontSize: Platform.OS === "android" ? 14 : 14,
    color: "#666",
    textAlign: "right",
    fontWeight: "bold",
    marginTop: 2,
    width: "100%",
  },
  testimonialText: {
    fontSize: Platform.OS === "android" ? 14 : 14,
    color: "#555",
    textAlign: "right",
    lineHeight: Platform.OS === "android" ? 20 : 20,
    width: "100%",
    marginTop: 5,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingRight: 5,
  },
  moreInfoButton: {
    backgroundColor: "#C6A052",
    paddingVertical: Platform.OS === "android" ? 8 : 8,
    paddingHorizontal: Platform.OS === "android" ? 20 : 20,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  moreInfoButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: Platform.OS === "android" ? 14 : 14,
  },
  // סגנונות למודל
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    height: "60%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    bottom: 15,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: "#C6A052",
    borderRadius: 20,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  contactModalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  contactModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C6A052",
    marginBottom: 15,
    textAlign: "center",
  },
  contactModalPhone: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  callButton: {
    backgroundColor: "#C6A052",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 15,
  },
  callButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
  closeContactButton: {
    backgroundColor: "#333",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
});

export default CustomerBanner;
