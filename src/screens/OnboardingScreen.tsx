import { useRef, useState } from "react";
import { Animated, Dimensions, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../theme/ThemeContext";

const { width, height } = Dimensions.get("window");

type OnboardingSlide = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const SLIDES = [
  {
    id: "1",
    title: "En İyi Berberleri Keşfet",
    subtitle: "Yakınındaki ve en yüksek puanlı berberleri bul, detaylı olarak incele.",
    icon: "location-outline" as const,
    color: "#6C5CE7"
  },
  {
    id: "2",
    title: "Sıra Bekleme Derdine Son",
    subtitle: "Müsait saatleri gör, saniyeler içinde kendi randevunu oluştur.",
    icon: "calendar-outline" as const,
    color: "#00D2FF"
  },
  {
    id: "3",
    title: "Tarzını Yenile",
    subtitle: "Favori berberlerini kaydet, sana en uygun stil için adım at.",
    icon: "star-outline" as const,
    color: "#F59E0B"
  }
] satisfies OnboardingSlide[];

type Props = {
  onFinish: () => void;
};

export function OnboardingScreen({ onFinish }: Props) {
  const { colors, mode } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<OnboardingSlide>>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  async function completeOnboarding() {
    try {
      await AsyncStorage.setItem("@hasSeenOnboarding", "true");
      onFinish();
    } catch (err) {
      console.error("Onboarding kaydedilemedi:", err);
      onFinish(); // Hata olsa bile devam etsin
    }
  }

  function nextSlide() {
    if (currentIndex < SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      slidesRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true
      });
    } else {
      completeOnboarding();
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Arka plan glow efektleri */}
      <View style={[styles.glowPrimary, { backgroundColor: colors.glowPrimary }]} />
      <View style={[styles.glowSecondary, { backgroundColor: colors.glowSecondary }]} />

      <FlatList
        data={SLIDES}
        ref={slidesRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index
        })}
        onMomentumScrollEnd={(event) => {
          const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(nextIndex);
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <View style={[styles.iconCircle, { borderColor: mode === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }]}>
              <View style={[styles.iconInner, { backgroundColor: `${item.color}20` }]}>
                <Ionicons name={item.icon} size={64} color={item.color} />
              </View>
            </View>
            <Text style={[styles.title, { color: colors.textPrimary }]}>{item.title}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
          </View>
        )}
      />

      <View style={styles.footer}>
        {/* Paginator */}
        <View style={styles.paginator}>
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp"
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp"
            });
            const bgColor = scrollX.interpolate({
              inputRange,
              outputRange: ["#8896AE", colors.primary, "#8896AE"],
              extrapolate: "clamp"
            });

            return (
              <Animated.View
                key={i.toString()}
                style={[styles.dot, { width: dotWidth, opacity, backgroundColor: bgColor }]}
              />
            );
          })}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsWrap}>
          {currentIndex < SLIDES.length - 1 ? (
            <Pressable style={styles.skipButton} onPress={completeOnboarding}>
              <Text style={[styles.skipText, { color: colors.textMuted }]}>Atla</Text>
            </Pressable>
          ) : (
            <View style={styles.skipButton} /> // Boşluk tutucu
          )}

          <Pressable
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={nextSlide}
          >
            <Text style={styles.nextText}>
              {currentIndex === SLIDES.length - 1 ? "Başla" : "İleri"}
            </Text>
            {currentIndex !== SLIDES.length - 1 && (
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glowPrimary: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    top: -100,
    left: -100,
    opacity: 0.6
  },
  glowSecondary: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 999,
    bottom: -50,
    right: -100,
    opacity: 0.5
  },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: height * 0.1
  },
  iconCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 40,
    borderStyle: "dashed"
  },
  iconInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "500"
  },
  footer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 30
  },
  paginator: {
    flexDirection: "row",
    height: 10,
    justifyContent: "center",
    marginBottom: 40
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4
  },
  buttonsWrap: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  skipButton: {
    paddingVertical: 10,
    paddingHorizontal: 16
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600"
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999
  },
  nextText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700"
  }
});
