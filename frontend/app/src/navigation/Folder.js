// Folder.js
// 미팅 및 파일 목록을 보여주는 메인 폴더 화면

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

const Tab = createMaterialTopTabNavigator();

// 더미 데이터
const meetingsData = {
  myMeetings: [
    {
      id: "1",
      date: "Jan 15, 2024",
      title: "Team Meeting Discussion",
      participants: ["John", "Sarah", "Mike"],
      files: [
        {
          id: "a1",
          type: "audio",
          name: "Meeting Recording",
          duration: "32:10",
          size: "5.2MB",
        },
        {
          id: "a2",
          type: "document",
          name: "Meeting Summary",
          size: "1.2MB",
        },
      ],
    },
    {
      id: "2",
      date: "Jan 14, 2024",
      title: "Project X Review",
      participants: ["Anna", "Tom"],
      files: [
        {
          id: "b1",
          type: "audio",
          name: "Review Recording",
          duration: "25:45",
          size: "3.8MB",
        },
      ],
    },
  ],
  sharedMeetings: [
    {
      id: "3",
      date: "Jan 13, 2024",
      title: "Client Meeting",
      participants: ["David", "Emma"],
      files: [
        {
          id: "c1",
          type: "audio",
          name: "Client Meeting Recording",
          duration: "28:30",
          size: "4.5MB",
        },
      ],
    },
  ],
};

// 미팅 아이템 컴포넌트
const MeetingItem = ({ meeting, onPress }) => (
  <TouchableOpacity style={styles.meetingCard} onPress={onPress}>
    <Text style={styles.meetingDate}>{meeting.date}</Text>
    <Text style={styles.meetingTitle}>{meeting.title}</Text>
    <View style={styles.meetingInfo}>
      <View style={styles.infoItem}>
        <MaterialIcons name="insert-drive-file" size={16} color="#6A9C89" />
        <Text style={styles.infoText}>{meeting.files.length} files</Text>
      </View>
      <View style={styles.infoItem}>
        <MaterialIcons name="people" size={16} color="#6A9C89" />
        <Text style={styles.infoText}>
          {meeting.participants.length} participants
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

// 내 파일 화면
function MyFiles({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      {meetingsData.myMeetings.map((meeting) => (
        <MeetingItem
          key={meeting.id}
          meeting={meeting}
          onPress={() => navigation.navigate("MeetingDetail", { meeting })}
        />
      ))}
    </ScrollView>
  );
}

// 공유된 파일 화면
function SharedFiles({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      {meetingsData.sharedMeetings.map((meeting) => (
        <MeetingItem
          key={meeting.id}
          meeting={meeting}
          onPress={() => navigation.navigate("MeetingDetail", { meeting })}
        />
      ))}
    </ScrollView>
  );
}

// 메인 Folder 컴포넌트
export default function Folder() {
  return (
    <View style={styles.mainContainer}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarIndicatorStyle: styles.tabIndicator,
          tabBarActiveTintColor: "#6A9C89",
          tabBarInactiveTintColor: "#666",
          tabBarLabelStyle: styles.tabLabel,
          headerShown: false, // 헤더 숨기기
        }}
      >
        <Tab.Screen
          name="MyFiles"
          component={MyFiles}
          options={{ tabBarLabel: "My Files" }}
        />
        <Tab.Screen
          name="Shared"
          component={SharedFiles}
          options={{ tabBarLabel: "Shared" }}
        />
      </Tab.Navigator>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 60 : 20,
  },
  container: {
    flex: 1,
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 100 : 80, // iOS의 경우 더 큰 하단 패딩
  },
  // 헤더 스타일 수정 - 상단 여백 조정
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: Platform.OS === "ios" ? -40 : 0, // iOS에서 상단 여백 조정
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#2D3436",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8F9FA",
  },
  meetingCard: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 3,
  },
  meetingDate: {
    fontSize: 14,
    color: "#6A9C89",
    marginBottom: 4,
  },
  meetingTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2D3436",
    marginBottom: 12,
  },
  meetingInfo: {
    flexDirection: "row",
    gap: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  tabBar: {
    backgroundColor: "#FFF",
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tabIndicator: {
    backgroundColor: "#6A9C89",
    height: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "none",
  },
});
