import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";


const IconButton = (props) => {
    return (
        <TouchableOpacity
            hitSlop={{ top: 15, bottom: 15 }}
            style={{ paddingHorizontal: 6 }}
        >
            {props.name === "search" ? (
                <Feather name="search" size={24} color="black" />
            ) : (
                <AntDesign name={props.name} size={24} color="black" />
            )}
        </TouchableOpacity>
    );
};

export default function Header({ title }) {
    return (
        <View
            style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 10,
                backgroundColor: "white",
            }}
        >
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>{title}</Text>

            <View style={{ flexDirection: "row" }}>
                <IconButton name="search" />
                <IconButton name="bells" />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({});
