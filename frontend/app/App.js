import React, { useState, useEffect } from "react";
import { StyleSheet, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
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
import SignUp from "./src/screens/Signup";
import LoadingScreen from "./src/screens/LoadingScreen";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import Recording from "./src/screens/recording";

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

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={Home}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Recording"
        component={Recording}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "FolderTab") {
            iconName = focused ? "folder" : "folder-outline";
          } else if (route.name === "CalendarTab") {
            iconName = focused ? "calendar" : "calendar-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="FolderTab"
        component={Folder}
        options={{ title: "Folder" }}
      />
      <Tab.Screen
        name="CalendarTab"
        component={Calendar}
        options={{ title: "Calendar" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={Profile}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
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
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    backgroundColor: "white",
  },
});
