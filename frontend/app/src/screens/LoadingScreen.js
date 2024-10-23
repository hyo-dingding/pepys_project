import React, { useEffect, useRef } from "react";
import { Image, View, StyleSheet, Animated, Text, Easing } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const LoadingScreen = () => {
  const logoScale = useRef(new Animated.Value(0)).current;
  const typingText = useRef(new Animated.Value(0)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animateLogo();
    animateText();
    animateBackground();
  }, []);

  const animateLogo = () => {
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const animateText = () => {
    Animated.timing(typingText, {
      toValue: 5,
      duration: 2500,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start();
  };

  const animateBackground = () => {
    Animated.timing(fadeIn, {
      toValue: 1,
      duration: 2000,
      easing: Easing.inOut(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const renderTypingText = () => {
    const text = "Pepys";
    const length = typingText.interpolate({
      inputRange: [0, 5],
      outputRange: [0, text.length],
    });
    return (
      <Animated.Text style={styles.typingText}>
        {text.substring(0, Math.round(length.__getValue()))}
      </Animated.Text>
    );
  };

  return (
    <Animated.View style={[{ flex: 1, opacity: fadeIn }]}>
      <LinearGradient
        colors={["#4A00E0", "#8E2DE2", "#F7971E"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <Image
              source={require("../../src/assets/image/logo-nobackground.png")}
              style={styles.logo}
            />
          </Animated.View>
          {renderTypingText()}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logoContainer: {
    padding: 0,
    elevation: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  typingText: {
    marginTop: 40,
    fontSize: 32,
    color: "#F7971E",
    fontWeight: "800",
    letterSpacing: 2,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default LoadingScreen;
