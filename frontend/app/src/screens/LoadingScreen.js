import React, { useEffect } from "react";
import { View, Image, StyleSheet, Animated, Easing } from "react-native";

const LoadingScreen = () => {
  const logoAnimation = new Animated.Value(0);
  const opacityAnimation = new Animated.Value(0.5);

  useEffect(() => {
    animateLogo();
    animateOpacity();
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

  const animateOpacity = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnimation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnimation, {
          toValue: 0.5,
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
          styles.logoBackground,
          {
            opacity: opacityAnimation,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        <Image
          source={require("../assets/image/logo3.png")}
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
    backgroundColor: "#4A00E0", // 단색 배경
  },
  logoContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
});

export default LoadingScreen;
