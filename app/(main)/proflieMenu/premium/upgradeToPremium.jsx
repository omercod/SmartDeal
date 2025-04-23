import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const HEADER_HEIGHT = 70;

export default function UpgradeToPremiumScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView
      style={[
        styles.container,
        { paddingTop: insets.top + HEADER_HEIGHT + SCREEN_HEIGHT * 0.03 },
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
          <Icon name="arrow-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>בחר את החבילה המתאימה לך</Text>

        <View style={styles.cardContainer}>
          {/* חשבון רגיל */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>חשבון רגיל (פעיל כעת)</Text>
            <Text style={styles.cardPrice}>₪0 / חודש</Text>
            <View style={styles.featureItem}>
              <Icon name="check" size={16} color="#333" />
              <Text style={styles.featureText}>פרסום דרישת שירות</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={16} color="#333" />
              <Text style={styles.featureText}>צפייה בפרטי יצירת קשר</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={16} color="#333" />
              <Text style={styles.featureText}>קבלת הצעות מנותני שירות</Text>
            </View>
            <View style={styles.featureItemDisabled}>
              <Icon name="close" size={16} color="#999" />
              <Text style={styles.featureTextDisabled}>
                עמוד עסקי עם סטטיסטיקות
              </Text>
            </View>
            <View style={styles.featureItemDisabled}>
              <Icon name="close" size={16} color="#999" />
              <Text style={styles.featureTextDisabled}>פרסום בעמוד הראשי</Text>
            </View>
          </View>

          {/* חשבון עסקי */}
          <View style={[styles.card, styles.premiumCard]}>
            <Text style={styles.cardTitle}>חשבון עסקי</Text>
            <Text style={styles.cardPrice}>₪29.90 / חודש</Text>
            <View style={styles.featureItem}>
              <Icon name="check" size={16} color="#C6A052" />
              <Text style={styles.featureText}>
                כל האפשרויות של החבילה החינמית
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="check" size={16} color="#C6A052" />
              <Text style={styles.featureText}>
                עמוד עסקי עם סטטיסטיקות מתקדמות
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="star" size={16} color="#C6A052" />
              <Text style={styles.featureText}>פרסום בעמוד הראשי</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="rocket" size={16} color="#C6A052" />
              <Text style={styles.featureText}>חשיפה מוגברת למודעות שלך</Text>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                navigation.navigate("(main)/proflieMenu/premium/PaymentScreen")
              }
            >
              <Text style={styles.buttonText}>שדרג עכשיו</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    padding: SCREEN_WIDTH * 0.05,
    paddingBottom: SCREEN_HEIGHT * 0.1,
  },
  header: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.03,
    color: "#333",
  },
  cardContainer: {
    gap: SCREEN_HEIGHT * 0.03,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: SCREEN_WIDTH * 0.05,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  premiumCard: {
    borderColor: "#C6A052",
    backgroundColor: "#fff9ec",
  },
  cardTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: "bold",
    marginBottom: SCREEN_HEIGHT * 0.01,
    textAlign: "center",
  },
  cardPrice: {
    fontSize: SCREEN_WIDTH * 0.045,
    color: "#C6A052",
    textAlign: "center",
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  featureItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  featureItemDisabled: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: SCREEN_HEIGHT * 0.01,
    opacity: 0.4,
  },
  featureText: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: "#333",
    marginRight: SCREEN_WIDTH * 0.025,
  },
  featureTextDisabled: {
    fontSize: SCREEN_WIDTH * 0.04,
    color: "#999",
    marginRight: SCREEN_WIDTH * 0.025,
  },
  button: {
    backgroundColor: "#C6A052",
    padding: SCREEN_HEIGHT * 0.015,
    borderRadius: 8,
    marginTop: SCREEN_HEIGHT * 0.02,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: SCREEN_WIDTH * 0.045,
    fontWeight: "bold",
  },
  backButtonContainer: {
    position: "absolute",
    right: 20,
    zIndex: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 50,
    padding: 8,
    elevation: 3,
  },
});
