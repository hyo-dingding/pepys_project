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
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
// import { Audio } from "expo-av"; tts 진행시 주석 제거 예정
import axios from "axios";
import { NGROK_URL } from "@env";
// import { encode } from "react-native-base64";
import * as Print from "expo-print";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "@env";

const languages = [
  { code: "ko", name: "한국어", subname: "(Korean)" },
  { code: "en", name: "English", subname: "(English)" },
  { code: "es", name: "Español", subname: "(Spanish)" },
  { code: "zh", name: "中文", subname: "(Chinese)" },
  { code: "ja", name: "日本語", subname: "(Japanese)" },
];

const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const AudioUploadRecording = ({ route }) => {
  const { stt_text, summary, selected_language } = route.params;
  const [targetLanguage, setTargetLanguage] = useState(
    languages.find((lang) => lang.code === selected_language)
  );
  const [summarizedText, setSummarizedText] = useState(
    summary[selected_language]
  );

  const [isModalVisible, setModalVisible] = useState(false);
  const [selectingLanguage, setSelectingLanguage] = useState(null);
  const [activeTab, setActiveTab] = useState("transcription");

  const [sttText, setSttText] = useState("");

  const [sttStatus, setSttStatus] = useState("waiting");
  // const [ttsStatus, setTtsStatus] = useState("waiting"); tts 진행시 주석 제거 예정
  const [summaryStatus, setSummaryStatus] = useState("waiting");

  useEffect(() => {
    // targetLanguage가 변경될 때마다 요약 업데이트
    if (targetLanguage && summary[targetLanguage.code]) {
      setSummarizedText(summary[targetLanguage.code]);
    }
  }, [targetLanguage, summary]);

  useEffect(() => {
    // stt진행시 tts(elevenlabs)자동 진행, tts 진행시 주석 제거 예정
    if (stt_text) {
      // elevenLabsVoice();
      setSttStatus("completed");
      // setTtsStatus("processing");
    }
  }, [stt_text]);

  // tts 진행시 주석 제거 예정
  // useEffect(() => {
  //   if (audioFileName) {
  //     setTtsStatus("completed");
  //   }
  // }, [audioFileName]);

  useEffect(() => {
    if (activeTab === "summary" && summarizedText) {
      setSummaryStatus("completed");
      handleSavePDF();
    } else if (activeTab === "summary") {
      setSummaryStatus("processing");
    }
  }, [activeTab, summarizedText]);

  const selectLanguage = (language) => {
    setTargetLanguage(language);
    setModalVisible(false);
  };

  const toggleModal = (type) => {
    setSelectingLanguage(type);
    setModalVisible(!isModalVisible);
  };

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

  // tts 진행시 주석 제거 예정
  // const [isPlaying, setIsPlaying] = useState(false);
  // const [sound, setSound] = useState();
  // const [audioFileName, setAudioFileName] = useState("");

  // const elevenLabsVoice = async () => {
  //   try {
  //     // 백엔드에서 텍스트 음성 변환 파일 요청
  //     const response = await axios.post(
  //       `${NGROK_URL}/convert-text-to-speech/`,
  //       {
  //         text: stt_text,
  //       },
  //       {
  //         headers: { "Content-Type": "application/json" }, // JSON 형식 지정
  //       }
  //     );
  //     const { audio_file_name } = response.data;
  //     setAudioFileName(audio_file_name);
  //   } catch (error) {
  //     console.error("Error playing TTS:", error);
  //   }
  // };

  // const playAudio = async () => {
  //   console.log("오디오 재생시작");
  //   if (!audioFileName) {
  //     console.error("Audio file name not set.");
  //     return;
  //   }

  //   // 이미 재생 중이면 중지
  //   if (isPlaying && sound) {
  //     console.log("오디오 재생 중지");
  //     await sound.stopAsync();
  //     await sound.unloadAsync();
  //     setSound(null);
  //     setIsPlaying(false);
  //     return;
  //   }

  //   try {
  //     const { status } = await Audio.requestPermissionsAsync();
  //     if (status !== "granted") {
  //       console.error("Audio playback permissions not granted.");
  //       return;
  //     }

  //     const audioUri = `${NGROK_URL}/get-voice-audio/${audioFileName}`;

  //     // 새로운 사운드 객체 생성 및 오디오 파일 로드
  //     const { sound } = await Audio.Sound.createAsync(
  //       { uri: audioUri },
  //       { shouldPlay: true }
  //     );
  //     console.log("오디오 재생 시작");
  //     setSound(sound);
  //     await sound.playAsync();

  //     // 재생 상태 업데이트 (재생이 끝났을 때 해제)
  //     sound.setOnPlaybackStatusUpdate((status) => {
  //       if (status.didJustFinish) {
  //         console.log("오디오 재생 완료");
  //         sound.unloadAsync(); // 재생 완료 후 해제
  //         setSound(null);
  //         setIsPlaying(false);
  //       }
  //     });

  //     // 오디오 재생
  //   } catch (error) {
  //     console.error("오디오 재생 오류:", error);
  //     setIsPlaying(false);
  //   }
  // };

  const createPDF = async () => {
    // PDF HTML 템플릿
    const html = `
      <html>
        <body>
          <h1>Meeting Summary</h1>
          <div style="margin-top: 20px;">
            <h2>Transcription</h2>
            <p>${stt_text}</p>
          </div>
          <div style="margin-top: 20px;">
            <h2>Summary (${targetLanguage.name})</h2>
            <p>${summarizedText}</p>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({
        html: html,
        base64: false,
      });
      return uri;
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      return null;
    }
  };

  const generateUUID = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  };

  const uploadToFirebase = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();

      const storage = getStorage();
      const uuid = generateUUID();
      const fileName = `summaries/${uuid}.pdf`;
      const storageRef = ref(storage, fileName);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      return downloadURL;
    } catch (error) {
      console.error("Firebase 업로드 오류:", error);
      return null;
    }
  };

  const handleSavePDF = async () => {
    try {
      // PDF 생성
      const pdfUri = await createPDF();
      if (!pdfUri) {
        Alert.alert("Error", "Failed to generate PDF.", [
          {
            text: "OK",
            style: "cancel",
          },
        ]);
        return;
      }

      // Firebase에 업로드
      const downloadURL = await uploadToFirebase(pdfUri);
      if (!downloadURL) {
        Alert.alert("Error", "Failed to save PDF.", [
          {
            text: "OK",
            style: "cancel",
          },
        ]);
        return;
      }

      // 성공 알림
      Alert.alert("Success", "PDF has been successfully saved.", [
        {
          text: "OK",
          onPress: () => console.log("PDF saved:", downloadURL),
        },
      ]);
    } catch (error) {
      console.error("PDF save error:", error);
      Alert.alert("Error", "An error occurred while saving the PDF.", [
        {
          text: "OK",
          style: "cancel",
        },
      ]);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="save" size={24} color="#6A9C89" />
        </TouchableOpacity>

        <View style={styles.loadingStatus}>
          {sttStatus !== "completed" ? (
            <View style={styles.statusItem}>
              <Text style={styles.statusText}>
                STT {sttStatus === "processing" ? "Processing..." : "Waiting"}
              </Text>
              {sttStatus === "processing" && (
                <MaterialIcons
                  name="refresh"
                  size={16}
                  color="#6A9C89"
                  style={styles.rotatingIcon}
                />
              )}
            </View>
          ) : /*tts 진행시 주석 제거 예정
          /*ttsStatus !== "completed" ? ( 
            <View style={styles.statusItem}>
              <Text style={styles.statusText}>
                TTS {ttsStatus === "processing" ? "Processing..." : "Waiting"}
              </Text>
              {ttsStatus === "processing" && (
                <MaterialIcons
                  name="refresh"
                  size={16}
                  color="#6A9C89"
                  style={styles.rotatingIcon}
                />
              )}
            </View>
          ) :*/ summaryStatus !== "completed" && activeTab === "summary" ? (
            <View style={styles.statusItem}>
              <Text style={styles.statusText}>
                Summary{" "}
                {summaryStatus === "processing" ? "Processing..." : "Waiting"}
              </Text>
              {summaryStatus === "processing" && (
                <MaterialIcons
                  name="refresh"
                  size={16}
                  color="#6A9C89"
                  style={styles.rotatingIcon}
                />
              )}
            </View>
          ) : null}
        </View>

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
            // 현재 선택된 언어로 요약을 진행할지 확인
            Alert.alert(
              "Confirm Summary Language",
              `Would you like to proceed with the summary in ${targetLanguage.name} ${targetLanguage.subname}?`,
              [
                {
                  text: "Cancel",
                  style: "cancel",
                },
                {
                  text: "OK",
                  onPress: () => {
                    setActiveTab("summary");
                    // 선택된 언어로 요약 진행
                    if (targetLanguage && summary[targetLanguage.code]) {
                      setSummarizedText(summary[targetLanguage.code]);
                    }
                  },
                },
              ]
            );
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
              <View style={styles.messageBubble}>
                <View style={styles.messageHeader}>
                  <Text style={styles.speakerName}>Speaker</Text>
                  {/*tts 진행시 주석 제거 예정
                  /*<TouchableOpacity
                    onPress={playAudio}
                    disabled={!audioFileName}
                  >
                    <MaterialIcons
                      name={isPlaying ? "stop" : "volume-up"}
                      size={24}
                      color={audioFileName ? "#6A9C89" : "#CCCCCC"}
                      style={styles.speakerIcon}
                    />
                  </TouchableOpacity>*/}
                </View>
                <Text style={styles.messageText}>{stt_text}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.transcriptionContainer}>
            <View style={styles.messageContainer}>
              <View style={styles.messageBubble}>
                <View style={styles.messageHeader}>
                  <Text style={styles.speakerName}>Summary</Text>
                </View>
                <Text style={styles.summaryText}>
                  {summarizedText || "요약을 가져오는 중..."}
                </Text>
              </View>
            </View>
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
              <Text style={styles.modalTitle}>Change Final Language</Text>
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
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: "#6A9C89",
    marginRight: 4,
  },
  rotatingIcon: {
    transform: [{ rotate: "0deg" }],
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
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
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
});

export default AudioUploadRecording;
