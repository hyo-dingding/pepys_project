import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  StatusBar,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import LoginModal from "./Login"; // Login 컴포넌트 임포트

const { height } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 애니메이션 값 설정
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const buttonContainerOpacity = useSharedValue(0);
  const buttonContainerTranslateY = useSharedValue(30);

  // 애니메이션 스타일
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const buttonContainerStyle = useAnimatedStyle(() => ({
    opacity: buttonContainerOpacity.value,
    transform: [{ translateY: buttonContainerTranslateY.value }],
  }));

  // 시작 애니메이션
  React.useEffect(() => {
    const animationConfig = {
      duration: 1200,
      easing: Easing.bezier(0.22, 1, 0.36, 1),
    };

    setTimeout(() => {
      titleOpacity.value = withTiming(1, animationConfig);
      titleTranslateY.value = withTiming(0, animationConfig);
    }, 300);

    setTimeout(() => {
      subtitleOpacity.value = withTiming(1, animationConfig);
      subtitleTranslateY.value = withTiming(0, animationConfig);
    }, 800);

    setTimeout(() => {
      buttonContainerOpacity.value = withTiming(1, animationConfig);
      buttonContainerTranslateY.value = withTiming(0, animationConfig);
    }, 1300);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../src/assets/image/path_to_background_image.jpg")}
        style={styles.background}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.5)", "rgba(0,0,0,0.3)", "transparent"]}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            <View style={styles.titleContainer}>
              <Animated.Text style={[styles.mainTitle, titleStyle]}>
                With Pepys,
              </Animated.Text>
              <Animated.Text style={[styles.subTitle, subtitleStyle]}>
                No Insight is Ever Lost.
              </Animated.Text>
            </View>

            <Animated.View
              style={[styles.buttonContainer, buttonContainerStyle]}
            >
              <TouchableOpacity
                style={styles.welcomeButton}
                onPress={() => setShowLoginModal(true)}
              >
                <Text style={styles.welcomeButtonText}>SIGN IN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.welcomeButton, styles.signUpButton]}
                onPress={() => navigation.navigate("SignUp")}
              >
                <Text style={styles.signUpButtonText}>SIGN UP</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          <LoginModal
            visible={showLoginModal}
            onClose={() => setShowLoginModal(false)}
            navigation={navigation}
          />
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 20,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingTop: height * 0.15,
    paddingBottom: 50,
  },
  titleContainer: {
    alignItems: "flex-start",
  },
  mainTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginTop: 8,
  },
  buttonContainer: {
    width: "100%",
  },
  welcomeButton: {
    backgroundColor: "#ffffff",
    borderRadius: 15,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  welcomeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c63ff",
  },
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  signUpButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
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
  modalTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 8,
  },
  modalSubtitle: {
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
    color: "#6c63ff",
    fontSize: 14,
    fontWeight: "600",
  },
  signInButton: {
    backgroundColor: "#6c63ff",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#6c63ff",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  signInButtonText: {
    color: "#ffffff",
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
    backgroundColor: "#ffffff",
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

export default WelcomeScreen;
