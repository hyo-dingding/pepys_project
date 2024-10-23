import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const { height } = Dimensions.get("window");

const LoginModal = ({ visible, onClose, navigation }) => {
  const handleLogin = () => {
    // 로그인 로직 구현
    navigation.navigate("MainTabs", { screen: "RoomSetup" });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <View style={styles.modalIndicator} />
                  <TouchableOpacity
                    onPress={onClose}
                    style={styles.closeButton}
                  >
                    <MaterialIcons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.title}>Welcome Back!</Text>
                  <Text style={styles.subtitle}>
                    Please sign in to continue
                  </Text>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="email" size={20} color="#6A9C89" />
                      <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#CD5C08"
                        autoCapitalize="none"
                        keyboardType="email-address"
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="lock" size={20} color="#6A9C89" />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#CD5C08"
                        secureTextEntry
                      />
                    </View>

                    <TouchableOpacity style={styles.forgotPassword}>
                      <Text style={styles.forgotPasswordText}>
                        Forgot Password?
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.button}
                      onPress={handleLogin}
                    >
                      <Text style={styles.buttonText}>Sign In</Text>
                    </TouchableOpacity>

                    <View style={styles.divider}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>or continue with</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    <TouchableOpacity style={styles.googleButton}>
                      <FontAwesome5 name="google" size={20} color="#444" />
                      <Text style={styles.googleButtonText}>
                        Sign in with Google
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: height * 0.7,
    padding: 20,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#e9ecef",
    borderRadius: 2,
    marginBottom: 20,
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: -10,
    padding: 8,
  },
  modalBody: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
  },
  inputContainer: {
    width: "100%",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#495057",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: "#6A9C89",
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#C1D8C3",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6A9C89",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e9ecef",
  },
  dividerText: {
    color: "#6c757d",
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  googleButtonText: {
    color: "#444",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 12,
  },
});

export default LoginModal;
