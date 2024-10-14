import { View, Text, StyleSheet } from "react-native";
import Header from "../screens/Header";

export default function Calendar() {
    return (
        <View>
            <Header title="Calendar" />

            <View
                style={{
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                }}
            >
                <Text>calendar</Text>
            </View>
        </View>
    );
}
