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
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../(auth)/firebase";

const { width } = Dimensions.get("window");

const CustomerBanner = () => {
  const [customers, setCustomers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

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
    if (customers.length === 0) return;

    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % customers.length);
        slideAnim.setValue(50);

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

    return () => clearInterval(interval);
  }, [customers, fadeAnim, slideAnim]);

  if (customers.length === 0) {
    return (
      <Text style={{ textAlign: "center", marginTop: 20 }}>טוען לקוחות...</Text>
    );
  }

  const customer = customers[currentIndex];

  const handleMoreInfo = () => {
    console.log(`More info requested for ${customer.businessName}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>הלקוחות הקבועים שלנו</Text>
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
          {/* תמונה בצד ימין */}
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={() => setShowFullImage(true)}
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

          {/* מידע על העסק בצד שמאל */}
          <View style={styles.infoContainer}>
            <View style={styles.businessHeader}>
              <Text style={styles.nameText} numberOfLines={1}>
                {customer.businessName}
              </Text>
              <Text style={styles.locationText}>{customer.location}</Text>
            </View>

            <Text style={styles.testimonialText} numberOfLines={2}>
              "{customer.description}"
            </Text>

            <TouchableOpacity
              style={styles.moreInfoButton}
              onPress={handleMoreInfo}
            >
              <Text style={styles.moreInfoButtonText}>ליצירת קשר</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* מודל להצגת התמונה בגודל מלא */}
      <Modal
        visible={showFullImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullImage(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowFullImage(false)}
        >
          <View style={styles.modalContent}>
            <Image
              source={{ uri: customer.bannerImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFullImage(false)}
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
    width: width - 30,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 15,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
  },

  bannerContainer: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    width: 150,
    height: 110,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 12,
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
    justifyContent: "space-between",
    height: 110,
  },
  businessHeader: {
    alignItems: "flex-end",
  },
  nameText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C6A052",
    textAlign: "right",
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
    marginTop: 2,
  },
  testimonialText: {
    fontSize: 13,
    color: "#555",
    textAlign: "right",
    fontStyle: "italic",
    lineHeight: 18,
  },
  moreInfoButton: {
    backgroundColor: "#C6A052",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: "flex-end",
  },
  moreInfoButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
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
});

export default CustomerBanner;
