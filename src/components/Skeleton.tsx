import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, type ViewStyle } from "react-native";
import { useTheme } from "../theme/ThemeContext";

type SkeletonProps = {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
};

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const { colors, mode } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true
        })
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7]
  });

  const bgColor = mode === "dark" ? "rgba(108, 92, 231, 0.15)" : "rgba(108, 92, 231, 0.08)";

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius, backgroundColor: bgColor, opacity },
        style
      ]}
    />
  );
}

export function BarberCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Skeleton width="100%" height={120} borderRadius={0} style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }} />
      <View style={skeletonStyles.content}>
        <View style={skeletonStyles.row}>
          <Skeleton width="60%" height={20} borderRadius={10} />
          <Skeleton width={60} height={26} borderRadius={13} />
        </View>
        <Skeleton width="45%" height={14} borderRadius={7} style={{ marginTop: 8 }} />
        <Skeleton width="55%" height={13} borderRadius={7} style={{ marginTop: 8 }} />
        <View style={[skeletonStyles.row, { marginTop: 10 }]}>
          <Skeleton width="40%" height={13} borderRadius={7} />
          <Skeleton width={60} height={24} borderRadius={12} />
        </View>
      </View>
    </View>
  );
}

export function AppointmentCardSkeleton() {
  const { colors } = useTheme();

  return (
    <View style={[skeletonStyles.appointmentCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <Skeleton width={80} height={24} borderRadius={12} style={{ alignSelf: "flex-end", marginBottom: 8 }} />
      <Skeleton width="55%" height={20} borderRadius={10} />
      <Skeleton width="70%" height={14} borderRadius={7} style={{ marginTop: 8 }} />
      <Skeleton width="40%" height={14} borderRadius={7} style={{ marginTop: 6 }} />
      <Skeleton width="50%" height={14} borderRadius={7} style={{ marginTop: 6 }} />
      <Skeleton width="35%" height={14} borderRadius={7} style={{ marginTop: 12 }} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    overflow: "hidden"
  },
  content: {
    padding: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  appointmentCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 10
  }
});
