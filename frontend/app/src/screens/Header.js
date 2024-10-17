import React from "react";
import { View, Text, StyleSheet, StatusBar } from "react-native";

export default function Header({ title }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight + 10,
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: "white",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
});
