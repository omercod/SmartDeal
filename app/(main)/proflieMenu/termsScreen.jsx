import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = 70;

export default function TermsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top + HEADER_HEIGHT},
      ]}
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

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>תקנון השימוש באפליקציה</Text>

        <Text style={styles.sectionTitle}>1. כללי</Text>
        <Text style={styles.text}>
          ברוכים הבאים לאפליקציית <Text style={styles.bold}>SmartDeal</Text>. אפליקציה זו מופעלת ומתוחזקת על ידי{" "}
          <Text style={styles.bold}>איתי ועומר אונליין בע"מ</Text>. השימוש באפליקציה כפוף לתנאים המפורטים בתקנון זה.
        </Text>

        <Text style={styles.sectionTitle}>2. השימוש באפליקציה</Text>
        <Text style={styles.text}>
          האפליקציה מאפשרת למשתמשים לפרסם ולמצוא שירותים שונים.{" "}
          <Text style={styles.bold}>האחריות לתוכן המתפרסם באפליקציה היא על המשתמש בלבד</Text>.
        </Text>

        <Text style={styles.sectionTitle}>3. פרטיות ואבטחת מידע</Text>
        <Text style={styles.text}>
          אנו מכבדים את פרטיות המשתמשים. המידע שנאסף מוגבל לשם וכתובת אימייל בלבד.{" "}
          <Text style={styles.bold}>לא יועבר מידע לצדדים שלישיים.</Text>
        </Text>

        <Text style={styles.sectionTitle}>4. הגבלת גיל</Text>
        <Text style={styles.text}>
          השימוש באפליקציה מותר <Text style={styles.bold}>למשתמשים מגיל 18 ומעלה בלבד</Text>.
        </Text>

        <Text style={styles.sectionTitle}>5. אחריות</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>האפליקציה אינה אחראית</Text> לכל עסקה או אינטראקציה בין משתמשים.
        </Text>

        <Text style={styles.sectionTitle}>6. שינויים בתקנון</Text>
        <Text style={styles.text}>
          אנו שומרים לעצמנו את הזכות לעדכן את תנאי השימוש מעת לעת.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.065,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.02,
    marginTop: SCREEN_HEIGHT * 0.05,
    color: "#333",
  },
  sectionTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    marginTop: SCREEN_HEIGHT * 0.025,
    marginBottom: 5,
    color: "#C6A052",
    textAlign: "right",
  },
  text: {
    fontSize: SCREEN_WIDTH * 0.042,
    color: "#555",
    lineHeight: 26,
    textAlign: "right",
  },
  bold: {
    fontWeight: "bold",
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
});
