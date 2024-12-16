import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  Dimensions,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width } = Dimensions.get("window");

export default function UploadImages({ navigation }) {
  const [mainImage, setMainImage] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  // בקשת הרשאות
  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("שגיאה", "יש לאפשר גישה לתמונות על מנת להעלות תמונות.");
      }
    })();
  }, []);

  const pickImage = async (setImage, index = null) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      if (index !== null) {
        const updatedImages = [...additionalImages];
        updatedImages[index] = result.assets[0].uri;
        setAdditionalImages(updatedImages);
      } else {
        setImage(result.assets[0].uri);
      }
    }
  };

  const handleAdditionalImage = async () => {
    if (additionalImages.length >= 3) {
      Alert.alert("מקסימום 3 תמונות נוספות.");
      return;
    }
    pickImage((uri) => setAdditionalImages([...additionalImages, uri]));
  };

  const removeImage = (index) => {
    const updatedImages = [...additionalImages];
    updatedImages.splice(index, 1);
    setAdditionalImages(updatedImages);
  };

  const openImage = (uri) => setSelectedImage(uri);

  const handlePublish = () => {
    Alert.alert("הצלחה!", "התמונות הועלו בהצלחה ופורסמו!");
    navigation.navigate("Summary");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>העלאת תמונות</Text>
        <Text style={styles.subtitle}>
          הוספת תמונות יכולה להקל על אנשי מקצוע להבין את השירות שאתם מחפשים.
        </Text>

        {/* תמונה ראשית */}
        <View style={styles.section}>
          <Text style={styles.label}>תמונה ראשית</Text>
          <View style={styles.imagePicker}>
            {mainImage ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: mainImage }} style={styles.image} />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => pickImage(setMainImage)}
                >
                  <Icon name="pencil" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => setMainImage(null)}
                >
                  <Icon name="close-circle" size={24} color="black" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.uploadBox}
                onPress={() => pickImage(setMainImage)}
              >
                <Icon name="camera-plus" size={50} color="#C6A052" />
                <Text style={styles.uploadText}>העלה תמונה</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* תמונות נוספות */}
        <View style={styles.section}>
          <Text style={styles.label}>תמונות נוספות</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAdditionalImage}>
            <Icon name="plus" size={30} color="#C6A052" />
            <Text style={styles.addText}>הוסף תמונה</Text>
          </TouchableOpacity>
          <View style={styles.imageRow}>
            {additionalImages.map((uri, index) => (
              <View key={index} style={styles.imageContainer}>
                <TouchableOpacity onPress={() => openImage(uri)}>
                  <Image source={{ uri }} style={styles.previewImage} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => pickImage(null, index)}
                >
                  <Icon name="pencil" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Icon name="close-circle" size={20} color="black" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* כפתור פרסום */}
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.buttonText}>פרסם</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* מסך Preview */}
      {selectedImage && (
        <Modal visible transparent>
          <View style={styles.modalContainer}>
            <Image source={{ uri: selectedImage }} style={styles.fullImage} />
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setSelectedImage(null)}
            >
              <Icon name="close" size={30} color="white" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
    paddingTop: StatusBar.currentHeight || 20, // הוספת מרווח עבור ההאדר
  },
  container: { flexGrow: 1, alignItems: "center", justifyContent: "center" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#555", textAlign: "center", marginBottom: 20 },
  section: { width: "90%", alignItems: "center", marginBottom: 20 },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  uploadBox: {
    width: width * 0.4,
    height: width * 0.4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  uploadText: { marginTop: 5, color: "#C6A052" },
  imageContainer: { position: "relative", marginBottom: 10 },
  image: { width: 120, height: 120, borderRadius: 8 },
  previewImage: { width: 80, height: 80, borderRadius: 8 },
  imageRow: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  actionButton: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#C6A052", borderRadius: 12, padding: 2 },
  removeButton: { position: "absolute", top: -5, right: -5 },
  addButton: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  addText: { marginLeft: 5, color: "#C6A052" },
  publishButton: { backgroundColor: "#C6A052", padding: 12, borderRadius: 8, width: "90%", alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold" },
  modalContainer: { flex: 1, backgroundColor: "black", justifyContent: "center", alignItems: "center" },
  modalCloseButton: { position: "absolute", top: 40, right: 20 },
  fullImage: { width: "90%", height: "90%", resizeMode: "contain" },
});
