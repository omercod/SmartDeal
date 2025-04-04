import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Image,
  TouchableOpacity,
} from "react-native";

const { width } = Dimensions.get("window");

const customers = [
  {
    id: "1",
    name: "אבי כהן",
    business: 'שיפוצים א.כ בע"מ',
    location: "תל אביב",
    testimonial: "מצאתי עבודות איכותיות דרך האפליקציה, ממליץ בחום!",
    imageUrl: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "מיכל לוי",
    business: "קייטרינג מיכל",
    location: "חיפה",
    testimonial: "האפליקציה עזרה לי להרחיב את העסק שלי בצורה משמעותית",
    imageUrl: "https://randomuser.me/api/portraits/women/44.jpg",
  },
  {
    id: "3",
    name: "יוסי אברהם",
    business: "צילום אירועים",
    location: "ירושלים",
    testimonial: "כבר שנתיים אני מוצא לקוחות דרך האפליקציה, שירות מעולה!",
    imageUrl: "https://randomuser.me/api/portraits/men/68.jpg",
  },
  {
    id: "4",
    name: "רונית שמעון",
    business: "עיצוב פנים רונית",
    location: "באר שבע",
    testimonial: "הפלטפורמה המושלמת למציאת פרויקטים חדשים",
    imageUrl: "https://randomuser.me/api/portraits/women/65.jpg",
  },
];

const CustomerBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out and slide out
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
  }, [fadeAnim, slideAnim]);

  const customer = customers[currentIndex];

  const handleMoreInfo = () => {
    console.log(`More info requested for ${customer.name}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>הלקוחות הקבועים שלנו:</Text>
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
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: customer.imageUrl }}
              style={styles.profileImage}
              resizeMode="cover"
            />
          </View>

          {/* טקסט בצד שמאל */}
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>{customer.name}</Text>
            <Text style={styles.businessText}>{customer.business}</Text>
            <Text style={styles.locationText}>מיקום: {customer.location}</Text>
            <Text style={styles.testimonialText}>"{customer.testimonial}"</Text>

            <TouchableOpacity
              style={styles.moreInfoButton}
              onPress={handleMoreInfo}
            >
              <Text style={styles.moreInfoButtonText}>ליצירת קשר </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: width - 30,
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "right",
  },
  bannerContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#C6A052",
    minHeight: 180,
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  imageContainer: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#C6A052",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C6A052",
    textAlign: "right",
    marginBottom: 5,
  },
  businessText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginBottom: 5,
  },
  locationText: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
    marginBottom: 5,
  },
  testimonialText: {
    fontSize: 14,
    color: "#555",
    textAlign: "right",
    fontStyle: "normal",
    marginBottom: 7,
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
});

export default CustomerBanner;
