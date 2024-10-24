import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const MeetingID = ({ navigation }) => {
  const [meetingId, setMeetingId] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (meetingId.length === 4) {
      // 여기서 서버에 해당 roomCode가 존재하는지 확인하는 로직이 들어가야 합니다
      // 지금은 예시로 바로 이동하도록 구현
      navigation.navigate("Recording", {
        isHost: false,
        roomCode: meetingId,
      });
    } else {
      setError("Please enter a valid room code");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Enter Meeting Code</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={meetingId}
              onChangeText={(text) => {
                setMeetingId(text);
                setError(""); // 입력 시 에러 메시지 제거
              }}
              keyboardType="numeric"
              maxLength={4}
              placeholder="0000"
              autoFocus={true}
            />
          </View>
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          <TouchableOpacity
            style={[
              styles.joinButton,
              meetingId.length !== 4 && styles.joinButtonDisabled,
            ]}
            onPress={handleJoin}
            disabled={meetingId.length !== 4}
          >
            <Text style={styles.joinButtonText}>Join Meeting</Text>
          </TouchableOpacity>

          <View style={styles.helpContainer}>
            <MaterialIcons name="help-outline" size={20} color="#6A9C89" />
            <Text style={styles.helpText}>
              Can't find your meeting code? Contact the organizer
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f0f7f5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3436",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#636E72",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  input: {
    width: "100%",
    height: 56,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 8,
    color: "#2D3436",
    fontWeight: "600",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6A9C89",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    marginBottom: 24,
  },
  joinButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  joinButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  joinButtonTextDisabled: {
    color: "#999",
  },
  helpContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  helpText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#636E72",
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

export default MeetingID;
