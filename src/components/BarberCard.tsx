import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Barber } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";

type BarberCardProps = {
  barber: Barber;
  onPress: (barber: Barber) => void;
  isFavorite: boolean;
  onToggleFavorite: (barberId: string) => void;
};

function toMinutes(value: string): number {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function isOpenNow(barber: Barber, now: Date = new Date()): boolean {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openingMinutes = toMinutes(barber.openingTime);
  const closingMinutes = toMinutes(barber.closingTime);

  if (openingMinutes <= closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }

  return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
}

export function BarberCard({ barber, onPress, isFavorite, onToggleFavorite }: BarberCardProps) {
  const { colors } = useTheme();
  const previewComment = barber.reviews[0]?.comment;
  const lowestPrice = Math.min(...barber.services.map((service) => service.price));
  const openNow = isOpenNow(barber);

  return (
    <Pressable style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} onPress={() => onPress(barber)}>
      <View style={styles.cover}>
        <Image
          source={{ uri: barber.coverImageUrl }}
          style={[StyleSheet.absoluteFillObject, { borderTopLeftRadius: 20, borderTopRightRadius: 20 }]}
          resizeMode="cover"
        />
        <View style={[styles.coverOverlay, { backgroundColor: colors.coverOverlay }]} />
        <View style={styles.badgesRow}>
          <View style={[styles.badge, { backgroundColor: colors.coverBadgeBg, borderColor: colors.coverBadgeBorder }]}>
            <Ionicons name="navigate" size={10} color={colors.secondary} />
            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{barber.distanceKm.toFixed(1)} km</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.coverBadgeBg, borderColor: colors.coverBadgeBorder }]}>
            <Ionicons name="star" size={10} color={colors.gold} />
            <Text style={[styles.badgeText, { color: colors.textPrimary }]}>{barber.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Pressable style={[styles.favoriteButton, { backgroundColor: colors.coverBadgeBg, borderColor: colors.coverBadgeBorder }]} onPress={() => onToggleFavorite(barber.id)}>
          <Ionicons
            name={isFavorite ? "heart" : "heart-outline"}
            size={18}
            color={isFavorite ? colors.pink : colors.textPrimary}
          />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{barber.name}</Text>
          <View style={[styles.priceTag, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
            <Text style={[styles.priceText, { color: colors.primaryMuted }]}>{lowestPrice} TL</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color={colors.primary} />
          <Text style={[styles.location, { color: colors.textSecondary }]}>{barber.locationLabel}</Text>
        </View>

        <Text style={[styles.meta, { color: colors.textMuted }]}>{barber.reviewCount} yorum • {barber.services.length} hizmet</Text>

        <View style={styles.hoursRow}>
          <View style={styles.hoursInner}>
            <Ionicons name="time-outline" size={13} color={colors.textMuted} />
            <Text style={[styles.hoursText, { color: colors.textMuted }]}>
              {barber.openingTime} - {barber.closingTime}
            </Text>
          </View>
          <View style={[
            styles.statusPill,
            openNow
              ? { backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder }
              : { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder }
          ]}>
            <View style={[styles.statusDot, { backgroundColor: openNow ? colors.success : colors.error }]} />
            <Text style={[styles.statusText, { color: openNow ? colors.success : colors.error }]}>
              {openNow ? "Açık" : "Kapalı"}
            </Text>
          </View>
        </View>

        {previewComment ? (
          <View style={[styles.previewWrap, { backgroundColor: colors.primaryBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="chatbubble-outline" size={12} color={colors.primary} />
            <Text style={[styles.preview, { color: colors.textSecondary }]}>"{previewComment}"</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  },
  cover: {
    height: 120,
    justifyContent: "space-between",
    padding: 10
  },
  coverImage: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject
  },
  badgesRow: {
    flexDirection: "row",
    gap: 6,
    zIndex: 2
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 3,
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700"
  },
  content: {
    padding: 14
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2
  },
  priceTag: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999
  },
  priceText: {
    fontSize: 12,
    fontWeight: "700"
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6
  },
  location: {
    fontSize: 13
  },
  meta: {
    marginTop: 8,
    fontSize: 13
  },
  hoursRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8
  },
  hoursInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  hoursText: {
    fontSize: 12.5,
    fontWeight: "600"
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 999
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700"
  },
  previewWrap: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  preview: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18
  }
});
