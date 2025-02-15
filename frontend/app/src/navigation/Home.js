import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FileUploadScreen from "../screens/FileUploadScreen";
import MeetingID from "../screens/MeetingID";
import AudioUploadScreen from "../screens/AudioUploadScreen";
import AudioUploadRecording from "../screens/AudioUploadRecording";
import RealTimeRecording from "../screens/RealTimeRecording";
import Calendar from "../navigation/Calendar";
import Profile from "../navigation/Profile";

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get("window");

const HomeScreen = ({ navigation }) => {
  const [activeButton, setActiveButton] = useState(null);
  const [weekEvents, setWeekEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      updateWeekEvents();
    });

    return unsubscribe;
  }, [navigation]);

  const updateWeekEvents = () => {
    const today = new Date();
    const events = [];

    // 오늘부터 7일간의 이벤트 가져오기
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

      if (global.calendarEvents && global.calendarEvents[dateKey]) {
        events.push({
          date: date,
          events: global.calendarEvents[dateKey],
        });
      }
    }
    setWeekEvents(events);
  };

  const handleButtonPress = (action) => {
    if (action === "New Meeting") {
      navigation.navigate("FileUpload", { activeButton: action });
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
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => {
          navigation.getParent()?.navigate("ProfileTab");
        }}
      >
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

  const renderMiniCalendar = () => (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <TouchableOpacity
          style={styles.viewMoreButton}
          onPress={() => navigation.navigate("CalendarTab")}
        >
          <Text style={styles.viewMoreText}>View Calendar</Text>
          <MaterialIcons name="chevron-right" size={20} color="#6A9C89" />
        </TouchableOpacity>
      </View>

      <View style={styles.weekEventsContainer}>
        {weekEvents.length > 0 ? (
          <ScrollView style={styles.eventsWrapper}>
            {weekEvents.map((dayEvents, index) => (
              <View key={index} style={styles.dayEventsContainer}>
                <View style={styles.dateHeader}>
                  <Text style={styles.dateText}>
                    {dayEvents.date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                {dayEvents.events.map((event, eventIndex) => (
                  <View key={eventIndex} style={styles.eventItem}>
                    <View style={styles.eventTimeContainer}>
                      <MaterialIcons
                        name="access-time"
                        size={14}
                        color="#666666"
                      />
                      <Text style={styles.eventTime}>{event.time}</Text>
                    </View>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    {event.description && (
                      <Text style={styles.eventDescription} numberOfLines={1}>
                        {event.description}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyEventsContainer}>
            <MaterialIcons name="event-available" size={40} color="#E0E0E0" />
            <Text style={styles.emptyEventsText}>
              No upcoming events this week
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderHeader()}
        {renderMainActions()}
        {renderRecentMeetings()}
        {renderMiniCalendar()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  appName: {
    fontSize: 26,
    fontWeight: "600",
    color: "#2D3436",
  },
  profileButton: {
    padding: 4,
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
  calendarContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  viewMoreText: {
    fontSize: 14,
    color: "#6A9C89",
    marginRight: 4,
    fontWeight: "500",
  },
  dayEventsContainer: {
    marginBottom: 16,
  },
  dateHeader: {
    paddingVertical: 8,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dateText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
  },
  eventsWrapper: {
    maxHeight: 300, // 스크롤 가능 영역 설정
  },
  eventItem: {
    marginBottom: 12,
    padding: 10, // 패딩을 줄여 카드 높이 축소
    backgroundColor: "#F8F9FA",
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#6A9C89",
  },
  eventTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2, // 간격 축소
  },
  eventTime: {
    fontSize: 12, // 텍스트 크기 축소
    color: "#666666",
    marginLeft: 4,
    fontWeight: "500",
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2D3436",
  },
  eventDescription: {
    fontSize: 12,
    color: "#636E72",
  },
  emptyEventsContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyEventsText: {
    fontSize: 14,
    color: "#636E72",
    marginTop: 12,
    marginBottom: 16,
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
      <Stack.Screen
        name="AudioUploadRecording"
        component={AudioUploadRecording}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RealTimeRecording"
        component={RealTimeRecording}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Calendar"
        component={Calendar}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={Profile}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default Home;
