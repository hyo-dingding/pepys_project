// AudioUploadScreen.js

// 필요한 라이브러리 및 컴포넌트 import
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
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

// 화면 너비 가져오기
const { width } = Dimensions.get("window");

const AudioUploadScreen = () => {
  // 네비게이션 및 상태 관리
  const navigation = useNavigation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeDeleteIndex, setActiveDeleteIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 파일 업로드 처리 함수 (테스트를 위해 임시로 주석처리)
  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        const newFile = {
          name: result.name,
          type: result.name.split(".").pop(),
        };
        setUploadedFiles([...uploadedFiles, newFile]);
        Alert.alert("Success", "Audio file uploaded successfully!");
      }
    } catch (error) {
      Alert.alert("Error", "An error occurred while picking the audio file");
    }
  };

  // 파일 삭제 처리 함수
  const handleDeleteFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setActiveDeleteIndex(null);
  };

  // 저장 버튼 처리 함수 (테스트를 위해 조건 제거)
  const handleSave = () => {
    navigation.navigate("Summary", { files: uploadedFiles });
  };

  // 빈 상태 렌더링 함수
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No audio files uploaded yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Your uploaded audio files will appear here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 헤더 섹션 */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Upload Audio</Text>
          <Text style={styles.subtitle}>
            AI will transcribe and analyze your recorded session
          </Text>
        </View>

        {/* 업로드 버튼 섹션 */}
        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <View style={styles.uploadIconContainer}>
              <MaterialIcons name="mic" size={40} color="#6A9C89" />
            </View>
            <Text style={styles.uploadText}>Tap to upload audio files</Text>
            <Text style={styles.uploadSubtext}>Support: MP3, WAV, M4A</Text>
          </TouchableOpacity>
        </View>

        {/* 파일 목록 섹션 */}
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
                        name="audiotrack"
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
            )}
          </View>
        </View>

        {/* 저장 버튼 (테스트를 위해 조건부 스타일 제거) */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// 스타일 정의
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
    flex: 0.4,
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
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    padding: 16,
  },
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
    fontSize: 14,
    color: "#636E72",
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
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    paddingVertical: 10,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    backgroundColor: "#6A9C89",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AudioUploadScreen;
