import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function UpgradeToPremiumScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      {/* חץ חזור */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>בחר את החבילה המתאימה לך</Text>

        <View style={styles.cardContainer}>
          {/* חשבון רגיל*/}
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
              <Icon name="bar-chart" size={16} color="#C6A052" />
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

            <TouchableOpacity style={styles.button}>
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
    paddingTop: 140,
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 50,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  cardContainer: {
    flexDirection: "column",
    gap: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  cardPrice: {
    fontSize: 18,
    color: "#C6A052",
    textAlign: "center",
    marginBottom: 15,
  },
  featureItem: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
  },
  featureItemDisabled: {
    flexDirection: "row-reverse",
    alignItems: "center",
    marginBottom: 8,
    opacity: 0.4,
  },
  featureText: {
    fontSize: 16,
    color: "#333",
    marginRight: 10,
  },
  featureTextDisabled: {
    fontSize: 16,
    color: "#999",
    marginRight: 10,
  },
  button: {
    backgroundColor: "#C6A052",
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
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
