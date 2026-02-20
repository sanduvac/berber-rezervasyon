import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Barber, BarberService } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";

type BarberDetailScreenProps = {
  barber: Barber;
  onBack: () => void;
  onStartAppointment: (service: BarberService) => void;
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

export function BarberDetailScreen({
  barber,
  onBack,
  onStartAppointment,
  isFavorite,
  onToggleFavorite
}: BarberDetailScreenProps) {
  const { colors } = useTheme();
  const openNow = isOpenNow(barber);

  return (
    <View style={styles.container}>
      <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={onBack}>
        <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
        <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.titleRow}>
          <Text style={[styles.name, { color: colors.textPrimary }]}>{barber.name}</Text>
          <Pressable
            style={[styles.favoriteButton, {
              borderColor: isFavorite ? "rgba(255, 107, 157, 0.3)" : colors.primaryBorder,
              backgroundColor: isFavorite ? colors.pinkMuted : colors.primaryBg
            }]}
            onPress={() => onToggleFavorite(barber.id)}
          >
            <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={14} color={isFavorite ? colors.pink : colors.primaryMuted} />
            <Text style={[styles.favoriteButtonText, { color: isFavorite ? colors.pink : colors.primaryMuted }]}>
              {isFavorite ? "Favoride" : "Favoriye ekle"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.primary} />
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{barber.locationLabel} | {barber.distanceKm.toFixed(1)} km</Text>
        </View>
        <View style={styles.metaRow}>
          <Ionicons name="star" size={14} color={colors.gold} />
          <Text style={[styles.meta, { color: colors.textSecondary }]}>{barber.rating.toFixed(1)} ({barber.reviewCount} yorum)</Text>
        </View>
        <View style={styles.hoursRow}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={14} color={colors.textMuted} />
            <Text style={[styles.meta, { color: colors.textSecondary }]}>{barber.openingTime} - {barber.closingTime}</Text>
          </View>
          <View style={[styles.statusPill, openNow
            ? { backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder }
            : { backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder }
          ]}>
            <View style={[styles.statusDot, { backgroundColor: openNow ? colors.success : colors.error }]} />
            <Text style={[styles.statusText, { color: openNow ? colors.success : colors.error }]}>
              {openNow ? "Şu an açık" : "Şu an kapalı"}
            </Text>
          </View>
        </View>
        <Text style={[styles.description, { color: colors.textSecondary }]}>{barber.description}</Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>İşletme Bilgileri</Text>
          <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={[styles.infoRow, { borderBottomColor: colors.divider }]}>
              <View style={styles.infoKeyRow}>
                <Ionicons name="sunny-outline" size={14} color={colors.primary} />
                <Text style={[styles.infoKey, { color: colors.textSecondary }]}>Açılış</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.secondary }]}>{barber.openingTime}</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <View style={styles.infoKeyRow}>
                <Ionicons name="moon-outline" size={14} color={colors.primary} />
                <Text style={[styles.infoKey, { color: colors.textSecondary }]}>Kapanış</Text>
              </View>
              <Text style={[styles.infoValue, { color: colors.secondary }]}>{barber.closingTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hizmetler ve Fiyatlar</Text>
          <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>Hizmeti seç ve randevu ekranına geç.</Text>
          {barber.services.map((service) => (
            <Pressable
              style={[styles.serviceRow, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
              key={service.id}
              onPress={() => onStartAppointment(service)}
            >
              <View style={styles.serviceLeft}>
                <Text style={[styles.serviceName, { color: colors.textPrimary }]}>{service.name}</Text>
                <Text style={[styles.serviceHint, { color: colors.textMuted }]}>Randevu al ekranını aç</Text>
              </View>
              <View style={styles.serviceRight}>
                <Text style={[styles.servicePrice, { color: colors.secondary }]}>{service.price} TL</Text>
                <View style={[styles.serviceArrowBg, { backgroundColor: colors.primaryBg }]}>
                  <Ionicons name="chevron-forward" size={16} color={colors.primaryMuted} />
                </View>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Son Yorumlar</Text>
          {barber.reviews.map((review) => (
            <View style={[styles.reviewCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} key={review.id}>
              <View style={styles.reviewHeader}>
                <View style={[styles.reviewAvatar, { backgroundColor: colors.primaryBg }]}>
                  <Text style={[styles.reviewAvatarText, { color: colors.primaryMuted }]}>{review.userName[0]}</Text>
                </View>
                <View style={styles.reviewHeaderText}>
                  <Text style={[styles.reviewUser, { color: colors.textPrimary }]}>{review.userName}</Text>
                  <View style={styles.reviewStars}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= review.rating ? "star" : "star-outline"}
                        size={12}
                        color={star <= review.rating ? colors.gold : colors.textMuted}
                      />
                    ))}
                  </View>
                </View>
                <Text style={[styles.reviewDate, { color: colors.textMuted }]}>{review.date}</Text>
              </View>
              <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>{review.comment}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  backButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 12
  },
  backButtonText: { fontWeight: "700" },
  name: { fontSize: 28, fontWeight: "800", flex: 1, letterSpacing: -0.3 },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  favoriteButton: {
    flexDirection: "row", alignItems: "center", gap: 5,
    borderRadius: 999, borderWidth: 1,
    paddingHorizontal: 12, paddingVertical: 7, marginTop: 5
  },
  favoriteButtonText: { fontWeight: "700", fontSize: 12 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 5 },
  meta: {},
  hoursRow: { marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  statusPill: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  statusDot: { width: 6, height: 6, borderRadius: 999 },
  statusText: { fontSize: 12, fontWeight: "700" },
  description: { marginTop: 12, lineHeight: 22 },
  section: { marginTop: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "800", letterSpacing: -0.2 },
  sectionCaption: { marginTop: 6, marginBottom: 10 },
  infoCard: { marginTop: 10, borderWidth: 1, borderRadius: 16, padding: 14 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, marginBottom: 10, borderBottomWidth: 1 },
  infoRowLast: { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 },
  infoKeyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  infoKey: { fontWeight: "500" },
  infoValue: { fontWeight: "700" },
  serviceRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8
  },
  serviceLeft: { flex: 1, marginRight: 10 },
  serviceRight: { alignItems: "flex-end", gap: 6 },
  serviceName: { fontWeight: "700", fontSize: 15 },
  serviceHint: { marginTop: 4, fontSize: 12 },
  servicePrice: { fontWeight: "700" },
  serviceArrowBg: { width: 28, height: 28, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  reviewCard: { borderWidth: 1, borderRadius: 16, padding: 14, marginTop: 8 },
  reviewHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: { width: 32, height: 32, borderRadius: 999, alignItems: "center", justifyContent: "center" },
  reviewAvatarText: { fontWeight: "700", fontSize: 14 },
  reviewHeaderText: { flex: 1 },
  reviewUser: { fontWeight: "700" },
  reviewStars: { flexDirection: "row", gap: 2, marginTop: 2 },
  reviewComment: { lineHeight: 20 },
  reviewDate: { fontSize: 12 }
});
