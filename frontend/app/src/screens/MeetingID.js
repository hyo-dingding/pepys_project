import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import BackButton from "./BackButton";

const MeetingID = () => {
  const [meetingId, setMeetingId] = useState("");

  return (
    <View style={styles.container}>
      <BackButton />
      <View style={styles.meetingIdContainer}>
        <Text style={styles.label}>Meeting ID</Text>
        <TextInput
          style={styles.input}
          value={meetingId}
          onChangeText={setMeetingId}
          keyboardType="numeric"
          maxLength={4}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  meetingIdContainer: {
    backgroundColor: "#F0F0F0",
    padding: 20,
    borderRadius: 20,
    width: "80%",
    alignItems: "center",
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    fontSize: 24,
    textAlign: "center",
    width: "100%",
    padding: 10,
    backgroundColor: "white",
    borderRadius: 5,
  },
});

export default MeetingID;
