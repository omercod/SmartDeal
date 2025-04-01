import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function TermsScreen() {
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
        <Text style={styles.title}>תקנון השימוש באפליקציה</Text>

        <Text style={styles.sectionTitle}>1. כללי</Text>
        <Text style={styles.text}>
          ברוכים הבאים לאפליקציית <Text style={styles.bold}>SmartDeal</Text>.
          אפליקציה זו מופעלת ומתוחזקת על ידי{" "}
          <Text style={styles.bold}>איתי ועומר אונליין בע"מ</Text>.  
          השימוש באפליקציה כפוף לתנאים המפורטים בתקנון זה.  
          השימוש באפליקציה מהווה אישור להסכמתך לכל התנאים.
        </Text>

        <Text style={styles.sectionTitle}>2. השימוש באפליקציה</Text>
        <Text style={styles.text}>
          האפליקציה מאפשרת למשתמשים לפרסם ולמצוא שירותים שונים.  
          המשתמש מתחייב להשתמש באפליקציה בהתאם להוראות התקנון ולחוקי מדינת ישראל.  
          <Text style={styles.bold}>האחריות לתוכן המתפרסם באפליקציה היא על המשתמש בלבד</Text>, ואין לראות באפליקציה אחראית לכל פרסום או מידע המוצג על ידי המשתמשים.
        </Text>

        <Text style={styles.sectionTitle}>3. פרטיות ואבטחת מידע</Text>
        <Text style={styles.text}>
          אנו מכבדים את פרטיות המשתמשים.  
          במסגרת השימוש באפליקציה נאסף מידע בסיסי הכולל שם וכתובת אימייל בלבד,  
          והשימוש בו מוגבל למטרות תפעול האפליקציה בלבד.  
          <Text style={styles.bold}>לא יועבר מידע לצדדים שלישיים לכל שימוש חיצוני.</Text>
        </Text>

        <Text style={styles.sectionTitle}>4. הגבלת גיל</Text>
        <Text style={styles.text}>
          השימוש באפליקציה מותר <Text style={styles.bold}>למשתמשים מגיל 18 ומעלה בלבד</Text>.  
          בהרשמתך לאפליקציה, אתה מאשר כי הינך מעל גיל 18 וכשיר להשתמש בשירותים המוצעים בה.
        </Text>

        <Text style={styles.sectionTitle}>5. אחריות</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>האפליקציה אינה אחראית</Text> לכל התקשרות, עסקה,  
          או כל אינטראקציה אחרת בין המשתמשים.  
          האחריות לבדיקת מידע, תוקפו ואמינותו חלה על המשתמש בלבד.
        </Text>

        <Text style={styles.sectionTitle}>6. שינויים בתקנון</Text>
        <Text style={styles.text}>
          אנו שומרים לעצמנו את הזכות לעדכן את תנאי השימוש מעת לעת.  
          במקרה של שינוי מהותי בתקנון, תישלח הודעה מתאימה למשתמשים.  
          המשך השימוש באפליקציה לאחר עדכון התקנון יהווה הסכמה לשינויים.
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
    marginBottom: 10,
    marginTop: 40,
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
