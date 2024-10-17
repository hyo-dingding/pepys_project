import React, { useState, useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getBottomSpace } from "react-native-iphone-x-helper";

import Ionicons from "@expo/vector-icons/Ionicons";

import Home from "./src/navigation/Home.js";
import Folder from "./src/navigation/Folder.js";
import Calendar from "./src/navigation/Calendar.js";
import Profile from "./src/navigation/Profile.js";
import Login from "./src/screens/Login";
import SignUp from "./src/screens/Signup"; // 주의: 파일명이 Signup.js라면 "./src/screens/Signup"으로 수정해야 합니다.
import LoadingScreen from "./src/screens/LoadingScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import RoomSetupScreen from "./src/screens/RoomSetupScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  tabBarShowLabel: false,
  headerShown: false,
  tabBarStyle: {
    position: "absolute",
    right: 0,
    left: 0,
    elevation: 0,
    paddingBottom: Platform.OS === "android" ? 20 : getBottomSpace(),
    height: Platform.OS === "android" ? 70 : 70,
    paddingBottom: Platform.OS === "android" ? 20 : 10,
    paddingTop: 10,
    backgroundColor: "white",
  },
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "RoomSetup") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Home") {
            iconName = focused ? "mic" : "mic-outline";
          } else if (route.name === "Folder") {
            iconName = focused ? "folder" : "folder-outline";
          } else if (route.name === "Calendar") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="RoomSetup" component={RoomSetupScreen} />
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Folder" component={Folder} />
      <Tab.Screen name="Calendar" component={Calendar} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 5000);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeAreaView} edges={["right", "left"]}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Welcome">
            <Stack.Screen
              name="Welcome"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "white",
  },
});
