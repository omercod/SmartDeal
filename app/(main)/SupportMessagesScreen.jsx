import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import {
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../(auth)/firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
import { useNavigation } from "@react-navigation/native";
const HEADER_HEIGHT =
  Platform.OS === "ios" ? 44 : StatusBar.currentHeight + 40 || 56;

// פונקציה לבדיקה אם ההודעה חדשה (24 שעות אחרונות)
const isNew = (createdAt) => {
  if (!createdAt) return false;
  const now = new Date();
  const created = createdAt.toDate();
  const diff = now - created;
  return diff < 1000 * 60 * 60 * 24;
};

export default function SupportMessagesScreen() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();
    const navigation = useNavigation();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const snapshot = await getDocs(collection(db, "SupportMessages"));
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        fetched.sort(
          (a, b) =>
            new Date(b.createdAt?.toDate()) - new Date(a.createdAt?.toDate())
        );
        setMessages(fetched);
      } catch (error) {
        console.error("שגיאה בשליפת הודעות:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleMarkAsHandled = (id) => {
    Alert.alert("אישור טיפול", "האם אתה בטוח שטיפלת בהודעה הזו?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "כן, מחק",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "SupportMessages", id));
            setMessages((prev) => prev.filter((msg) => msg.id !== id));
            Alert.alert("נמחק", "ההודעה נמחקה בהצלחה.");
          } catch (error) {
            console.error("שגיאה במחיקה:", error);
            Alert.alert("שגיאה", "לא ניתן למחוק את ההודעה.");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
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
      <Text style={styles.title}>הודעות תמיכה</Text>

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#C6A052" />
          <Text style={{ marginTop: 10 }}>טוען הודעות...</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="email-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>לא נמצאו הודעות</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {messages.map((msg) => (
            <View key={msg.id} style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.subject}>{msg.subject}</Text>
                {isNew(msg.createdAt) && (
                  <Text style={styles.newBadge}>חדש</Text>
                )}
              </View>
              <Text style={styles.email}>מאת: {msg.email}</Text>
              <Text style={styles.message}>{msg.message}</Text>
              <Text style={styles.date}>
                {msg.createdAt?.toDate().toLocaleString("he-IL")}
              </Text>

              <TouchableOpacity
                style={styles.doneButton}
                onPress={() => handleMarkAsHandled(msg.id)}
              >
                <Icon name="check" size={16} color="#fff" />
                <Text style={styles.doneText}>טופל</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingTop: 100,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 16,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#777",
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  headerRow: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  subject: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C6A052",
    textAlign: "right",
    flex: 1,
  },
  email: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    textAlign: "right",
  },
  message: {
    fontSize: 14,
    color: "#333",
    textAlign: "right",
    marginBottom: 8,
  },
  date: {
    fontSize: 10,
    color: "#999",
    alignSelf: "center",
  },
  doneButton: {
    marginTop: 10,
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: "#27ae60",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "center",
  },

  doneText: {
    color: "#fff",
    marginRight: 6,
    fontWeight: "bold",
    fontSize: 12,
  },
  newBadge: {
    backgroundColor: "#C6A052",
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
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
