// WelcomeScreen.js
// 메인 웰컴 스크린 - 앱 시작시 처음 보이는 화면을 담당

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
import LoginModal from "./Login";

const { height } = Dimensions.get("window");

const WelcomeScreen = ({ navigation }) => {
  // 로그인 모달 표시 여부 상태 관리
  const [showLoginModal, setShowLoginModal] = useState(false);

  // 애니메이션 초기값 설정
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(20);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);
  const buttonContainerOpacity = useSharedValue(0);
  const buttonContainerTranslateY = useSharedValue(30);

  // 애니메이션 스타일 정의
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

  // 컴포넌트 마운트 시 실행되는 애니메이션
  React.useEffect(() => {
    const animationConfig = {
      duration: 1000,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
    };

    // 타이틀 애니메이션
    setTimeout(() => {
      titleOpacity.value = withTiming(1, animationConfig);
      titleTranslateY.value = withTiming(0, animationConfig);
    }, 200);

    // 서브타이틀 애니메이션
    setTimeout(() => {
      subtitleOpacity.value = withTiming(1, animationConfig);
      subtitleTranslateY.value = withTiming(0, animationConfig);
    }, 1000);

    // 버튼 컨테이너 애니메이션
    setTimeout(() => {
      buttonContainerOpacity.value = withTiming(1, animationConfig);
      buttonContainerTranslateY.value = withTiming(0, animationConfig);
    }, 1300);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* 배경 이미지 설정 */}
      <ImageBackground
        source={require("../../src/assets/image/path_to_background_image.jpg")}
        style={styles.background}
      >
        {/* 그라데이션 오버레이 */}
        <LinearGradient
          colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.5)", "transparent"]}
          style={styles.gradient}
        >
          <View style={styles.contentContainer}>
            {/* 타이틀 영역 */}
            <View style={styles.titleContainer}>
              <Animated.Text style={[styles.mainTitle, titleStyle]}>
                With Pepys,
              </Animated.Text>
              <Animated.Text style={[styles.subTitle, subtitleStyle]}>
                No Insight is Ever Lost.
              </Animated.Text>
            </View>

            {/* 버튼 영역 */}
            <Animated.View
              style={[styles.buttonContainer, buttonContainerStyle]}
            >
              {/* 로그인 버튼 */}
              <TouchableOpacity
                style={styles.welcomeButton}
                onPress={() => {
                  console.log(
                    "SIGN IN 버튼 클릭됨, showLoginModal:",
                    showLoginModal
                  ); //오류 관련 추가
                  setShowLoginModal(true);
                }}
              >
                <Text style={styles.welcomeButtonText}>SIGN IN</Text>
              </TouchableOpacity>

              {/* 회원가입 버튼 */}
              <TouchableOpacity
                style={{
                  background: "transparent",
                  borderWidth: 2,
                  borderRadius: 15,
                  borderColor: "white",
                  height: 56,
                  justifyContent: "center",
                  alignItems: "center",
                }}
                onPress={() => navigation.navigate("SignUp")}
              >
                <Text style={styles.signUpButtonText}>SIGN UP</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* 로그인 모달 컴포넌트 */}
          <LoginModal
            visible={showLoginModal}
            onClose={() => {
              console.log("LoginModal 닫힘"); //오류 관련 추가
              setShowLoginModal(false);
            }}
            navigation={navigation}
          />
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  // 메인 컨테이너
  container: {
    flex: 1,
  },
  // 배경 이미지 스타일
  background: {
    flex: 1,
    resizeMode: "cover",
  },
  // 그라데이션 스타일
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight + 20,
  },
  // 콘텐츠 컨테이너 스타일
  contentContainer: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 30,
    paddingTop: height * 0.15,
    paddingBottom: 50,
  },
  // 타이틀 영역 스타일
  titleContainer: {
    alignItems: "flex-start",
  },
  // 메인 타이틀 텍스트 스타일
  mainTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffeb3b",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  // 서브 타이틀 텍스트 스타일
  subTitle: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#ffffff",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginTop: 8,
  },
  // 버튼 컨테이너 스타일
  buttonContainer: {
    width: "100%",
  },
  // 로그인 버튼 스타일
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
  // 로그인 버튼 텍스트 스타일
  welcomeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6c63ff",
  },
  // 회원가입 버튼 스타일
  signUpButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  // 회원가입 버튼 텍스트 스타일
  signUpButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default WelcomeScreen;
