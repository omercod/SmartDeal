// components/CustomAlert.js
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const CustomAlert = ({
  visible,
  title,
  message,
  onClose,
  confirmMode = false,
  onConfirm,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {confirmMode ? (
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>ביטול</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.confirmButton]}
                onPress={onConfirm}
              >
                <Text style={styles.buttonText}>אישור</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>אישור</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default CustomAlert;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    backgroundColor: "#fff",
    padding: 25,
    borderRadius: 12,
    width: 300,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#C6A052",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#C6A052",
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  rowButtons: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    backgroundColor: "#999",
  },
  confirmButton: {
    backgroundColor: "#C6A052",
  },
});
