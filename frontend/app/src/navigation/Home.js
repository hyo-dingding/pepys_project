// import { View, StyleSheet } from "react-native";
// import { useState } from "react";
// import { Audio } from "expo-av";
import AntDesign from "@expo/vector-icons/AntDesign";

import Header from "../screens/Header";

// export default function Home() {
//     const [recording, setRecording] = useState();
//     const [permissionResponse, requestPermission] = Audio.usePermissions();

//     async function startRecording() {
//         try {
//             if (permissionResponse.status !== "granted") {
//                 console.log("Requesting permission..");
//                 await requestPermission();
//             }
//             await Audio.setAudioModeAsync({
//                 allowsRecordingIOS: true,
//                 playsInSilentModeIOS: true,
//             });

//             console.log("Starting recording..");
//             const { recording } = await Audio.Recording.createAsync(
//                 Audio.RecordingOptionsPresets.HIGH_QUALITY
//             );
//             setRecording(recording);
//             console.log("Recording started");
//         } catch (err) {
//             console.error("Failed to start recording", err);
//         }
//     }

//     return (
//         <View style={{ flex: 1, backgroundColor: "white" }}>
//             <Header title="Home" />
//             <View style={styles.container}>
//                 <AntDesign name="play" size={40} color="black" />
//             </View>
//         </View>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         alignContent: "center",
//         justifyContent: "flex-start",
//         backgroundColor: "white",
//         marginTop: 50,
//     },
// });


import { useState } from "react";
import { View, StyleSheet, Button } from "react-native";
import { Audio } from "expo-av";

export default function Home() {
    const [recording, setRecording] = useState();
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    async function startRecording() {
        try {
            if (permissionResponse.status !== "granted") {
                console.log("Requesting permission..");
                await requestPermission();
            }
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            console.log("Starting recording..");
            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
            console.log("Recording started");
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    }

    async function stopRecording() {
        console.log("Stopping recording..");
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
        });
        const uri = recording.getURI();
        console.log("Recording stopped and stored at", uri);
    }

    return (
        <View style={styles.container}>
            <Button
                title={recording ? "Stop Recording" : "Start Recording"}
                onPress={recording ? stopRecording : startRecording}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: "#ecf0f1",
        padding: 10,
    },
});