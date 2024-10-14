import { StyleSheet, Text, View, Platform } from "react-native";
import { useState } from "react";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getBottomSpace } from "react-native-iphone-x-helper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";

import Home from "./src/navigation/Home.js";
import Folder from "./src/navigation/Folder.js";
import Calendar from "./src/navigation/Calendar.js";
import Profile from "./src/navigation/Profile.js";
import Login from "./src/screens/Login";
import Signup from "./src/screens/Signup";



const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

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

function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={screenOptions}>
            <Tab.Screen
                name="Home"
                component={Home}
                options={{
                    tabBarIcon: ({ focused }) => {
                        return (
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <FontAwesome6
                                    name="house"
                                    size={24}
                                    color={focused ? "black" : "grey"}
                                />
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Folder"
                component={Folder}
                options={{
                    tabBarIcon: ({ focused }) => {
                        return (
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <FontAwesome6
                                    name="folder"
                                    size={24}
                                    color={focused ? "black" : "grey"}
                                />
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Calendar"
                component={Calendar}
                options={{
                    tabBarIcon: ({ focused }) => {
                        return (
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <FontAwesome6
                                    name="calendar"
                                    size={24}
                                    color={focused ? "black" : "grey"}
                                />
                            </View>
                        );
                    },
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarIcon: ({ focused }) => {
                        return (
                            <View
                                style={{
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons
                                    name="person"
                                    size={24}
                                    color={focused ? "black" : "grey"}
                                />
                            </View>
                        );
                    },
                }}
            />
        </Tab.Navigator>
    );
}

export default function App() {
    return (
        <SafeAreaProvider>
            <SafeAreaView
                edges={["top", "right", "left", "bottom"]}
                style={styles.safeAreaView}
            >
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen
                            name="Login"
                            component={Login}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen name="Signup" component={Signup} />

                        <Stack.Screen
                            name="MainTabs"
                            component={TabNavigator}
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
        paddingHorizontal: 10,
        backgroundColor: "white",
    },
});
