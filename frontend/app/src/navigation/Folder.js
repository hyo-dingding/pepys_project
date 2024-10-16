import { View, Text, StyleSheet } from "react-native";
import Header from "../screens/Header";

export default function Folder() {
  return (
    <View style={{ flex: 1 }}>
      <Header title="Folder" />

      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          backgroundColor: "white",
        }}
      >
        <Text>bianka 수정</Text>
      </View>
    </View>
  );
}
