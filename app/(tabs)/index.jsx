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
import { AnimatedCounters } from "../../components/animated-counter";
import { useRouter } from "expo-router";
import { Link } from "expo-router";
import { useNavigation } from "@react-navigation/native";
const { width, height } = Dimensions.get("window");
import { getAuth } from "firebase/auth";

export default function HomeScreen() {
  const router = useRouter();
  const scrollViewRef = useRef(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigation = useNavigation();

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

  const isTablet = width > 600;

  useEffect(() => {
    if (scrollViewRef.current && I18nManager.isRTL) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [router.pathname]);

  const handlePress = () => {
    if (isLoggedIn) {
      navigation.navigate("(main)/user-page");
    } else {
      navigation.navigate("(auth)/sign-up");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>מחפשים שירות במחיר המתאים?</Text>
          <Text style={[styles.heroSubtitle, { writingDirection: "rtl" }]}>
            משנים את הדרך שבה אתם מוצאים ומשווים נותני שירות. חסכו זמן וכסף
            וקבלו את השירות הטוב ביותר.
          </Text>
          <TouchableOpacity style={styles.heroButton} onPress={handlePress}>
            <Text style={styles.heroButtonText}>התחילו עכשיו</Text>
          </TouchableOpacity>
        </View>

        {/* AnimatedCounters Section */}
        <View style={styles.animatedCountersContainer}>
          <AnimatedCounters />
        </View>
        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>למה לבחור ב-SmartDeal?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{
              flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
            }}
            ref={scrollViewRef}
          >
            {[
              {
                icon: "shield",
                title: "אמינות ושקיפות",
                description: "מנגנון בניית אמון",
              },
              {
                icon: "flash",
                title: "המלצות מותאמות",
                description: "הצעות מותאמות לצרכים שלכם",
              },
              {
                icon: "star",
                title: "הערכת איכות",
                description: "ביקורות ודירוגים מאומתים",
              },
              {
                icon: "search",
                title: "השוואת מחירים",
                description: "מצאו את ההצעות הטובות ביותר",
              },
            ].map((feature, index) => (
              <View
                key={index}
                style={[styles.featureCard, { width: isTablet ? 300 : 250 }]}
              >
                <View style={styles.featureIcon}>
                  <Ionicons name={feature.icon} size={24} color="#D4AF37" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>
                  {feature.description}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* How It Works Section */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>איך SmartDeal עובד?</Text>
          {[
            {
              number: 1,
              title: "תארו את השירות",
              description: "ספרו לנו איזה שירות אתם מחפשים",
            },
            {
              number: 2,
              title: "קבלו הצעות",
              description: "קבלו הצעות מחיר תחרותיות",
            },
            {
              number: 3,
              title: "השוו ובחרו",
              description: "השוו מחירים ואיכות שירות",
            },
            {
              number: 4,
              title: "הזמינו שירות",
              description: "בחרו את נותן השירות המועדף",
            },
          ].map((step, index) => (
            <View key={index} style={styles.stepCard}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{step.number}</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Testimonials Section */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.testimonialsSectionTitle}>
            מה הלקוחות שלנו אומרים
          </Text>
          {[
            {
              name: "גיא בר",
              role: "סטודנט, 25",
              quote:
                "הייתי צריך הובלה דחופה, והייתי לחוץ קצת בכסף. SmartDeal עזרה לי למצוא הובלה במחיר הוגן תוך זמן קצר. חסכו לי זמן וכסף!",
              avatar: require("../../assets/images/student.png"),
            },
            {
              name: "גל כהן",
              role: "אמא לשני ילדים, 42",
              quote:
                "לא מצאתי הרבה זמן סידור לילד הקטן, אבל עם SmartDeal מצאתי בייביסיטר מצוין במחיר סביר ובמהירות. זה מאוד עזר לי לארגן את היום!",
              avatar: require("../../assets/images/parent.png"),
            },
            // More testimonials...
          ].map((testimonial, index) => (
            <View key={index} style={styles.testimonialCard}>
              <View style={styles.testimonialHeader}>
                <View style={styles.testimonialAvatar}>
                  <Image source={testimonial.avatar} style={styles.avatar} />
                </View>
                <View>
                  <Text style={styles.testimonialName}>{testimonial.name}</Text>
                  <Text style={styles.testimonialRole}>{testimonial.role}</Text>
                </View>
              </View>
              <Text style={styles.testimonialQuote}>{testimonial.quote}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  heroSection: {
    backgroundColor: "#F5EFE6",
    padding: 100,
    alignItems: "center",
    paddingBottom: 30,
  },
  heroTitle: {
    fontSize: 35,
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
  heroButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  featuresSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  featureCard: {
    width: 250,
    backgroundColor: "#F5EFE6",
    borderRadius: 12,
    padding: 20,
    marginLeft: 16,
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
  featureDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  howItWorksSection: {
    padding: 24,
    backgroundColor: "#fff",
  },
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
  stepNumberText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    textAlign: "right",
  },
  stepDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "right",
  },
  testimonialsSection: {
    padding: 24,
    backgroundColor: "#D4AF37",
  },
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
    marginBottom: 16,
  },
  testimonialHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 12,
  },
  testimonialAvatar: {
    marginLeft: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50 / 2,
  },
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
  },
});
