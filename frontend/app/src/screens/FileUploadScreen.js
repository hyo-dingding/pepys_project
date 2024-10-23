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
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import BackButton from "./BackButton";

const FileUploadScreen = () => {
  const navigation = useNavigation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeDeleteIndex, setActiveDeleteIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getFileIcon = (fileType) => {
    switch (fileType.toLowerCase()) {
      case "pdf":
        return "picture-as-pdf";
      case "doc":
      case "docx":
        return "article";
      case "ppt":
      case "pptx":
        return "slideshow";
      default:
        return "insert-drive-file";
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });

      if (result.type === "success") {
        const fileType = result.name.split(".").pop();
        const newFile = {
          name: result.name,
          type: fileType,
        };
        setUploadedFiles([...uploadedFiles, newFile]);
        Alert.alert("Success", "File uploaded successfully!");
      }
    } catch (error) {
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

  const generateRoomCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSave = () => {
    const roomCode = generateRoomCode();
    navigation.navigate("Recording", {
      isHost: true,
      roomCode: roomCode, // 생성된 룸 코드 전달
    });
  };

  const handleSkip = () => {
    const roomCode = generateRoomCode();
    navigation.navigate("Recording", {
      isHost: true,
      roomCode: roomCode, // 생성된 룸 코드 전달
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Upload Documents</Text>
          <Text style={styles.subtitle}>
            AI will study your documents for translation & summarization
          </Text>
        </View>

        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <View style={styles.uploadIconContainer}>
              <MaterialIcons name="cloud-upload" size={40} color="#6A9C89" />
            </View>
            <Text style={styles.uploadText}>Tap to upload files</Text>
            <Text style={styles.uploadSubtext}>
              Support: PDF, Word, PowerPoint
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filesSection}>
          <View style={styles.filesSectionHeader}>
            <Text style={styles.filesSectionTitle}>
              Uploaded Files ({uploadedFiles.length})
            </Text>
          </View>
          <View style={styles.fileListContainer}>
            <ScrollView style={styles.fileList}>
              {uploadedFiles.map((file, index) => (
                <View key={index} style={styles.fileItem}>
                  <View style={styles.fileInfo}>
                    <MaterialIcons
                      name={getFileIcon(file.type)}
                      size={24}
                      color="#6A9C89"
                      style={styles.fileIcon}
                    />
                    <Text style={styles.fileItemText}>{file.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteFile(index)}
                    onPressIn={() => setActiveDeleteIndex(index)}
                    onPressOut={() => setActiveDeleteIndex(null)}
                  >
                    <MaterialIcons
                      name="close"
                      size={20}
                      color={activeDeleteIndex === index ? "#ff6b6b" : "#999"}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              uploadedFiles.length === 0 && styles.disabledButton,
            ]}
            disabled={uploadedFiles.length === 0}
            onPress={handleSave}
          >
            <Text
              style={[
                styles.buttonText,
                uploadedFiles.length === 0 && styles.disabledButtonText,
              ]}
            >
              Save
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  headerContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#636E72",
    lineHeight: 22,
  },
  uploadSection: {
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#6A9C89",
    borderStyle: "dashed",
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIconContainer: {
    backgroundColor: "#e8f3f1",
    padding: 20,
    borderRadius: 50,
    marginBottom: 16,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: "#636E72",
  },
  filesSection: {
    flex: 1,
  },
  filesSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  filesSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
  },
  fileListContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 16,
  },
  fileList: {
    flex: 1,
  },
  fileItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  fileInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileItemText: {
    fontSize: 14,
    color: "#2D3436",
    flex: 1,
  },
  deleteButton: {
    padding: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 70,
    paddingTop: 12,
    gap: 30,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#6A9C89",
  },
  skipButton: {
    backgroundColor: "#f8f9fa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  disabledButtonText: {
    color: "#999",
  },
});

export default FileUploadScreen;
