import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MeetingDetailScreen({ route }) {
  const { meeting } = route.params; // 네비게이션을 통해 전달된 미팅 데이터를 받음

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{meeting.title}</Text>
      <Text style={styles.date}>{meeting.date}</Text>
      <Text style={styles.participants}>
        Participants: {meeting.participants.join(", ")}
      </Text>

      <Text style={styles.sectionTitle}>Files:</Text>
      {meeting.files.map((file) => (
        <View key={file.id} style={styles.fileContainer}>
          <Text>
            {file.name} ({file.type}, {file.size})
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  participants: {
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  fileContainer: {
    marginBottom: 10,
  },
});
