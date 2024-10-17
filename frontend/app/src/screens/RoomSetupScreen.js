import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const RoomSetupScreen = ({ navigation }) => {
  const handleButtonPress = (action) => {
    console.log(action);
    // 여기서 필요한 로직을 수행합니다.
    // 예를 들어, 새 회의를 생성하거나 회의에 참여하는 등의 작업을 수행할 수 있습니다.
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.activeButton]}
          onPress={() => handleButtonPress("New Meeting")}
        >
          <Text style={styles.buttonText}>New Meeting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress("Join Meeting")}
        >
          <Text style={styles.buttonText}>Join Meeting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleButtonPress("Upload Recording")}
        >
          <Text style={styles.buttonText}>Upload Recording</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "white",
  },
  buttonContainer: {
    alignItems: "center",
    padding: 20,
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    marginBottom: 20,
  },
  activeButton: {
    backgroundColor: "#90EE90",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default RoomSetupScreen;
