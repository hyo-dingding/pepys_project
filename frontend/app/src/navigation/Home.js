import { useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Button, Text } from "react-native";

import { Audio } from "expo-av";
import AntDesign from "@expo/vector-icons/AntDesign";
import Header from "../screens/Header";

export default function App() {
    const [sound, setSound] = useState(null);
    const [recording, setRecording] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedUri, setRecordedUri] = useState(null);

    // 녹음 시작 함수
    async function startRecording() {
        try {
            console.log("Requesting permissions..");
            await Audio.requestPermissionsAsync(); // 권한 요청
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            }); // 녹음 설정

            console.log("Starting recording..");
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            await recording.startAsync();
            setRecording(recording);
            setIsRecording(true);
            console.log("Recording started");
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    }

    // 녹음 중지 함수
    async function stopRecording() {
        console.log("Stopping recording..");
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecordedUri(uri); // 녹음된 파일의 URI 저장
        setIsRecording(false);
        console.log("Recording stopped and stored at", uri);
    }

    // Supabase 스토리지에 업로드하는 함수
    async function uploadToSupabase() {
        if (recordedUri) {
            try {
                // 파일 이름 생성 (timestamp + .m4a)
                const fileName = `audio_${Date.now()}.m4a`;

                // 파일을 Base64로 읽기
                const fileContents = await FileSystem.readAsStringAsync(
                    recordedUri,
                    {
                        encoding: FileSystem.EncodingType.Base64,
                    }
                );

                // Supabase 스토리지에 업로드
                const { data, error } = await supabase.storage
                    .from("audio-files") // 스토리지 버킷 이름
                    .upload(fileName, fileContents, {
                        contentType: "audio/m4a",
                        upsert: true,
                    });

                if (error) {
                    throw error;
                }

                Alert.alert("파일 업로드 완료", `업로드된 파일: ${fileName}`);
            } catch (error) {
                console.error("파일 업로드 실패", error.message);
                Alert.alert("파일 업로드 실패", error.message);
            }
        }
    }

    // 녹음된 파일 재생 함수
    async function playRecordedSound() {
        if (recordedUri) {
            console.log("Loading Sound");
            const { sound } = await Audio.Sound.createAsync({
                uri: recordedUri,
            });
            setSound(sound);

            console.log("Playing Sound");
            await sound.playAsync();
        }
    }

    useEffect(() => {
        return sound
            ? () => {
                  console.log("Unloading Sound");
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    return (
        <View style={{ flex: 1 }}>
            <Header title="Audio" />
            <View style={styles.container}>
                <View style={styles.spacer} />

                <TouchableOpacity
                    onPress={isRecording ? stopRecording : startRecording}
                >
                    <AntDesign
                        name={isRecording ? "pausecircle" : "play"}
                        size={50}
                        color="black"
                    />
                </TouchableOpacity>

                <View style={styles.spacer} />

                <TouchableOpacity
                    onPress={playRecordedSound}
                    disabled={!recordedUri}
                >
                    <AntDesign name="customerservice" size={50} color="black" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
        padding: 10,
    },
    spacer: {
        marginVertical: 20,
    },
});
