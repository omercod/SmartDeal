import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import Slider from "@react-native-community/slider";

const UserPage = () => {
  const [posts, setPosts] = useState([]);
  const [sliderValues, setSliderValues] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const dummyPosts = [
      {
        id: "1",
        title: "פוסט ראשון",
        categoryPrimary: "קטגוריה ראשית 1",
        categorySecondary: "קטגוריה משנית 1",
        description: "תיאור הפוסט הראשון",
        price: "1000 ₪",
        image: "https://via.placeholder.com/600x200",
      },
      {
        id: "2",
        title: "פוסט שני",
        categoryPrimary: "קטגוריה ראשית 2",
        categorySecondary: "קטגוריה משנית 2",
        description: "תיאור הפוסט השני",
        price: "2000 ₪",
        image: "https://via.placeholder.com/600x200",
      },
      {
        id: "3",
        title: "פוסט שלישי",
        categoryPrimary: "קטגוריה ראשית 3",
        categorySecondary: "קטגוריה משנית 3",
        description: "תיאור הפוסט השלישי",
        price: "1500 ₪",
        image: "https://via.placeholder.com/600x200",
      },
    ];

    const initialSliderValues = {};
    dummyPosts.forEach((post) => {
      const priceValue = parseFloat(
        post.price.replace(" ₪", "").replace(",", "")
      );
      initialSliderValues[post.id] = priceValue;
    });

    setPosts(dummyPosts);
    setSliderValues(initialSliderValues);
  }, []);

  const handleSliderChange = (id, value) => {
    setSliderValues((prev) => ({ ...prev, [id]: value }));
  };

  const isAcceptedValue = (id, value) => {
    const priceValue = parseFloat(
      posts
        .find((post) => post.id === id)
        ?.price.replace(" ₪", "")
        .replace(",", "")
    );
    return value === priceValue;
  };

  const openModal = (post) => {
    setSelectedPost(post);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setSelectedPost(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const priceValue = parseFloat(
            item.price.replace(" ₪", "").replace(",", "")
          );
          const minValue = priceValue * 0.5;
          const maxValue = priceValue * 1.2;

          return (
            <View style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.image} />
              <Text style={styles.categoryPrimary}>{item.categoryPrimary}</Text>
              <Text style={styles.categorySecondary}>
                {item.categorySecondary}
              </Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.price}>מחיר נדרש: {item.price}</Text>

              <View style={styles.sliderContainer}>
                <Text style={styles.sliderText}>הגש הצעה:</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={minValue}
                  maximumValue={maxValue}
                  step={10}
                  value={sliderValues[item.id]}
                  minimumTrackTintColor="#C6A052"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#C6A052"
                  onValueChange={(value) => handleSliderChange(item.id, value)}
                />
                <Text style={styles.sliderValue}>
                  {sliderValues[item.id]?.toFixed(2)} ₪
                </Text>
              </View>

              {isAcceptedValue(item.id, sliderValues[item.id]) ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => openModal(item)}
                >
                  <Text style={styles.buttonText}>מקובל עליי</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.button}>
                  <Text style={styles.buttonText}>הגש הצעה</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        snapToInterval={320}
      />

      {/* Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>עוד צעד קטן והעבודה שלך 👏</Text>
            {selectedPost && (
              <>
                <Text style={styles.modalText}>
                  שם הלקוח: {selectedPost.title}
                </Text>
                <Text style={styles.modalText}>פלאפון: 050-1234567</Text>
              </>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>סגור</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // רקע בהיר יותר לשיפור הניגודיות
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 20,
  },
  card: {
    marginTop: 60,
    width: 320,
    height: 550,
    marginHorizontal: 15,
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 10 },
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 5, // עבור אנדרואיד
    borderWidth: 1,
    borderColor: "#ddd", // הוספת גבול קל להבחנה
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 15,
    marginBottom: 15,
  },
  categoryPrimary: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C6A052",
    marginBottom: 5,
    textTransform: "uppercase", // הפיכת הטקסט לאותיות רישיות
  },
  categorySecondary: {
    fontSize: 12,
    color: "#888",
    marginBottom: 15,
    fontStyle: "italic", // עיצוב נטוי
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333", // צבע כהה יותר לכותרת
    textAlign: "center", // סידור מרכזי של כותרת
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center", // סידור מרכזי של תיאור
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C6A052",
    marginBottom: 20,
  },
  sliderContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  sliderText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#C6A052",
    marginBottom: 10,
  },
  slider: {
    width: 280,
    height: 30,
  },
  sliderValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#C6A052",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#C6A052", // צבע הכפתור שיתאים לפלטת הצבעים שלך
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,

    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#C6A052",
  },
  modalText: {
    fontSize: 16,
    marginVertical: 5,
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#C6A052",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default UserPage;
