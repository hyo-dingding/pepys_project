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

const AudioUploadScreen = () => {
  const navigation = useNavigation();
  const [uploadedFiles, setUploadedFiles] = useState([
    "audio1.mp3",
    "audio2.wav",
    "audio3.m4a",
  ]);
  const [activeDeleteIndex, setActiveDeleteIndex] = useState(null);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
      });

      if (result.type === "success") {
        setUploadedFiles([...uploadedFiles, result.name]);
        Alert.alert("Success", "Audio file uploaded successfully!");
      } else if (result.type === "cancel") {
        console.log("User cancelled file picker");
      }
    } catch (error) {
      console.error("Error picking audio file:", error);
      Alert.alert("Error", "An error occurred while picking the audio file");
    }
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setActiveDeleteIndex(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          Upload your audio recording for AI to transcribe and analyze
        </Text>
        <View style={styles.uploadButtonContainer}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
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
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
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

export default AudioUploadScreen;
