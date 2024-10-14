import React from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

export default function Login({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>

            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#CD5C08"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#CD5C08"
                secureTextEntry
            />

            <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate("MainTabs")}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
                Don't have an account?{" "}
                <Text
                    style={styles.signupText}
                    onPress={() => navigation.navigate("Signup")}
                >
                    SignUp
                </Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white", // 배경색 설정
        padding: 20,
    },
    title: {
        fontSize: 36,
        fontWeight: "bold",
        marginBottom: 40,
        color: "#6A9C89",
    },
    input: {
        width: "100%",
        height: 50,
        backgroundColor: "#fff",
        borderRadius: 10,
        paddingHorizontal: 15,
        marginBottom: 20,
        fontSize: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
      
    },
    button: {
        width: "100%",
        height: 50,
        backgroundColor: "#C1D8C3",
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    footerText: {
        color: "#C1D8C3",
        fontSize: 16,
    },
    signupText: {
        color: "#6A9C89",
        fontWeight: "bold",
    },
});