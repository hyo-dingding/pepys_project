import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const RecordingHeaderControl = ({
  showControls = false,
  onSharePress,
  onSessionCutPress,
}) => {
  if (!showControls) return null;

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={onSharePress}>
        <Text style={styles.headerButtonText}>Share Link</Text>
      </TouchableOpacity>

      <View style={styles.headerControls}>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="play" size={24} color="#FF3B30" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Icon name="stop" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.headerButton} onPress={onSessionCutPress}>
        <Text style={styles.headerButtonText}>Session Cut</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default RecordingHeaderControl;
