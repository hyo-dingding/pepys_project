import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as DocumentPicker from "expo-document-picker";
import BackButton from "./BackButton";

const FileUploadScreen = () => {
  const navigation = useNavigation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [activeDeleteIndex, setActiveDeleteIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });

      if (result.type === "success") {
        setUploadedFiles([...uploadedFiles, result.name]);
        setSelectedFiles([...selectedFiles, result]);
        Alert.alert("Success", "File selected successfully!");
      } else if (result.type === "cancel") {
        console.log("User cancelled file picker");
      }
    } catch (error) {
      console.error("Error picking document:", error);
      Alert.alert("Error", "An error occurred while picking the file");
    }
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...uploadedFiles];
    const newSelectedFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    newSelectedFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setSelectedFiles(newSelectedFiles);
    setActiveDeleteIndex(null);
  };

  const handleSave = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert("Error", "Please select files to upload first");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file, index) => {
        formData.append("files", {
          uri: file.uri,
          type: file.mimeType,
          name: file.name,
        });
      });

      const response = await fetch("YOUR_BACKEND_API_URL/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.ok) {
        Alert.alert("Success", "Files uploaded successfully!", [
          {
            text: "OK",
            onPress: () => navigation.navigate("Recording"),
          },
        ]);
        setUploadedFiles([]);
        setSelectedFiles([]);
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      Alert.alert("Error", "Failed to upload files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate("Recording");
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <Text style={styles.title}>
          Upload your document for AI to study your document and use for
          translation & summarization
        </Text>
        <View style={styles.uploadButtonContainer}>
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUpload}
            disabled={isLoading}
          >
            <Ionicons name="cloud-upload-outline" size={40} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.fileListContainer}>
          <ScrollView style={styles.fileList}>
            {uploadedFiles.map((file, index) => (
              <View key={index} style={styles.fileItem}>
                <Text style={styles.fileItemText}>{file}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFile(index)}
                  onPressIn={() => setActiveDeleteIndex(index)}
                  onPressOut={() => setActiveDeleteIndex(null)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name="close-circle"
                    size={24}
                    color={activeDeleteIndex === index ? "#2196F3" : "#E0E0E0"}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Uploading..." : "Save"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={handleSkip}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate("Home")}
        >
          <Ionicons name="home-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="folder-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="calendar-outline" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="person-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingBottom: 80,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 20,
    textAlign: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  uploadButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: "#E0E0E0",
    borderRadius: 50,
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  fileListContainer: {
    height: "33%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  fileList: {
    flex: 1,
  },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  fileItemText: {
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "transparent",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 50,
  },
  button: {
    backgroundColor: "#2196F3",
    borderRadius: 10,
    padding: 10,
    width: "48%",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#BDBDBD",
  },
  buttonText: {
    color: "white",
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "white",
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    padding: 10,
  },
});

export default FileUploadScreen;
