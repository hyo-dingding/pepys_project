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
// import axios from "axios";
import { NGROK_URL } from "@env";

const axios = require("axios").default;

const FileUploadScreen = ({ route }) => {
  const activeButton = route?.params?.activeButton;
  const stt_text = route?.params?.stt_text;
  const room_code = route?.params?.room_code;
  const summary = route?.params?.summary;
  const detected_language = route?.params?.detected_language;
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
        type: "application/pdf",
        multiple: true,
      });
      console.log("result", result);

      if (!result.canceled && result.assets) {
        const newFiles = result.assets.map((file) => ({
          name: file.name,
          type: file.mimeType || "application/pdf",
          uri: file.uri,
        }));

        setUploadedFiles((prevFiles) => [...prevFiles, ...newFiles]);

        Alert.alert("Success", "File uploaded successfully!");
        console.log("newFiles", newFiles);
      } else if (result.canceled) {
        console.log("Document selection was canceled.");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while picking the file");
    }
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setActiveDeleteIndex(null);
  };

  const generateRoomCode = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleSave = async () => {
    try {
      for (const file of uploadedFiles) {
        const formData = new FormData();
        const fileUri =
          Platform.OS === "ios" ? file.uri.replace("file://", "") : file.uri;

        formData.append("file", {
          uri: fileUri,
          name: file.name,
          type: file.type,
        });

        try {
          const response = await axios.post(
            `${NGROK_URL}/upload-rag-document`,
            formData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Accept: "application/json",
                "ngrok-skip-browser-warning": "69420",
              },
              timeout: 120000,
              maxContentLength: Infinity,
              maxBodyLength: Infinity,
            }
          );

          if (response.data.status !== "success") {
            throw new Error("파일 업로드 실패");
          }
        } catch (error) {
          console.error("axios 에러 발생:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
          });
          throw error;
        }

        // AudioUpload에서 넘어온 경우 추가된 데이터를 포함하여 다음 화면으로 이동
        if (stt_text && room_code) {
          navigation.navigate("AudioUploadRecording", {
            stt_text,
            room_code,
            summary,
            detected_language,
          });
        } else if (activeButton === "New Meeting") {
          const roomCode = generateRoomCode();
          navigation.navigate("RealTimeRecording", {
            isHost: true,
            roomCode: roomCode,
          });
        }
      }
    } catch (error) {
      console.error("Error processing documents:", error);
      Alert.alert("Error", "Failed to process documents.");
    }
  };

  const handleSkip = () => {
    if (activeButton === "New Meeting") {
      const roomCode = generateRoomCode();
      navigation.navigate("RealTimeRecording", {
        isHost: true,
        roomCode: roomCode, // 생성된 룸 코드 전달
      });
    } else if (activeButton === "Upload Recording") {
      // AudioUploadRecording 화면으로 이동하며 필요한 파라미터 전달
      navigation.navigate("AudioUploadRecording", {
        stt_text: route?.params?.stt_text || "",
        room_code: route?.params?.room_code || generateRoomCode(),
        summary: route?.params?.summary || {
          ko: "",
          en: "",
          ja: "",
          zh: "",
        },
        detected_language: route?.params?.detected_language || "ko",
      });
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No documents uploaded yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Your uploaded documents will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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
            {uploadedFiles.length === 0 ? (
              renderEmptyState()
            ) : (
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
                      // onPressIn={() =>
                      //     setActiveDeleteIndex(index)
                      // }
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
            )}
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
    paddingBottom: 16,
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
    flex: 0.8,
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
    marginBottom: 5,
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
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    height: 45,
  },
  saveButton: {
    backgroundColor: "#6A9C89",
  },
  skipButton: {
    backgroundColor: "#f8f9fa",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  skipButtonText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  disabledButton: {
    backgroundColor: "#E0E0E0",
  },
  disabledButtonText: {
    color: "#999",
  },
  // 선택된 파일 창 스타일
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: "#636E72",
  },
});

export default FileUploadScreen;
