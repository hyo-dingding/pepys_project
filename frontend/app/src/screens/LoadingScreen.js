import React, { useEffect } from "react";
import { View, Image, StyleSheet, Animated, Easing } from "react-native";

const LoadingScreen = () => {
  const logoAnimation = new Animated.Value(0);

  useEffect(() => {
    animateLogo();
  }, []);

  const animateLogo = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnimation, {
          toValue: -1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(logoAnimation, {
          toValue: 0,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const rotation = logoAnimation.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-5deg", "5deg"],
  });

  return (
    <View style={styles.loadingContainer}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        <Image
          source={require("../assets/image/logo.png")}
          style={styles.logo}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  logoContainer: {
    // 원형이 아닌 이미지를 위해 borderRadius 제거
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
    borderRadius: 20, // 모서리를 둥글게 만들기 위해 추가 (필요에 따라 조정)
  },
});

export default LoadingScreen;
