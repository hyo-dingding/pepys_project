import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const BackButton = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
      <Ionicons name="arrow-back" size={24} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    top: 20, // 이 값을 조정하여 버튼의 상하 위치를 변경할 수 있습니다
    left: 10,
    zIndex: 1,
    padding: 10, // 터치 영역을 넓힙니다
  },
});

export default BackButton;
