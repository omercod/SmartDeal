"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../(auth)/firebase";
import { useNavigation } from "@react-navigation/native";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function AdminPage() {
  const navigation = useNavigation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersSnapshot = await getDocs(collection(db, "Users"));
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || "ללא שם",
          email: data.email || "ללא אימייל",
          photoURL: data.profileImage || null,
        };
      });
      setUsers(usersList);
    } catch (error) {
      console.error("שגיאה בשליפת משתמשים:", error);
      Alert.alert("שגיאה", "לא ניתן לטעון את רשימת המשתמשים");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    Alert.alert("אישור מחיקה", "האם אתה בטוח שברצונך למחוק את המשתמש?", [
      { text: "ביטול", style: "cancel" },
      {
        text: "מחק",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "Users", userId));
            setUsers((prev) => prev.filter((user) => user.id !== userId));
            Alert.alert("הצלחה", "המשתמש נמחק בהצלחה");
          } catch (error) {
            console.error("שגיאה במחיקת משתמש:", error);
            Alert.alert("שגיאה", "לא ניתן למחוק את המשתמש");
          }
        },
      },
    ]);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigation.navigate("(auth)/sign-in");
    } catch (error) {
      console.error("שגיאה בהתנתקות:", error);
    }
  };

  const handleManageReviews = () => {
    navigation.navigate("(main)/manage-reviews");
  };

  const openImageModal = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ניהול משתמשים</Text>
        <Text style={styles.subtitle}>סה"כ {users.length} משתמשים רשומים</Text>
      </View>

      <View style={styles.actionBar}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <View style={styles.buttonContent}>
            <Icon name="logout" size={18} color="#fff" />
            <Text style={styles.buttonText}>התנתק</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={fetchUsers} style={styles.refreshButton}>
          <Icon name="refresh" size={18} color="#C6A052" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleManageReviews}
          style={styles.actionButton}
        >
          <View style={styles.buttonContent}>
            <Icon name="message-text-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>ביקורות</Text>
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#C6A052" />
          <Text style={styles.loadingText}>טוען משתמשים...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="account-off-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>לא נמצאו משתמשים</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {users.map((user) => (
            <View key={user.id} style={styles.userCard}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteUser(user.id)}
              >
                <Icon name="delete" size={18} color="#fff" />
              </TouchableOpacity>

              <View style={styles.userCardContent}>
                <TouchableOpacity
                  onPress={() => user.photoURL && openImageModal(user.photoURL)}
                  activeOpacity={0.9}
                >
                  {user.photoURL ? (
                    <View style={styles.avatarWrapper}>
                      <Image
                        source={{ uri: user.photoURL }}
                        style={styles.avatar}
                      />
                      <View style={styles.imageBadge}>
                        <Text style={styles.badgeText}>לחץ להגדלה</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.noImageContainer}>
                      <Icon
                        name="image-off-outline"
                        size={28}
                        color="#C6A052"
                      />

                      <Text style={styles.noImageText}>אין תמונה</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{user.name}</Text>
                  <Text
                    style={styles.userEmail}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {user.email}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* מודל לתצוגה מלאה של תמונה */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Image
              source={{ uri: selectedImage }}
              style={styles.fullImage}
              resizeMode="contain"
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 90,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  actionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 5,
  },
  actionButton: {
    backgroundColor: "#C6A052",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  logoutButton: {
    backgroundColor: "#3D3D3D",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    elevation: 2,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  refreshButton: {
    backgroundColor: "#fff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#C6A052",
    elevation: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  userCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    width: "99%",
  },

  userCardContent: {
    flexDirection: "row-reverse",
    alignItems: "center",
    flex: 1,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 27.5,
    marginLeft: 14,
    borderWidth: 2,
    borderColor: "#f0f0f0",
    overflow: "hidden",
    position: "relative",
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  imageBadge: {
    position: "absolute",
    bottom: 5,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 2,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    textAlign: "center",
  },
  noImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 14,
    borderWidth: 2,
    borderColor: "#C6A052",
  },
  noImageText: {
    fontSize: 10,
    color: "#C6A052",
    marginTop: 4,
    textAlign: "center",
    fontWeight: "500",
  },

  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "right",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 8,
    color: "#666",
    textAlign: "right",
    width: "100%",
  },
  deleteButton: {
    backgroundColor: "#3D3D3D",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 10,
    color: "#666",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
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
