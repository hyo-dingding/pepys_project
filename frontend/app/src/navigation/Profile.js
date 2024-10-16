import { View, Text, StyleSheet } from "react-native";
import Header from "../screens/Header";

export default function Profile() {
    return (
        <View style={{ flex: 1 }}>
            <Header title="Profile" />
            <View
                style={{
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                    backgroundColor: "white",
                }}
            >
             
            </View>
        </View>
    );
}
