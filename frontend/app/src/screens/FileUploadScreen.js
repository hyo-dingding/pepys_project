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
const axios = require("axios").default;
import { NGROK_URL } from "@env";
const FileUploadScreen = ({ route }) => {
    const activeButton = route?.params?.activeButton;

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
                    Platform.OS === "ios"
                        ? file.uri.replace("file://", "")
                        : file.uri;

                formData.append("file", {
                    uri: fileUri,
                    name: file.name,
                    type: file.type,
                });
                console.log("formData", formData);
                formData._parts.forEach((part) => {
                    console.log("FormData part:", part);
                });
                // console.log("formData2", formData.file);
                try {
                    // API 요청으로 파일 업로드 및 벡터화 시작
                    const response = await axios.post(
                        `${NGROK_URL}/upload-rag-document`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                                Accept: "application/json",
                                "ngrok-skip-browser-warning": "69420", // ngrok 경고 무시
                            },
                            timeout: 120000, // 타임아웃 증가 (2분)
                            maxContentLength: Infinity, // 콘텐츠 길이 제한 해제
                            maxBodyLength: Infinity, // 본문 길이 제한 해제
                        }
                    );
                    console.log("업로드 응답:", response.data);

                    if (response.data.status !== "success") {
                        console.log("response.data", response.data);
                        throw new Error("파일 업로드 실패");
                        // throw new Error("Failed to process document");
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

                // 파일 처리 완료 후 이동
                if (activeButton === "New Meeting") {
                    const roomCode = generateRoomCode();
                    navigation.navigate("RealTimeRecording", {
                        isHost: true,
                        roomCode: roomCode, // 생성된 룸 코드 전달
                    });
                } else if (activeButton === "Upload Recording") {
                    navigation.navigate("AudioUpload");
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
            navigation.navigate("AudioUpload");
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Upload Documents</Text>
                    <Text style={styles.subtitle}>
                        AI will study your documents for translation &
                        summarization
                    </Text>
                </View>

                <View style={styles.uploadSection}>
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={handleUpload}
                    >
                        <View style={styles.uploadIconContainer}>
                            <MaterialIcons
                                name="cloud-upload"
                                size={40}
                                color="#6A9C89"
                            />
                        </View>
                        <Text style={styles.uploadText}>
                            Tap to upload files
                        </Text>
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
                                        <Text style={styles.fileItemText}>
                                            {file.name}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.deleteButton}
                                        onPress={() => handleDeleteFile(index)}
                                        // onPressIn={() =>
                                        //     setActiveDeleteIndex(index)
                                        // }
                                        onPressOut={() =>
                                            setActiveDeleteIndex(null)
                                        }
                                    >
                                        <MaterialIcons
                                            name="close"
                                            size={20}
                                            color={
                                                activeDeleteIndex === index
                                                    ? "#ff6b6b"
                                                    : "#999"
                                            }
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
                                uploadedFiles.length === 0 &&
                                    styles.disabledButtonText,
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
