import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Image,
} from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";
import FileUploadScreen from "../screens/FileUploadScreen";
import MeetingID from "../screens/MeetingID";
import AudioUploadScreen from "../screens/AudioUploadScreen";

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get("window");

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
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Text style={styles.appName}>Pepys</Text>
      </View>
      <TouchableOpacity style={styles.profileButton}>
        <MaterialIcons name="account-circle" size={32} color="#6A9C89" />
      </TouchableOpacity>
    </View>
  );

  const renderRecentMeetings = () => (
    <View style={styles.recentContainer}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Meetings</Text>
      </View>
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No recent meetings available.</Text>
      </View>
    </View>
  );

  const renderMainActions = () => (
    <View style={styles.mainActionsContainer}>
      <TouchableOpacity
        style={styles.mainActionButton}
        onPress={() => handleButtonPress("New Meeting")}
      >
        <View style={styles.mainActionIcon}>
          <MaterialIcons name="video-call" size={24} color="#6A9C89" />
        </View>
        <View style={styles.mainActionContent}>
          <Text style={styles.mainActionTitle}>New Meeting</Text>
          <Text style={styles.mainActionDesc}>Start a new meeting session</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#6A9C89" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.mainActionButton}
        onPress={() => handleButtonPress("Join Meeting")}
      >
        <View style={styles.mainActionIcon}>
          <MaterialIcons name="group-add" size={24} color="#6A9C89" />
        </View>
        <View style={styles.mainActionContent}>
          <Text style={styles.mainActionTitle}>Join Meeting</Text>
          <Text style={styles.mainActionDesc}>Join an existing meeting</Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#6A9C89" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.mainActionButton}
        onPress={() => handleButtonPress("Upload Recording")}
      >
        <View style={styles.mainActionIcon}>
          <MaterialIcons name="upload-file" size={24} color="#6A9C89" />
        </View>
        <View style={styles.mainActionContent}>
          <Text style={styles.mainActionTitle}>Upload Recording</Text>
          <Text style={styles.mainActionDesc}>
            Upload your recorded session
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#6A9C89" />
      </TouchableOpacity>
    </View>
  );

  const renderToDoList = () => (
    <View style={styles.toDoContainer}>
      <Text style={styles.sectionTitle}>To-Do List</Text>
      <View style={styles.toDoItem}>
        <Text style={styles.toDoText}>
          Prepare presentation for next meeting
        </Text>
        <TouchableOpacity>
          <MaterialIcons name="check-circle" size={24} color="#6A9C89" />
        </TouchableOpacity>
      </View>
      <View style={styles.toDoItem}>
        <Text style={styles.toDoText}>Review meeting notes</Text>
        <TouchableOpacity>
          <MaterialIcons name="check-circle" size={24} color="#6A9C89" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderHeader()}
        {renderMainActions()}
        {renderRecentMeetings()}
        {renderToDoList()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  toDoContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  toDoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  toDoText: {
    fontSize: 16,
    color: "#2D3436",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 56, // 로고 크기
    height: 56, // 로고 크기
    marginBottom: -12, // 로고 위치를 아래로 이동
  },
  appName: {
    fontSize: 26, // 텍스트 크기
    fontWeight: "600",
    color: "#2D3436",
  },
  profileButton: {
    padding: 4,
  },
  recentContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#636E72",
  },
  mainActionsContainer: {
    padding: 20,
  },
  mainActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  mainActionIcon: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 12,
    marginRight: 12,
  },
  mainActionContent: {
    flex: 1,
  },
  mainActionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 4,
  },
  mainActionDesc: {
    fontSize: 12,
    color: "#636E72",
  },
});

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

export default Home;
