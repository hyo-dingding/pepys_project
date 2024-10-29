import React, { useState, useRef } from "react";
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
  Animated,
  PanResponder,
  Alert, // 추가
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NGROK_URL } from "@env";

const { height } = Dimensions.get("window");

const ForgotPasswordModal = ({ visible, onClose }) => {
  const [email, setEmail] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleForgotPassword = async () => {
    try {
      const response = await axios.post("${NGROK_URL}/forgot-password/", {
        email,
      });

      if (response.status === 200) {
        setIsEmailSent(true);
        Alert.alert("Success", "A reset code has been sent to your email.", [
          { text: "OK", onPress: onClose },
        ]);
      }
    } catch (error) {
      console.error("Error during forgot password:", error);

      if (error.response && error.response.status === 404) {
        Alert.alert("Error", "User not found with this email.");
      } else {
        Alert.alert("Error", "Failed to send reset code. Please try again.");
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.modalContainer}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.forgotPasswordContent}>
                <TouchableOpacity
                  style={styles.forgotPasswordCloseButton}
                  onPress={onClose}
                >
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>

                {!isEmailSent ? (
                  <>
                    <View style={styles.forgotPasswordHeader}>
                      <MaterialIcons
                        name="lock-open"
                        size={50}
                        color="#6A9C89"
                      />
                      <Text style={styles.forgotPasswordTitle}>
                        Forgot Password?
                      </Text>
                      <Text style={styles.forgotPasswordSubtitle}>
                        Enter your email address and we'll send you instructions
                        to reset your password.
                      </Text>
                    </View>

                    <View style={styles.forgotPasswordInputWrapper}>
                      <MaterialIcons name="email" size={20} color="#6A9C89" />
                      <TextInput
                        style={styles.forgotPasswordInput}
                        placeholder="Enter your email"
                        placeholderTextColor="#CD5C08"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.forgotPasswordButton}
                      onPress={handleForgotPassword}
                    >
                      <Text style={styles.forgotPasswordButtonText}>
                        Send Reset Link
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.successMessage}>
                    <MaterialIcons
                      name="check-circle"
                      size={50}
                      color="#6A9C89"
                    />
                    <Text style={styles.successTitle}>Email Sent!</Text>
                    <Text style={styles.successText}>
                      Please check your email for password reset instructions.
                    </Text>
                  </View>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const LoginModal = ({ visible, onClose, navigation }) => {
  const [email, setEmail] = useState(""); // 이메일 입력 상태
  const [password, setPassword] = useState(""); // 비밀번호 입력 상태

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const panY = useRef(new Animated.Value(0)).current;

  const resetPositionAnim = Animated.timing(panY, {
    toValue: 0,
    duration: 300,
    useNativeDriver: true,
  });

  const closeAnim = Animated.timing(panY, {
    toValue: height,
    duration: 300,
    useNativeDriver: true,
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => false,
      onPanResponderMove: (e, gs) => {
        panY.setValue(gs.dy);
      },
      onPanResponderRelease: (e, gs) => {
        if (gs.dy > 50) {
          closeAnim.start(onClose);
        } else {
          resetPositionAnim.start();
        }
      },
    })
  ).current;

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        "${NGROK_URL}/auth/login", // 정확한 ngrok URL과 경로 사용
        {
          email, // 사용자 입력값
          password, // 사용자 입력값
        }
      );

      if (response.status === 200) {
        const { access_token } = response.data;
        console.log("Login successful, token:", access_token);
        // 토큰저장
        await AsyncStorage.setItem("access_token", access_token);

        // 로그인 성공 처리, 토큰 저장 등
        navigation.navigate("MainTabs", { screen: "RoomSetup" });
      } else {
        console.error("Login failed", response.status);
      }
    } catch (error) {
      console.error("Error during login:", error);

      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert(
            "Error",
            "Invalid credentials. Please check your email or password."
          );
        } else {
          Alert.alert(
            "Error",
            "An error occurred during login. Please try again."
          );
        }
      } else if (error.request) {
        Alert.alert(
          "Error",
          "Failed to connect to server. Please check your network connection."
        );
      } else {
        Alert.alert("Error", "An error occurred while setting up the request.");
      }
    }
  };

  const translateY = panY.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <>
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
              <Animated.View
                style={[
                  styles.modalContent,
                  {
                    transform: [{ translateY }],
                  },
                ]}
                {...panResponder.panHandlers}
              >
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
                        value={email}
                        onChangeText={setEmail}
                      />
                    </View>

                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="lock" size={20} color="#6A9C89" />
                      <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#CD5C08"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                      />
                    </View>

                    <TouchableOpacity
                      style={styles.forgotPassword}
                      onPress={() => setShowForgotPassword(true)}
                    >
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
              </Animated.View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>

      <ForgotPasswordModal
        visible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
      />
    </>
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
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
    padding: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e9ecef",
  },
  dividerText: {
    color: "#6c757d",
    paddingHorizontal: 16,
    fontSize: 16,
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
  forgotPasswordContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginVertical: height * 0.2,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  forgotPasswordCloseButton: {
    position: "absolute",
    right: 15,
    top: 15,
    zIndex: 1,
  },
  forgotPasswordHeader: {
    alignItems: "center",
    marginVertical: 20,
  },
  forgotPasswordTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginVertical: 10,
  },
  forgotPasswordSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  forgotPasswordInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginVertical: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    width: "100%",
  },
  forgotPasswordInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#495057",
  },
  forgotPasswordButton: {
    backgroundColor: "#6A9C89",
    borderRadius: 12,
    height: 50,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  forgotPasswordButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  successMessage: {
    alignItems: "center",
    padding: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#333",
    marginVertical: 15,
  },
  successText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

export default LoginModal;
