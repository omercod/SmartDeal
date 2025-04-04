import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function PrivacyPolicy() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* חץ חזור */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>מדיניות פרטיות</Text>

        <Text style={styles.sectionTitle}>1. כללי</Text>
        <Text style={styles.text}>
          אפליקציית <Text style={styles.bold}>SmartDeal</Text> מופעלת ומתוחזקת
          על ידי <Text style={styles.bold}>איתי ועומר אונליין בע"מ</Text>.
          פרטיות המשתמשים חשובה לנו, ואנו מתחייבים להגן על המידע שנאסף במסגרת
          השימוש באפליקציה.
        </Text>

        <Text style={styles.sectionTitle}>2. איזה מידע אנו אוספים?</Text>
        <Text style={styles.text}>
          במסגרת השימוש באפליקציה נאסף מידע בסיסי בלבד, הכולל:
          {"\n"}• שם מלא
          {"\n"}• כתובת אימייל
          {"\n"}* אין איסוף של מידע נוסף מעבר למידע ההכרחי לשימוש באפליקציה.
        </Text>

        <Text style={styles.sectionTitle}>3. שימוש במידע</Text>
        <Text style={styles.text}>
          המידע שנאסף משמש למטרות הבאות בלבד:
          {"\n"}• יצירת חשבון משתמש וניהולו
          {"\n"}• יצירת קשר עם המשתמש במידת הצורך
          {"\n"}• שיפור חוויית השימוש באפליקציה
          {"\n"}
          <Text style={styles.bold}>
            SmartDeal אינה מעבירה מידע לצדדים שלישיים
          </Text>
          .
        </Text>

        <Text style={styles.sectionTitle}>4. אבטחת מידע</Text>
        <Text style={styles.text}>
          אנו נוקטים באמצעים סבירים על מנת להגן על המידע של המשתמשים, כולל שימוש
          בטכנולוגיות הצפנה ואבטחת נתונים. עם זאת, אין מערכת מאובטחת לחלוטין,
          ולכן איננו יכולים להבטיח הגנה מוחלטת מפני פריצות.
        </Text>

        <Text style={styles.sectionTitle}>5. שימוש למשתמשים מעל גיל 18</Text>
        <Text style={styles.text}>
          השימוש באפליקציה מותר{" "}
          <Text style={styles.bold}>למשתמשים מגיל 18 ומעלה בלבד</Text>. במידה
          ויתגלה שמשתמש מתחת לגיל 18 השתמש באפליקציה, אנו שומרים לעצמנו את הזכות
          להסיר את חשבונו.
        </Text>

        <Text style={styles.sectionTitle}>6. שינויים במדיניות</Text>
        <Text style={styles.text}>
          אנו שומרים לעצמנו את הזכות לעדכן את מדיניות הפרטיות מעת לעת. במקרה של
          שינוי מהותי, נעדכן את המשתמשים בהתאם. המשך השימוש באפליקציה לאחר עדכון
          המדיניות יהווה הסכמה לשינויים.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingHorizontal: 20,
    paddingTop: 90,
    paddingBottom: 50,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
    color: "#C6A052",
    textAlign: "right",
  },
  text: {
    fontSize: 16,
    color: "#555",
    lineHeight: 24,
    textAlign: "right",
  },
  bold: {
    fontWeight: "bold",
  },
  backButtonContainer: {
    position: "absolute",
    top: 100,
    right: 20,
    zIndex: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 50,
    padding: 8,
    elevation: 3,
  },
});
