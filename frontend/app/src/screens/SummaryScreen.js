// SummaryScreen.js
// 오디오 파일의 분석 결과와 번역 기능을 제공하는 화면

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

// 지원되는 언어 목록
const languages = [
  { code: "en", name: "English" },
  { code: "ko", name: "Korean" },
  { code: "es", name: "Spanish" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
];

const SummaryScreen = ({ navigation }) => {
  // 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState(languages[0]); // 기본값 영어
  const [targetLanguage, setTargetLanguage] = useState(languages[1]); // 기본값 한국어
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectingLanguage, setSelectingLanguage] = useState(null);

  // 초기 로딩 효과
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      // 실제 API 연동 시 여기에 데이터 fetch 로직 추가
      setSummary("The analyzed content will be displayed here.");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // 언어 선택 모달 토글
  const toggleModal = (type) => {
    setSelectingLanguage(type);
    setModalVisible(!isModalVisible);
  };

  // 언어 선택 처리
  const selectLanguage = (language) => {
    if (selectingLanguage === "source") {
      setSourceLanguage(language);
    } else {
      setTargetLanguage(language);
    }
    setModalVisible(false);
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A9C89" />
          <Text style={styles.loadingText}>Analyzing...</Text>
          <Text style={styles.loadingSubtext}>Please wait a moment</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 헤더 섹션 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Summary</Text>
      </View>

      {/* 메인 콘텐츠 영역 */}
      <ScrollView style={styles.content}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>
      </ScrollView>

      {/* 언어 선택 섹션 */}
      <View style={styles.languageSelectorContainer}>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => toggleModal("source")}
        >
          <MaterialIcons name="language" size={20} color="#6A9C89" />
          <Text style={styles.languageText}>{sourceLanguage.name}</Text>
        </TouchableOpacity>

        <MaterialIcons
          name="swap-horiz"
          size={24}
          color="#6A9C89"
          style={styles.swapIcon}
        />

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => toggleModal("target")}
        >
          <MaterialIcons name="language" size={20} color="#6A9C89" />
          <Text style={styles.languageText}>{targetLanguage.name}</Text>
        </TouchableOpacity>
      </View>

      {/* 언어 선택 모달 */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Select {selectingLanguage === "source" ? "Source" : "Target"}{" "}
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
                  <MaterialIcons
                    name="language"
                    size={24}
                    color="#6A9C89"
                    style={styles.languageIcon}
                  />
                  <Text style={styles.languageItemText}>{item.name}</Text>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="#C0C0C0"
                  />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              keyExtractor={(item) => item.code}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  // 기본 컨테이너
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  // 로딩 화면 스타일
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#636E72",
  },

  // 헤더 스타일
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3436",
  },

  // 콘텐츠 영역 스타일
  content: {
    flex: 1,
    padding: 16,
  },
  summaryBox: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#2D3436",
  },

  // 언어 선택 영역 스타일
  languageSelectorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingBottom: 90,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  languageText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#2D3436",
  },
  swapIcon: {
    marginHorizontal: 16,
  },

  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
  },
  closeButton: {
    padding: 8,
  },
  languageItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
  },
  languageIcon: {
    marginRight: 12,
  },
  languageItemText: {
    flex: 1,
    fontSize: 16,
    color: "#2D3436",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 52,
  },
});

export default SummaryScreen;
