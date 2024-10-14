import { View, Text, StyleSheet } from "react-native";
import Header from "../screens/Header";

export default function Profile() {
    return (
        <View>
            <Header title="Profile" />
            <View
                style={{
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                }}
            >
                <Text>Profile</Text>
            </View>
        </View>
    );
}
