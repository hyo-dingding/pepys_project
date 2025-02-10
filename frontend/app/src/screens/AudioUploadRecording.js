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
  // Dimensions,
  // Animated,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
// import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { NGROK_URL } from "@env";
// import * as FileSystem from "expo-file-system";
// import { encode } from "react-native-base64";
// import { encode as encodeBase64 } from "base64-arraybuffer";
// import * as MediaLibrary from "expo-media-library";

// const { width } = Dimensions.get("window");

const languages = [
  { code: "ko", name: "한국어", subname: "(Korean)" },
  { code: "en", name: "English", subname: "(English)" },
  { code: "es", name: "Español", subname: "(Spanish)" },
  { code: "zh", name: "中文", subname: "(Chinese)" },
  { code: "ja", name: "日本語", subname: "(Japanese)" },
];

const AudioUploadRecording = ({ route }) => {
  const { stt_text, summary, detected_language } = route.params;
  const [sourceLanguage, setSourceLanguage] = useState(detected_language);
  const [targetLanguage, setTargetLanguage] = useState(languages[1]);
  const [summarizedText, setSummarizedText] = useState(summary[targetLanguage]); // 초기 한국어 요약

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectingLanguage, setSelectingLanguage] = useState(null);
  const [activeTab, setActiveTab] = useState("transcription");

  // const [isRecording, setIsRecording] = useState(false);
  // const [recordingTime, setRecordingTime] = useState(0);
  // const [isPaused, setIsPaused] = useState(false);
  // const [showStopModal, setShowStopModal] = useState(false);
  const [sttText, setSttText] = useState("");

  // Animation values 제거 주석
  // const fadeAnim = new Animated.Value(1);
  // const scaleAnim = new Animated.Value(1);
  // useEffect(() => {
  //   // 오디오 세션을 활성화
  //   const enableAudioSession = async () => {
  //     await Audio.setAudioModeAsync({
  //       allowsRecordingIOS: false,
  //       interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
  //       playsInSilentModeIOS: true,
  //       shouldDuckAndroid: true,
  //       staysActiveInBackground: false,
  //       interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
  //     });
  //   };

  //   enableAudioSession();
  // }, []);

  useEffect(() => {
    // targetLanguage가 변경될 때마다 요약 업데이트
    setSummarizedText(summary[targetLanguage.code]);
  }, [stt_text, targetLanguage, summary]);

  const selectLanguage = (language) => {
    setTargetLanguage(language);
    setModalVisible(false);
  };

  // useEffect(() => {
  //   let interval;
  //   if (isRecording && !isPaused) {
  //     interval = setInterval(() => {
  //       setRecordingTime((prev) => prev + 1);
  //     }, 1000);

  //     Animated.loop(
  //       Animated.sequence([
  //         Animated.parallel([
  //           Animated.timing(fadeAnim, {
  //             toValue: 0.5,
  //             duration: 1000,
  //             useNativeDriver: true,
  //           }),
  //           Animated.timing(scaleAnim, {
  //             toValue: 1.1,
  //             duration: 1000,
  //             useNativeDriver: true,
  //           }),
  //         ]),
  //         Animated.parallel([
  //           Animated.timing(fadeAnim, {
  //             toValue: 1,
  //             duration: 1000,
  //             useNativeDriver: true,
  //           }),
  //           Animated.timing(scaleAnim, {
  //             toValue: 1,
  //             duration: 1000,
  //             useNativeDriver: true,
  //           }),
  //         ]),
  //       ])
  //     ).start();
  //   } else {
  //     clearInterval(interval);
  //     setRecordingTime(0);
  //   }
  //   return () => clearInterval(interval);
  // }, [isRecording, isPaused]);

  const toggleModal = (type) => {
    setSelectingLanguage(type);
    setModalVisible(!isModalVisible);
  };

  // const formatTime = (seconds) => {
  //   const mins = Math.floor(seconds / 60);
  //   const secs = seconds % 60;
  //   return `${mins.toString().padStart(2, "0")}:${secs
  //     .toString()
  //     .padStart(2, "0")}`;
  // };

  // MongoDB에서 가져온 STT 결과를 저장할 상태 추가
  // const fetchMongoSttResult = async (roomCode) => {
  //     try {
  //         const response = await axios.get(
  //             `https://4c7a-211-213-171-236.ngrok-free.app/get-results/${room_code}`
  //         );
  //         if (response.data && response.data.stt_text) {
  //             setSttText(response.data.stt_text);
  //         } else {
  //             console.error("MongoDB에서 STT 결과를 가져오는 중 오류 발생");
  //         }
  //     } catch (error) {
  //         console.error(
  //             "MongoDB에서 STT 결과를 가져오는 중 오류 발생",
  //             error
  //         );
  //     }
  // };

  // 요약 결과를 가져오는 함수
  // const fetchSummary = async (room_code, setTargetLanguage) => {
  //     try {
  //         const response = await axios.get(
  //             `https://33f7-211-213-171-236.ngrok-free.app/get-results/${room_code}`,
  //             { params: { language: setTargetLanguage } }
  //         );

  //         if (response.data && response.data.summary) {
  //             setSummarizedText(response.data.summary);
  //         } else {
  //             console.error("요약 결과를 가져오는 중 오류 발생");
  //         }
  //     } catch (error) {
  //         console.error("요약 가져오기 실패:", error);
  //         // } finally {
  //         //     setIsLoading(false);
  //     }
  // };

  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState();
  const [audioFileName, setAudioFileName] = useState("");

  const elevenLabsVoice = async () => {
    try {
      // 백엔드에서 텍스트 음성 변환 파일 요청
      const response = await axios.post(
        `${NGROK_URL}/convert-text-to-speech/`,
        {
          text: stt_text,
        },
        {
          headers: { "Content-Type": "application/json" }, // JSON 형식 지정
        }
      );
      const { audio_file_name } = response.data;
      setAudioFileName(audio_file_name);
    } catch (error) {
      console.error("Error playing TTS:", error);
    }
  };

  const playAudio = async () => {
    console.log("오디오 재생시작");
    if (!audioFileName) {
      console.error("Audio file name not set.");
      return;
    }

    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        console.error("Audio playback permissions not granted.");
        return;
      }

      const audioUri = `${NGROK_URL}/get-voice-audio/${audioFileName}`;

      // 새로운 사운드 객체 생성 및 오디오 파일 로드
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true }
      );
      console.log("오디오 재생 시작");
      setSound(sound);
      await sound.playAsync();

      // 재생 상태 업데이트 (재생이 끝났을 때 해제)
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          console.log("오디오 재생 완료");
          sound.unloadAsync(); // 재생 완료 후 해제
          setSound(null);
        }
      });

      // 오디오 재생
    } catch (error) {
      console.error("오디오 재생 오류:", error);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="save" size={24} color="#6A9C89" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="mail" size={24} color="#6A9C89" />
        </TouchableOpacity>
      </View>
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
          onPress={() => {
            setActiveTab("transcription");
            elevenLabsVoice();
            // fetchMongoSttResult();
          }}
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
          onPress={() => {
            setActiveTab("summary");
            // fetchSummary();
          }}
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
              {/* 보이스 클론 추가 */}
              <View style={styles.timestampContainer}>
                <Text style={styles.timestamp}></Text>
                <TouchableOpacity onPress={playAudio}>
                  <MaterialIcons
                    name="volume-up"
                    size={24}
                    color="black"
                    style={styles.speakerIcon}
                  />
                </TouchableOpacity>
              </View>
              <View style={styles.messageBubble}>
                <Text style={styles.speakerName}>Speaker</Text>
                <Text style={styles.messageText}>{stt_text}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              {summarizedText || "요약을 가져오는 중..."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mainContent}>
        {renderHeader()}
        {renderContent()}
      </View>

      <View style={styles.languageSection}>
        <Text style={styles.languageSectionTitle}>Change Final Language</Text>
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
                  <Text style={styles.languageText}>{targetLanguage.name}</Text>
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

      {/* 언어 선택 모달 */}
      <Modal visible={isModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Target Language</Text>
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
                    <Text style={styles.languageItemText}>
                      {item.name}
                      <Text style={styles.languageItemSubText}>
                        {item.subname}
                      </Text>
                    </Text>
                  </View>
                  <MaterialIcons
                    name="chevron-right"
                    size={24}
                    color="##CCCCCC"
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
      {/* 녹화 중지 확인 모달 */}
      {/* <Modal visible={showStopModal} transparent={true} animationType="fade">
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
      </Modal> */}
    </SafeAreaView>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  // 컨테이너 관련 스타일
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingBottom: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 120,
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
    paddingHorizontal: 3,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },

  // 컨텐츠 영역 관련 스타일
  contentContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    // marginTop: -20,
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
  timestampContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between", // 오른쪽에 아이콘 정렬
  },
  speakerIcon: {
    marginLeft: 8, // 아이콘과 텍스트 간격 조절
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
  languageSection: {
    position: "absolute",
    width: "100%",
    bottom: Platform.OS === "ios" ? 100 : 75,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  languageSectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2D3436",
    marginBottom: 8, // 제목과 버튼과의 간격
  },
  languageSelectorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20, // 좌우 여백 설정
    backgroundColor: "#fff",
    width: "100%",
  },
  selectLanguageTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    paddingVertical: 8, // 버튼 높이
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e9ecef",
    flex: 1,
    maxWidth: "60%",
  },
  languageButtonDefault: {
    backgroundColor: "#f8f9fa",
  },
  languageTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
  },
  languageButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  languageText: {
    fontSize: 14,
    color: "#2D3436",
    fontWeight: "500",
    marginRight: 4,
  },
  languageSubText: {
    fontSize: 12,
    color: "#636E72",
  },
  defaultLanguageText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  arrowIcon: {
    marginLeft: 3,
  },
  swapIcon: {
    marginHorizontal: 16,
  },

  // 언어 선택 모달 관련 스타일
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
    color: "#2D3436",
  },
  closeButton: {
    padding: 8,
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
    flex: 1,
    gap: 12,
  },
  languageIcon: {
    marginRight: 0,
  },
  languageTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  languageItemText: {
    fontSize: 16,
    color: "#333",
    flexDirection: "row",
    flex: 1,
  },
  languageItemSubText: {
    fontSize: 16,
    color: "#636E72",
  },
  separator: {
    height: 1,
    backgroundColor: "#f0f0f0",
  },

  // 공통 버튼 스타일
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },

  // 중지 확인 모달 스타일
  // stopModalContent: {
  //   backgroundColor: "#fff",
  //   borderRadius: 20,
  //   padding: 24,
  //   width: "85%",
  //   alignSelf: "center",
  // },
  // stopModalTitle: {
  //   fontSize: 20,
  //   fontWeight: "600",
  //   color: "#2D3436",
  //   marginBottom: 12,
  // },
  // stopModalText: {
  //   fontSize: 16,
  //   color: "#636E72",
  //   marginBottom: 24,
  //   lineHeight: 22,
  // },
  // stopModalButtons: {
  //   flexDirection: "row",
  //   justifyContent: "flex-end",
  //   gap: 12,
  // },
  // stopModalButton: {
  //   paddingVertical: 12,
  //   paddingHorizontal: 20,
  //   borderRadius: 12,
  // },
  // stopModalCancelButton: {
  //   backgroundColor: "#f8f9fa",
  // },
  // stopModalConfirmButton: {
  //   backgroundColor: "#FF4444",
  // },
  // stopModalCancelText: {
  //   color: "#636E72",
  //   fontSize: 16,
  //   fontWeight: "500",
  // },
  // stopModalConfirmText: {
  //   color: "#fff",
  //   fontSize: 16,
  //   fontWeight: "500",
  // },
});

export default AudioUploadRecording;
