import React, { useEffect, useState } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/Ionicons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";

const languages = [
    { code: "ko", name: "한국어" },
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "zh", name: "中文" },
    { code: "ja", name: "日本語" },
];

const Recording = () => {
    const [sourceLanguage, setSourceLanguage] = useState(languages[0]);
    const [targetLanguage, setTargetLanguage] = useState(languages[1]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isShareModalVisible, setShareModalVisible] = useState(false);
    const [selectingLanguage, setSelectingLanguage] = useState(null);
    const [activeTab, setActiveTab] = useState("transcription");
    const [roomCode, setRoomCode] = useState("4129");

    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedUri, setRecordedUri] = useState(null);
    const [socket, setSocket] = useState(null);
    const [sttResult, setSttResult] = useState("");

    // WebSocket 연결 설정
    useEffect(() => {
        const ws = new WebSocket(
            "wss://463f-211-213-171-236.ngrok-free.app/ws"
        ); // 서버 WebSocket 주소
        ws.onopen = () => {
            console.log("WebSocket 연결됨");
        };
        console.log("setSttResult", sttResult, setSttResult);
        ws.onmessage = (event) => {
            const sttText = event.data;
            console.log("sttResult", sttResult);
            setSttResult((prev) => prev + sttText); // STT된 텍스트 받아오기
        };

        ws.onclose = () => {
            console.log("WebSocket 연결이 종료됨");
        };
        return () => {
            ws.close();
        };
    }, []);

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

    const showShareModal = () => {
        setShareModalVisible(true);
    };

    const copyRoomCode = () => {
        Clipboard.setString(roomCode);
        // You might want to show a toast or some feedback here
    };

    // 녹음 시작 함수
    async function startRecording() {
        try {
            console.log("Requesting permissions..");
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });
            console.log("Starting recording..");

            // 녹음 세션 초기화 및 시작
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            await recording.startAsync();
            setRecording(recording);
            setIsRecording(true);
            console.log("Recording started");

            // WebSocket을 통해 음성 데이터를 전송
            if (socket) {
                const sendData = async () => {
                    const status = await recording.getStatusAsync();
                    if (status.isRecording) {
                        const uri = recording.getURI(); // 녹음된 파일 URI
                        const audioData = await FileSystem.readAsStringAsync(
                            uri,
                            {
                                encoding: FileSystem.EncodingType.Base64, // Base64로 인코딩
                            }
                        );
                        socket.send(audioData); // WebSocket을 통해 데이터를 전송
                        console.log("audioData", audioData);
                    }
                };

                // 1초마다 WebSocket으로 음성 데이터를 주기적으로 전송
                const intervalId = setInterval(sendData, 1000); // 1초마다 전송
                return () => clearInterval(intervalId); // 타이머 정리
            }
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    }

    // 녹음 중지 함수
    async function stopRecording() {
        console.log("Stopping recording..");
        // setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        const newUri = `${
            FileSystem.documentDirectory
        }recording-${Date.now()}.m4a`;
        await FileSystem.copyAsync({
            from: uri,
            to: newUri,
        });
        setRecordedUri(newUri);

        // setRecordedUri(uri);
        setIsRecording(false);
        console.log("Recording stopped and stored at", uri);
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.headerButton}
                    onPress={showShareModal}
                >
                    <Text style={styles.headerButtonText}>Share Link</Text>
                </TouchableOpacity>
                <View style={styles.headerControls}>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={isRecording ? stopRecording : startRecording}
                    >
                        <Icon
                            name={isRecording ? "pause" : "play"}
                            size={24}
                            color="#FF3B30"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.iconButton}
                        onPress={stopRecording}
                        disabled={!isRecording}
                    >
                        <Icon name="stop" size={24} color="#000" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Session Cut</Text>
                </TouchableOpacity>
            </View>

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
                            activeTab === "transcription" &&
                                styles.activeTabText,
                        ]}
                    >
                        Translated Transcription
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tab,
                        activeTab === "summary" && styles.activeTab,
                    ]}
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

            <ScrollView style={styles.content}>
                <Text style={styles.contentText}>
                    {/* {activeTab === "transcription"
                        ? "Transcription content will appear here"
                        : "Summary content will appear here"} */}
                    {activeTab === "transcription"
                        ? sttResult
                        : "Summary content will appear here"}
                </Text>
            </ScrollView>

            <View style={styles.languageSelectorContainer}>
                <TouchableOpacity
                    style={styles.languageSelector}
                    onPress={() => toggleModal("source")}
                >
                    <Text style={styles.languageButtonText}>
                        {sourceLanguage.name}
                    </Text>
                </TouchableOpacity>
                <Icon
                    name="arrow-forward"
                    size={20}
                    color="#007AFF"
                    style={styles.arrowIcon}
                />
                <TouchableOpacity
                    style={styles.languageSelector}
                    onPress={() => toggleModal("target")}
                >
                    <Text style={styles.languageButtonText}>
                        {targetLanguage.name}
                    </Text>
                </TouchableOpacity>
            </View>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalView}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Select{" "}
                            {selectingLanguage === "source"
                                ? "Source"
                                : "Target"}{" "}
                            Language
                        </Text>
                        <FlatList
                            data={languages}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.languageItem}
                                    onPress={() => selectLanguage(item)}
                                >
                                    <Text style={styles.languageItemText}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => item.code}
                        />
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isShareModalVisible}
                transparent={true}
                animationType="fade"
            >
                <View style={styles.modalView}>
                    <View style={styles.shareModalContent}>
                        <Text style={styles.modalTitle}>Meeting ID:</Text>
                        <View style={styles.roomCodeContainer}>
                            <Text style={styles.roomCodeText}>{roomCode}</Text>
                            <TouchableOpacity
                                onPress={copyRoomCode}
                                style={styles.copyButton}
                            >
                                <Icon
                                    name="copy-outline"
                                    size={24}
                                    color="#007AFF"
                                />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShareModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#ffffff",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    headerButton: {
        padding: 8,
    },
    headerButtonText: {
        color: "#007AFF",
        fontSize: 16,
        fontWeight: "600",
    },
    headerControls: {
        flexDirection: "row",
    },
    iconButton: {
        marginHorizontal: 8,
        padding: 8,
        backgroundColor: "#f0f0f0",
        borderRadius: 20,
    },
    tabs: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: "center",
    },
    activeTab: {
        borderBottomWidth: 2,
        borderBottomColor: "#007AFF",
    },
    tabText: {
        fontSize: 14,
        color: "#8e8e93",
    },
    activeTabText: {
        color: "#007AFF",
        fontWeight: "600",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    contentText: {
        fontSize: 16,
        color: "#333",
    },
    languageSelectorContainer: {
        position: "absolute",
        bottom: 80,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
    },
    languageSelector: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        padding: 12,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    languageButtonText: {
        fontSize: 16,
        color: "#007AFF",
        fontWeight: "600",
    },
    arrowIcon: {
        marginHorizontal: 10,
    },
    modalView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        width: "80%",
        maxHeight: "80%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    shareModalContent: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 20,
        width: "80%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
        color: "#333",
    },
    languageItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    languageItemText: {
        fontSize: 16,
        color: "#333",
    },
    roomCodeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    roomCodeText: {
        fontSize: 24,
        fontWeight: "bold",
        letterSpacing: 5,
        marginRight: 10,
    },
    copyButton: {
        padding: 10,
    },
    closeButton: {
        marginTop: 16,
        padding: 12,
        backgroundColor: "#007AFF",
        borderRadius: 8,
        alignItems: "center",
        width: "100%",
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default Recording;
