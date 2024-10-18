import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FileUploadScreen from "../screens/FileUploadScreen";
import MeetingID from "../screens/MeetingID";
import AudioUploadScreen from "../screens/AudioUploadScreen";

const Stack = createNativeStackNavigator();

const HomeScreen = ({ navigation }) => {
  const [activeButton, setActiveButton] = useState(null);

  const handleButtonPress = (action) => {
    setActiveButton(action);
    if (action === "New Meeting") {
      navigation.navigate("FileUpload");
    } else if (action === "Join Meeting") {
      navigation.navigate("MeetingID");
    } else if (action === "Upload Recording") {
      navigation.navigate("AudioUpload");
    } else {
      console.log(action);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            activeButton === "New Meeting" && styles.activeButton,
          ]}
          onPress={() => handleButtonPress("New Meeting")}
        >
          <Text style={styles.buttonText}>New Meeting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            activeButton === "Join Meeting" && styles.activeButton,
          ]}
          onPress={() => handleButtonPress("Join Meeting")}
        >
          <Text style={styles.buttonText}>Join Meeting</Text>
          <Text style={styles.buttonText}>Join Meeting</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            activeButton === "Upload Recording" && styles.activeButton,
          ]}
          onPress={() => handleButtonPress("Upload Recording")}
        >
          <Text style={styles.buttonText}>Upload Recording</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const Home = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FileUpload"
        component={FileUploadScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MeetingID"
        component={MeetingID}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AudioUpload"
        component={AudioUploadScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
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

export default Home;
