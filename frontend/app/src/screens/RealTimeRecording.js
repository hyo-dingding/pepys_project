import React, { useRef, useState, useEffect } from "react";
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

import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";
import moment from "moment";
const { width } = Dimensions.get("window");
import { WEB_NGROK_URL } from "@env";
const languages = [
  { code: "ko", name: "한국어" },
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
];

const RealTimeRecording = ({ route }) => {
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

  const [transcription, setTranscription] = useState("");

  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const timeIntervalRef = useRef(null);
  const [wsError, setWsError] = useState(null);

  // Animation values
  const fadeAnim = new Animated.Value(1);
  const scaleAnim = new Animated.Value(1);

  // const recordingRef = useRef(null);

  const [recording, setRecording] = useState(null);
  const ws = useRef(null); // WebSocket 참조

  // WebSocket 연결 관리를 위한 useEffect
  useEffect(() => {
    const initializeWebSocket = () => {
      try {
        ws.current = new WebSocket(`wss://${WEB_NGROK_URL}/ws/stt`);

        ws.current.onopen = () => {
          console.log("웹소켓 연결 성공");
          setIsWebSocketConnected(true);

          // 선택된 언어 코드 전송
          const languageSettings = {
            source: sourceLanguage.code,
            target: targetLanguage.code,
          };
          ws.current.send(JSON.stringify(languageSettings));
        };

        ws.current.onmessage = (event) => {
          const receivedData = JSON.parse(event.data);
          console.log("받은 데이터:", receivedData);

          // 받은 텍스트를 트랜스크립션에 추가
          if (receivedData.transcription) {
            setTranscription(
              (prev) => prev + "\n" + receivedData.transcription
            );
          }

          // 번역된 오디오가 있으면 재생
          if (receivedData.translatedAudio) {
            playAudio(receivedData.translatedAudio);
          }
        };

        ws.current.onerror = (error) => {
          console.error("웹소켓 오류:", error.message || error);
          setIsWebSocketConnected(false);
          // setWsError(error);
          alert(
            "WebSocket 연결에 실패했습니다. 네트워크를 확인하고 다시 시도해주세요."
          );
        };

        ws.current.onclose = () => {
          console.log("웹소켓 연결 종료");
          setIsWebSocketConnected(false);
        };
      } catch (error) {
        console.error("웹소켓 초기화 오류:", error);
        setIsWebSocketConnected(false);
        setWsError(error);
      }
    };

    initializeWebSocket();

    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  // 녹음 타이머와 애니메이션을 위한 useEffect
  useEffect(() => {
    let interval;

    if (isRecording && isHost && !isPaused) {
      // 녹음 타이머 설정
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // 애니메이션 설정
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
      // if (!isHost) setRecordingTime(0);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isRecording, isHost, isPaused]); // 녹음 상태가 변경될 때만 실행

  async function startRecording() {
    ws.current = new WebSocket(`wss://${WEB_NGROK_URL}/ws/stt`);

    ws.current.onopen = () => {
      console.log("웹소켓 연결 성공");
      setIsWebSocketConnected(true);
    };

    try {
      if (recording) {
        console.log("기존 녹음 중지");
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      // 녹음 시작 로직 구현
      // setIsRecording(true);
      // setIsPaused(false);

      console.log("녹음 시작 요청");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync({
        android: {
          extension: ".wav",
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_LINEAR_PCM,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_PCM,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: ".wav",
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_LINEARPCM,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      });

      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      setIsPaused(false);
      // setTranscription("");
      console.log("녹음 시작됨");

      // 실시간 오디오 데이터 처리
      newRecording.setOnRecordingStatusUpdate(async (status) => {
        if (
          status.isRecording &&
          ws.current &&
          ws.current.readyState === WebSocket.OPEN
        ) {
          try {
            const uri = newRecording.getURI();
            const fileInfo = await FileSystem.readAsStringAsync(uri, {
              encoding: FileSystem.EncodingType.Base64,
            });

            // Base64 디코딩 후 16비트 PCM 형식으로 변환
            const audioData = Buffer.from(fileInfo, "base64");

            // WebSocket을 통해 청크 단위로 전송
            const CHUNK_SIZE = 8192; // 8KB 청크
            for (let i = 0; i < audioData.length; i += CHUNK_SIZE) {
              const chunk = audioData.slice(i, i + CHUNK_SIZE);
              ws.current.send(chunk);
            }

            console.log("오디오 데이터 전송 완료");
          } catch (error) {
            console.error("오디오 데이터 처리 중 오류:", error);
          }
        }
      });
    } catch (err) {
      console.error("녹음 시작 실패:", err);
    }
  }

  const pauseRecording = async () => {
    try {
      if (recording) {
        await recording.pauseAsync();
        setIsPaused(true);
        // setIsRecording(false);

        // 타이머 정지
        if (timeIntervalRef.current) {
          clearInterval(timeIntervalRef.current); // 타이머 인터벌 정지
          timeIntervalRef.current = null; // 인터벌 레퍼런스 초기화
        }
      }
    } catch (err) {
      console.error("녹음 일시정지 실패:", err);
    }
  };

  // 녹음 중지 함수 수정
  const stopRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        setRecording(null);
      }

      // 웹소켓 연결 종료
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.close();
        setIsWebSocketConnected(false);
        console.log("웹소켓 연결 종료");
      }

      // 타이머 정리
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
        timeIntervalRef.current = null;
      }

      // 상태 초기화
      setIsRecording(false);
      setIsPaused(false);
      // setIsWebSocketConnected(false);
    } catch (err) {
      console.error("녹음 중지 실패:", err);
    }
  };

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
              // onPress={() => setIsRecording(true)}
              onPress={async () => {
                await startRecording(); // 녹음 시작
                setIsRecording(true); // 녹음 상태로 전환
              }}
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
                onPress={async () => {
                  if (isPaused) {
                    await startRecording(); // 녹음 다시 시작
                  } else {
                    await pauseRecording(); // 녹음 일시정지
                  }
                  setIsPaused(!isPaused);
                }}
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
              <Text style={styles.timestamp}>
                {/* {formatTime(recordingTime)} */}
              </Text>
              <View style={styles.messageBubble}>
                <Text style={styles.speakerName}>Speaker 1</Text>
                <Text style={styles.messageText}>
                  {transcription || "stt 결과출력 제발"}
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
                onPress={async () => {
                  await stopRecording();
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

export default RealTimeRecording;
