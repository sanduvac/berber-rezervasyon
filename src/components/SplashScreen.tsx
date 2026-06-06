import { useEffect, useRef } from "react";
import { Animated, Dimensions, Image, Platform, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/ThemeContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const LOGO_SIZE = SCREEN_WIDTH * 0.42;

type Props = {
  onFinish: () => void;
};

export function SplashScreen({ onFinish }: Props) {
  const { colors } = useTheme();

  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;
  const hasFinished = useRef(false);

  useEffect(() => {
    const useNativeDriver = Platform.OS !== "web";
    const finishOnce = () => {
      if (hasFinished.current) return;
      hasFinished.current = true;
      onFinish();
    };
    const fallbackTimeoutId = setTimeout(finishOnce, 3600);

    Animated.parallel([
      Animated.timing(glowOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver
      })
    ]).start(() => {
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 500,
            useNativeDriver
          }),
          Animated.timing(titleTranslateY, {
            toValue: 0,
            duration: 500,
            useNativeDriver
          })
        ]),
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver
        })
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(screenOpacity, {
            toValue: 0,
            duration: 500,
            useNativeDriver
          }).start(finishOnce);
        }, 600);
      });
    });

    return () => clearTimeout(fallbackTimeoutId);
  }, []);

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: screenOpacity }]}>
      {/* Glow efekti */}
      <Animated.View style={[styles.glowCircle, {
        opacity: glowOpacity,
        backgroundColor: colors.glowPrimary
      }]} />
      <Animated.View style={[styles.glowCircle2, {
        opacity: glowOpacity,
        backgroundColor: colors.glowSecondary
      }]} />

      {/* Logo */}
      <Animated.View style={[styles.logoWrap, {
        transform: [{ scale: logoScale }],
        opacity: logoOpacity
      }]}>
        <Image
          source={require("../assets/splash_logo.png")}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Başlık */}
      <Animated.Text style={[styles.title, {
        color: colors.textPrimary,
        opacity: titleOpacity,
        transform: [{ translateY: titleTranslateY }]
      }]}>
        Berber Rezervasyon
      </Animated.Text>

      {/* Alt başlık */}
      <Animated.Text style={[styles.subtitle, {
        color: colors.textSecondary,
        opacity: subtitleOpacity
      }]}>
        Randevunu kolayca al
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999
  },
  glowCircle: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    top: "25%",
    left: "10%"
  },
  glowCircle2: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 999,
    bottom: "30%",
    right: "5%"
  },
  logoWrap: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    borderRadius: LOGO_SIZE / 2,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.5,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
    elevation: 20
  },
  logoImage: {
    width: "100%",
    height: "100%"
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600"
  }
});
