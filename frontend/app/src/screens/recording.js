import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ScrollView,
  StatusBar,
  Clipboard,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const languages = [
  { code: "ko", name: "한국어" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
];

const Recording = ({ route }) => {
  const { isHost = false, roomCode: initialRoomCode } = route?.params || {};

  // States
  const [sourceLanguage, setSourceLanguage] = useState(languages[0]);
  const [targetLanguage, setTargetLanguage] = useState(languages[1]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isShareModalVisible, setShareModalVisible] = useState(false);
  const [selectingLanguage, setSelectingLanguage] = useState(null);
  const [activeTab, setActiveTab] = useState("transcription");
  const [roomCode, setRoomCode] = useState(initialRoomCode || "0000");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showStopModal, setShowStopModal] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    let interval;
    if (isRecording && isHost && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 0.5,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    } else {
      clearInterval(interval);
      if (!isHost) setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording, isHost, isPaused]);

  const toggleModal = (type) => {
    setSelectingLanguage(type);
    setModalVisible(!isModalVisible);
  };

  const selectLanguage = (language) => {
    if (selectingLanguage === "source") {
      setSourceLanguage(language);
    } else {
      setTargetLanguage(language);
    }
    setModalVisible(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={[styles.headerTop, !isHost && styles.participantHeader]}>
        {isHost && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShareModalVisible(true)}
          >
            <MaterialIcons name="share" size={24} color="#6A9C89" />
          </TouchableOpacity>
        )}

        <View style={[styles.roomInfo, !isHost && styles.centerRoomInfo]}>
          <Text style={styles.roomLabel}>Room Code:</Text>
          <Text style={styles.roomCode}>{roomCode}</Text>
        </View>

        {isHost && (
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="content-cut" size={24} color="#6A9C89" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderRecordingControls = () => (
    <View style={styles.recordingContainer}>
      {isHost ? (
        <View style={styles.controlsContainer}>
          {!isRecording ? (
            // 녹화 시작 전 상태
            <TouchableOpacity
              style={[styles.recordButton]}
              onPress={() => setIsRecording(true)}
            >
              <MaterialIcons
                name="fiber-manual-record"
                size={32}
                color="#6A9C89"
              />
            </TouchableOpacity>
          ) : (
            // 녹화 중 상태 - 일시정지와 중지 버튼 표시
            <View style={styles.activeControlsContainer}>
              <TouchableOpacity
                style={[styles.controlButton, isPaused && styles.pausedButton]}
                onPress={() => setIsPaused(!isPaused)}
              >
                <MaterialIcons
                  name={isPaused ? "play-arrow" : "pause"}
                  size={32}
                  color="#6A9C89"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.controlButton, styles.stopButton]}
                onPress={() => setShowStopModal(true)}
              >
                <MaterialIcons name="stop" size={32} color="#FF4444" />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.recordingTime}>
            {isRecording ? formatTime(recordingTime) : "Ready to record"}
          </Text>
          <Text style={styles.recordingStatus}>
            {isPaused
              ? "Recording paused"
              : isRecording
              ? "Recording in progress"
              : ""}
          </Text>
        </View>
      ) : (
        // 참가자 뷰는 그대로 유지
        <View style={styles.participantStatus}>
          <MaterialIcons
            name={isRecording ? "mic" : "mic-off"}
            size={32}
            color={isRecording ? "#6A9C89" : "#666"}
          />
          <Text style={styles.recordingTime}>
            {isRecording
              ? "Recording in progress..."
              : "Waiting for host to start..."}
          </Text>
        </View>
      )}
    </View>
  );

  const renderContent = () => (
    <View style={styles.contentContainer}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "transcription" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("transcription")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "transcription" && styles.activeTabText,
            ]}
          >
            Transcription
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "summary" && styles.activeTab]}
          onPress={() => setActiveTab("summary")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "summary" && styles.activeTabText,
            ]}
          >
            Summary
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.contentScroll}>
        {activeTab === "transcription" ? (
          <View style={styles.transcriptionContainer}>
            <View style={styles.messageContainer}>
              <Text style={styles.timestamp}>00:00</Text>
              <View style={styles.messageBubble}>
                <Text style={styles.speakerName}>Speaker 1</Text>
                <Text style={styles.messageText}>
                  {isRecording
                    ? "Transcription will appear here in real-time..."
                    : isHost
                    ? "Start recording to begin transcription"
                    : "Waiting for host to start recording..."}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              {isRecording
                ? "Meeting summary will be generated after the session ends."
                : isHost
                ? "Start recording to begin summary generation"
                : "Waiting for host to start recording..."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {renderHeader()}
      {renderRecordingControls()}
      {renderContent()}
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
                    color="#6A9C89"
                  />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              keyExtractor={(item) => item.code}
            />
          </View>
        </View>
      </Modal>
      {/* 녹화 중지 확인 모달 */}
      <Modal visible={showStopModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.stopModalContent}>
            <Text style={styles.stopModalTitle}>End Recording?</Text>
            <Text style={styles.stopModalText}>
              Recording will be stopped and summarized. Do you want to continue?
            </Text>
            <View style={styles.stopModalButtons}>
              <TouchableOpacity
                style={[styles.stopModalButton, styles.stopModalCancelButton]}
                onPress={() => setShowStopModal(false)}
              >
                <Text style={styles.stopModalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stopModalButton, styles.stopModalConfirmButton]}
                onPress={() => {
                  setIsRecording(false);
                  setShowStopModal(false);
                  setActiveTab("summary"); // 서머리 탭으로 전환
                }}
              >
                <Text style={styles.stopModalConfirmText}>
                  Yes, End Recording
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* 공유 모달 (호스트만 사용 가능) */}
      <Modal
        visible={isShareModalVisible}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.shareModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Share Meeting</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShareModalVisible(false)}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.roomCodeDisplay}>
              <Text style={styles.roomCodeLabel}>Room Code</Text>
              <View style={styles.roomCodeContainer}>
                <Text style={styles.roomCodeDisplayText}>{roomCode}</Text>
                <TouchableOpacity onPress={() => Clipboard.setString(roomCode)}>
                  <MaterialIcons
                    name="content-copy"
                    size={24}
                    color="#6A9C89"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.shareButton}>
              <MaterialIcons name="share" size={24} color="#fff" />
              <Text style={styles.shareButtonText}>Share Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  // 컨테이너 관련 스타일
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  // 헤더 관련 스타일
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  participantHeader: {
    justifyContent: "center",
  },
  roomInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  centerRoomInfo: {
    justifyContent: "center",
    flex: 1,
  },
  roomLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 8,
  },
  roomCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
  },

  // 녹음 컨트롤 관련 스타일
  recordingContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  recordButtonWrapper: {
    alignItems: "center", // 버튼 내부 요소들 중앙 정렬
    justifyContent: "center",
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  recordingActive: {
    backgroundColor: "#ffebee",
  },
  recordingTime: {
    fontSize: 14,
    color: "#666",
  },
  participantStatus: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  // 컨텐츠 영역 관련 스타일
  contentContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#6A9C89",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
  },
  activeTabText: {
    color: "#6A9C89",
    fontWeight: "600",
  },

  // 트랜스크립션 관련 스타일
  contentScroll: {
    flex: 1,
    padding: 16,
  },
  transcriptionContainer: {
    flex: 1,
  },
  messageContainer: {
    marginBottom: 16,
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  messageBubble: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  speakerName: {
    fontSize: 12,
    color: "#6A9C89",
    fontWeight: "600",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "#2D3436",
    lineHeight: 20,
  },

  // 언어 선택 관련 스타일
  languageSelectorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
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
    fontWeight: "500",
  },
  swapIcon: {
    marginHorizontal: 16,
  },

  // 모달 관련 스타일
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
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  closeButton: {
    padding: 8,
  },

  // 공통 버튼 스타일
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },

  // 공유 모달 관련 스타일
  shareModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  roomCodeDisplay: {
    alignItems: "center",
    marginVertical: 24,
  },
  roomCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  roomCodeDisplayText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3436",
    letterSpacing: 8,
    marginRight: 16,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6A9C89",
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  shareButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  controlsContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  activeControlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  controlButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f8f9fa",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  pausedButton: {
    backgroundColor: "#e8f3f1",
  },
  stopButton: {
    backgroundColor: "#fff5f5",
  },
  recordingStatus: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },

  // 중지 확인 모달 스타일
  stopModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    alignSelf: "center",
  },
  stopModalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  stopModalText: {
    fontSize: 16,
    color: "#636E72",
    marginBottom: 24,
    lineHeight: 22,
  },
  stopModalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
  stopModalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  stopModalCancelButton: {
    backgroundColor: "#f8f9fa",
  },
  stopModalConfirmButton: {
    backgroundColor: "#FF4444",
  },
  stopModalCancelText: {
    color: "#636E72",
    fontSize: 16,
    fontWeight: "500",
  },
  stopModalConfirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Recording;
