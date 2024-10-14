import { View, Text, StyleSheet } from "react-native";
import Header from "../screens/Header";

export default function Folder() {
    return (
        <View>
            <Header title="Folder" />

            <View
                style={{
                    flex: 1,
                    alignContent: "center",
                    justifyContent: "center",
                }}
            >
                <Text>Folder</Text>
            </View>
        </View>
    );
}
