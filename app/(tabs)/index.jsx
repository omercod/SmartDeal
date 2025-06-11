// Updated HomeScreen.jsx with scroll-triggered animations that activate once when visible
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  I18nManager,
  Dimensions,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import * as Animatable from "react-native-animatable";
import UserPage from "../(main)/user-page";
import { AnimatedCounters } from "../../components/animated-counter";

const { width, height } = Dimensions.get("window");
const isTablet = width > 600;

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();

  // Animation states for each section
  const [animationStates, setAnimationStates] = useState({
    hero: false,
    counters: false,
    features: false,
    howItWorks: false,
    testimonials: false,
  });

  // Refs for measuring component positions
  const heroRef = useRef(null);
  const countersRef = useRef(null);
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const testimonialsRef = useRef(null);

  useEffect(() => {
    I18nManager.forceRTL(true);
    I18nManager.allowRTL(true);
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (scrollViewRef.current && I18nManager.isRTL) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [router.pathname]);

  // Check initial visibility after component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      checkVisibility(0); // Check initial scroll position
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const handlePress = () => {
    if (isLoggedIn) {
      navigation.navigate("(main)/user-page");
    } else {
      navigation.navigate("(auth)/sign-up");
    }
  };

  // Function to check if component is in viewport
  const isInViewport = (componentY, componentHeight, scrollY) => {
    const viewportTop = scrollY;
    const viewportBottom = scrollY + height;
    const componentTop = componentY;
    const componentBottom = componentY + componentHeight;

    // Component is visible if any part is in viewport
    return componentBottom > viewportTop && componentTop < viewportBottom - 100; // 100px threshold
  };

  // Function to check visibility of all components
  const checkVisibility = (scrollY) => {
    const componentsToCheck = [
      { ref: heroRef, key: "hero" },
      { ref: countersRef, key: "counters" },
      { ref: featuresRef, key: "features" },
      { ref: howItWorksRef, key: "howItWorks" },
      { ref: testimonialsRef, key: "testimonials" },
    ];

    componentsToCheck.forEach(({ ref, key }) => {
      if (ref.current && !animationStates[key]) {
        ref.current.measure((x, y, width, height, pageX, pageY) => {
          if (isInViewport(pageY, height, scrollY)) {
            setAnimationStates((prev) => ({ ...prev, [key]: true }));
          }
        });
      }
    });
  };

  // Handle scroll events to trigger animations
  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    checkVisibility(scrollY);
  };

  if (isLoggedIn) return <UserPage />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View ref={heroRef}>
          <Animatable.View
            animation={animationStates.hero ? "fadeInUp" : undefined}
            duration={2600}
            style={styles.heroSection}
            useNativeDriver={true}
          >
            <Text style={styles.heroTitle}>מחפשים שירות במחיר המתאים?</Text>
            <Text style={styles.heroSubtitle}>
              משנים את הדרך שבה אתם מוצאים ומשווים נותני שירות. חסכו זמן וכסף
              וקבלו את השירות הטוב ביותר.
            </Text>
            <TouchableOpacity style={styles.heroButton} onPress={handlePress}>
              <Text style={styles.heroButtonText}>התחילו עכשיו</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>

        <View ref={countersRef}>
          <Animatable.View
            animation={animationStates.counters ? "fadeInUp" : undefined}
            duration={600}
            delay={200}
            style={styles.animatedCountersContainer}
            useNativeDriver={true}
          >
            <AnimatedCounters />
          </Animatable.View>
        </View>

        <View ref={featuresRef}>
          <Animatable.View
            animation={animationStates.features ? "fadeInUp" : undefined}
            duration={2600}
            delay={2800}
            style={styles.featuresSection}
            useNativeDriver={true}
          >
            <Text style={styles.sectionTitle}>למה לבחור ב-SmartDeal?</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexDirection: "row-reverse" }}
            >
              {["shield", "flash", "star", "search"].map((icon, index) => (
                <View
                  key={index}
                  style={[styles.featureCard, { width: isTablet ? 300 : 250 }]}
                >
                  <View style={styles.featureIcon}>
                    <Ionicons name={icon} size={24} color="#D4AF37" />
                  </View>
                  <Text style={styles.featureTitle}>
                    {icon === "shield"
                      ? "אמינות ושקיפות"
                      : icon === "flash"
                        ? "מהירות ויעילות"
                        : icon === "star"
                          ? "מותאם לכם"
                          : "תוצאה מדויקת"}
                  </Text>
                  <Text style={styles.featureDescription}>
                    {icon === "shield"
                      ? "כל נותן שירות מדורג"
                      : icon === "flash"
                        ? "בקשה אחת, עשרות הצעות."
                        : icon === "star"
                          ? "חוויה פשוטה ומדויקת בכל מכשיר"
                          : "האלגוריתם שלנו עושה את ההתאמה"}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </Animatable.View>
        </View>

        <View ref={howItWorksRef}>
          <Animatable.View
            animation={animationStates.howItWorks ? "fadeInUp" : undefined}
            duration={3600}
            delay={3600}
            style={styles.howItWorksSection}
            useNativeDriver={true}
          >
            <Text style={styles.sectionTitle}>איך SmartDeal עובד?</Text>
            {[1, 2, 3, 4].map((step, index) => (
              <View key={step} style={styles.stepCard}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>
                    {step === 1
                      ? "פרסמו בקשה"
                      : step === 2
                        ? "קבלו הצעות בזמן אמת"
                        : step === 3
                          ? "השוו ובחרו"
                          : "סגרו את העסקה"}
                  </Text>
                  <Text style={styles.stepDescription}>
                    {step === 1
                      ? "הגדירו איזה שירות אתם צריכים ומה התקציב."
                      : step === 2
                        ? "נותני השירות מגיבים לפי הדרישה."
                        : step === 3
                          ? "עיינו בביקורות ובחרו את ההצעה שמתאימה לכם."
                          : "יש לכם שירות מקצועי, מהיר ומשתלם."}
                  </Text>
                </View>
              </View>
            ))}
          </Animatable.View>
        </View>

        <View ref={testimonialsRef}>
          <Animatable.View
            animation={animationStates.testimonials ? "fadeInUp" : undefined}
            duration={6600}
            delay={6800}
            style={styles.testimonialsSection}
            useNativeDriver={true}
          >
            <Text style={styles.testimonialsSectionTitle}>
              מה הלקוחות שלנו אומרים
            </Text>
            {["student", "parent"].map((type, index) => (
              <View key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialHeader}>
                  <Image
                    source={
                      type === "student"
                        ? require("../../assets/images/student.png")
                        : require("../../assets/images/parent.png")
                    }
                    style={styles.avatar}
                  />
                  <View>
                    <Text style={styles.testimonialName}>
                      {type === "student" ? "גיא בר" : "גל כהן"}
                    </Text>
                    <Text style={styles.testimonialRole}>
                      {type === "student" ? "סטודנט, 25" : "אמא לשני ילדים, 42"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.testimonialQuote}>
                  {type === "student"
                    ? "הייתי צריך הובלה דחופה, והייתי לחוץ קצת בכסף. SmartDeal עזרה לי למצוא הובלה במחיר הוגן תוך זמן קצר. חסכו לי זמן וכסף!"
                    : "לא מצאתי הרבה זמן סידור לילד הקטן, אבל עם SmartDeal מצאתי בייביסיטר מצוין במחיר סביר ובמהירות. זה מאוד עזר לי לארגן את היום!"}
                </Text>
              </View>
            ))}
          </Animatable.View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollView: { flexGrow: 1 },
  heroSection: {
    backgroundColor: "#F5EFE6",
    padding: 60,
    alignItems: "center",
    paddingBottom: 40,
    marginTop: 40,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  heroSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
    writingDirection: "rtl",
  },
  heroButton: {
    backgroundColor: "#D4AF37",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  heroButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  featuresSection: { padding: 24 },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  featureCard: {
    backgroundColor: "#F5EFE6",
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 10,
    alignItems: "center",
  },
  featureIcon: {
    width: 60,
    height: 60,
    backgroundColor: "#fff",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  featureDescription: { fontSize: 14, color: "#666", textAlign: "center" },
  howItWorksSection: { padding: 24 },
  stepCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 20,
  },
  stepNumber: {
    width: 40,
    height: 40,
    backgroundColor: "#D4AF37",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
  },
  stepNumberText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  stepContent: { flex: 1 },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
  },
  stepDescription: { fontSize: 14, color: "#666", textAlign: "right" },
  testimonialsSection: { padding: 24, backgroundColor: "#D4AF37" },
  testimonialsSectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  testimonialCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 20,
    marginBottom: 10,
  },
  testimonialHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginLeft: 12 },
  testimonialName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "right",
  },
  testimonialRole: {
    fontSize: 14,
    color: "#fff",
    opacity: 0.8,
    textAlign: "right",
  },
  testimonialQuote: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    textAlign: "right",
    minHeight: 60,
    writingDirection: "rtl",
  },
});
