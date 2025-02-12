import React, { useEffect, useState } from "react";
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
  Modal,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NGROK_URL } from "@env";
import * as Asset from "expo-asset";
// import { v4 as uuidv4 } from "uuid";
// import * as Crypto from "expo-crypto";

const { width } = Dimensions.get("window");

// 언어 목록 추가
const languages = [
  { code: "ko", name: "한국어", subname: "(Korean)" },
  { code: "en", name: "English", subname: "(English)" },
  { code: "es", name: "Español", subname: "(Spanish)" },
  { code: "zh", name: "中文", subname: "(Chinese)" },
  { code: "ja", name: "日本語", subname: "(Japanese)" },
];

const AudioUploadScreen = () => {
  const navigation = useNavigation();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [activeDeleteIndex, setActiveDeleteIndex] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [sourceLanguage, setSourceLanguage] = useState(languages[0]);
  const [targetLanguage, setTargetLanguage] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectingLanguage, setSelectingLanguage] = useState(null);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
        multiple: true,
      });
      console.log("result", result);

      if (!result.canceled) {
        const selectedFile = result.assets[0];
        const filename = selectedFile.name;
        const localUri = selectedFile.uri;

        const fileUri =
          Platform.OS === "ios" ? localUri.replace("file://", "") : localUri;

        console.log("fileUri", fileUri);

        const newFiles = {
          name: selectedFile.name,
          uri: fileUri,
          type: selectedFile.mimeType || "audio/mpeg",
        };

        setUploadedFiles((prevFiles) => [...prevFiles, newFiles]);
        setFileUrl(fileUri);

        Alert.alert("Success", "Audio file selection successfully!");
      }
    } catch (error) {
      console.error("Error picking audio file:", error);
      Alert.alert("Error", "An error occurred while picking the audio file");
    }
  };

  const handleSave = async () => {
    try {
      if (!fileUrl) {
        Alert.alert("Error", "No file selected.");
        return;
      }

      if (!targetLanguage) {
        Alert.alert("Error", "Please select a language.");
        return;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: fileUrl,
        name: uploadedFiles[0].name,
        type: "audio/mpeg",
      });
      formData._parts.forEach((part) => {
        console.log("FormData part:", part);
      });
      //   // 파일을 업로드 테스트 완료 후 주석 제거 예정
      //   const response = await axios.post(
      //     `${NGROK_URL}/upload-audio-complete`,
      //     formData,
      //     {
      //       headers: {
      //         "Content-Type": "multipart/form-data",
      //       },
      //     }
      //   );

      //   const result = response.data.data;

      // 테스트용 더미 데이터 테스트 완료 후 삭제 예정
      const dummyResult = {
        stt_text: "테스트 텍스트",
        room_code: "TEST123",
        summary: "테스트 요약",
      };

      // AudioUploadRecording으로 이동하며 필요한 데이터를 전달
      navigation.navigate("AudioUploadRecording", {
        stt_text: result.stt_text,
        room_code: result.room_code,
        summary: result.summary,
        selected_language: targetLanguage.code,
      });
    } catch (err) {
      console.error("Error uploading file:", err);
      Alert.alert("Error", "Failed to upload file");
    }
  };

  //  테스트용 더미 데이터로 다음 화면으로 이동
  const handleSkip = () => {
    if (!targetLanguage) {
      Alert.alert("Warning", "Please select a language before proceeding.", [
        { text: "OK" },
      ]);
      return;
    }

    navigation.navigate("AudioUploadRecording", {
      stt_text: "테스트 텍스트",
      room_code: "TEST123",
      summary: "테스트 요약",
      selected_language: targetLanguage.code,
    });
  };

  const handleDeleteFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
    setActiveDeleteIndex(null);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateText}>No audio files uploaded yet</Text>
      <Text style={styles.emptyStateSubtext}>
        Your uploaded audio files will appear here
      </Text>
    </View>
  );

  // 언어 선택 관련 함수들
  const toggleModal = (type) => {
    setSelectingLanguage(type);
    setModalVisible(!isModalVisible);
  };

  const selectLanguage = (language) => {
    if (selectingLanguage === "target") {
      setTargetLanguage(language);
    }
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Upload Audio</Text>
          <Text style={styles.subtitle}>
            AI will transcribe and analyze your recorded session
          </Text>
        </View>

        <View style={styles.uploadSection}>
          <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
            <View style={styles.uploadIconContainer}>
              <MaterialIcons name="mic" size={40} color="#6A9C89" />
            </View>
            <Text style={styles.uploadText}>Tap to upload audio files</Text>
            <Text style={styles.uploadSubtext}>Support: MP3, WAV, M4A</Text>
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

        {/* 언어 선택 섹션 */}
        <View style={styles.languageSection}>
          <Text style={styles.languageSectionTitle}>Select Final Language</Text>
          <View style={styles.languageSelectorContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                !targetLanguage && styles.languageButtonDefault,
              ]}
              onPress={() => toggleModal("target")}
            >
              <MaterialIcons name="language" size={20} color="#6A9C89" />
              <View style={styles.languageTextContainer}>
                {targetLanguage ? (
                  <>
                    <Text style={styles.languageText}>
                      {targetLanguage.name}
                    </Text>
                    <Text style={styles.languageSubText}>
                      {targetLanguage.subname}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.defaultLanguageText}>Language</Text>
                )}
              </View>
              <MaterialIcons
                name="keyboard-arrow-down"
                size={20}
                color="#6A9C89"
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.saveButton,
              uploadedFiles.length === 0 && styles.disabledButton,
            ]}
            onPress={handleSave}
            disabled={uploadedFiles.length === 0}
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
            // onPress={() => navigation.goBack()}
            onPress={handleSkip} // handleSkip 함수로 변경 테스트 후 삭제 예정
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 언어 선택 모달 추가 */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {selectingLanguage === "source" ? "Source" : "Final"}{" "}
                Language
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languages}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.languageItem}
                  onPress={() => selectLanguage(item)}
                >
                  <View style={styles.languageItemLeft}>
                    <MaterialIcons name="language" size={24} color="#6A9C89" />
                    <View style={styles.languageTextContainer}>
                      <Text style={styles.languageItemText}>{item.name}</Text>
                      <Text style={styles.languageItemSubText}>
                        {item.subname}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#CCCCCC"
                  />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              keyExtractor={(item) => item.code}
              style={styles.languageList}
            />
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
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
    marginBottom: 16,
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
    fontSize: 13,
    color: "#636E72",
  },
  filesSection: {
    flex: 0.8,
    marginBottom: 16, // 언어 선택 섹션과의 간격
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
    marginBottom: 0, // 네비게이션 바와의 간격
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

  // 언어 선택 관련 스타일
  languageSection: {
    marginBottom: 15, // Save/Skip 버튼과의 간격
  },
  languageSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12, // 제목과 버튼과의 간격
  },
  languageSelectorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // 좌우 여백 설정
    backgroundColor: "#fff",
    width: "100%", // 가로 전체 너비 사용
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center", // 가로 중앙 정렬
    backgroundColor: "#f8f9fa",
    paddingVertical: 8, //버튼 높이
    paddingHorizontal: 16, //좌우 여백
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
    flex: 1,
    maxWidth: "60%", // 버튼의 최대 너비 제한
  },
  languageButtonDefault: {
    backgroundColor: "#f8f9fa",
  },
  languageIcon: {
    marginRight: 8,
  },
  languageTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8, // 수정
  },
  arrowIcon: {
    marginLeft: 3,
  },
  languageText: {
    fontSize: 14,
    color: "#2D3436",
    fontWeight: "500",
    marginRight: 4,
  },
  defaultLanguageText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  languageSubText: {
    fontSize: 12,
    color: "#636E72",
  },
  swapIcon: {
    marginHorizontal: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  languageList: {
    paddingHorizontal: 16,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  languageItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  languageItemText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 2,
  },
  languageItemSubText: {
    fontSize: 14,
    color: "#636E72",
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },
  closeButton: {
    padding: 8,
  },
});

export default AudioUploadScreen;
