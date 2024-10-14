// import { View, Text, StyleSheet } from "react-native";
import Header from "../screens/Header";

// export default function Home() { 
//     return (
//         <View>
//             <Header title="Home" />

//             <View
//                 style={{
//                     flex: 1,
//                     alignContent: "center",
//                     justifyContent: "center",
//                     backgroundColor: "white",
//                 }}
//             >
//                 <Text>Home</Text>
//             </View>
//         </View>
//     );
// }




import React, { useState, useEffect } from 'react';
import { View, Button,Text, FlatList } from "react-native";
import { supabase } from '../../utils/supabase';
import { Audio } from "expo-av";
import { EXPO_PUBLIC_SUPABASE_URL } from "@env"; // 환경 변수에서 Supabase URL 가져오기

export default function AudioPlayer() {
    const [sound, setSound] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);

    // Supabase에서 오디오 파일의 URL을 가져오는 함수
    const fetchAudioUrl = async () => {
        const { data, error } = supabase.storage
            .from("audio") // 'audio' 버킷
            .getPublicUrl("whisper_test.mp3"); // 파일 이름

        if (error) {
            console.error("Error fetching audio URL:", error.message);
        } else {
            setAudioUrl(data.publicUrl); // URL 설정
        }
    };
    
// https://fiieuwljekswaihyxdav.supabase.co/storage/v1/object/sign/audio/whisper_test.mp3?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdWRpby93aGlzcGVyX3Rlc3QubXAzIiwiaWF0IjoxNzI4Nzk3NDYzLCJleHAiOjE3Mjk0MDIyNjN9.ioD4ZtGBBp-4vb1Uabkv6_rBeQJA_mYIYfMBOrljGAc&t=2024-10-13T05%3A31%3A03.899Z

    // 오디오 재생
    const playAudio = async () => {
  if (!audioUrl) {
    console.error("Audio URL is not available");
    return;
  }

  try {
    const { sound, status } = await Audio.Sound.createAsync({ uri: audioUrl });
    console.log("Audio status:", status); // 오디오 상태 로그 출력
    setSound(sound);
    await sound.playAsync();
  } catch (error) {
    console.error("Error playing audio:", error.message); // 에러 처리
  }
};
    // 컴포넌트 언마운트 시 사운드 해제
    useEffect(() => {
        fetchAudioUrl(); // 컴포넌트 마운트 시 오디오 URL 가져옴

        return sound
            ? () => {
                  sound.unloadAsync();
              }
            : undefined;
    }, [sound]);

    return (
        <View style={{ padding: 20 }}>
            <Text>오디오 재생</Text>
            <Button title="오디오 재생" onPress={playAudio} />
        </View>
    );
}
