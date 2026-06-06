import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import { isOpenNow } from "../utils/dateUtils";

type DetailRouteParams = {
  barberId?: string;
};

export function BarberDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { getBarber, favoriteBarberIds, toggleFavorite } = useApp();
  const { colors } = useTheme();

  const routeParams = route.params as DetailRouteParams | undefined;
  const barber = routeParams?.barberId ? getBarber(routeParams.barberId) : undefined;
  const isWide = width >= 960;

  if (!barber) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Ionicons name="storefront-outline" size={42} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Berber bulunamadı</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Seçilen berber bilgisi yüklenemedi. Lütfen listeye dönüp tekrar deneyin.
          </Text>
          <Pressable style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={styles.emptyButtonText}>Geri Dön</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const isFavorite = favoriteBarberIds.includes(barber.id);
  const openNow = isOpenNow(barber);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={[styles.heroCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Image source={{ uri: barber.coverImageUrl }} style={styles.coverImage} resizeMode="cover" />
            <View style={[styles.coverOverlay, { backgroundColor: colors.coverOverlay }]} />

            <View style={styles.heroTopRow}>
              <Pressable
                style={[styles.coverButton, { backgroundColor: colors.coverBadgeBg, borderColor: colors.coverBadgeBorder }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
                <Text style={[styles.coverButtonText, { color: colors.textPrimary }]}>Geri</Text>
              </Pressable>

              <Pressable
                style={[styles.coverButton, { backgroundColor: colors.coverBadgeBg, borderColor: colors.coverBadgeBorder }]}
                onPress={() => toggleFavorite(barber.id)}
              >
                <Ionicons name={isFavorite ? "heart" : "heart-outline"} size={17} color={isFavorite ? colors.pink : colors.textPrimary} />
                <Text style={[styles.coverButtonText, { color: isFavorite ? colors.pink : colors.textPrimary }]}>
                  {isFavorite ? "Favoride" : "Favoriye ekle"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.heroContent}>
              <View style={[styles.statusPill, openNow
                ? { backgroundColor: colors.successBg, borderColor: colors.successBorder }
                : { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }
              ]}>
                <View style={[styles.statusDot, { backgroundColor: openNow ? colors.success : colors.error }]} />
                <Text style={[styles.statusText, { color: openNow ? colors.success : colors.error }]}>
                  {openNow ? "Şu an açık" : "Şu an kapalı"}
                </Text>
              </View>

              <Text style={styles.heroTitle}>{barber.name}</Text>
              <Text style={styles.heroDescription}>{barber.description}</Text>
            </View>
          </View>

          <View style={[styles.statsGrid, isWide && styles.statsGridWide]}>
            <InfoTile
              icon="location-outline"
              label="Konum"
              value={barber.locationLabel}
              color={colors.primary}
              colors={colors}
            />
            <InfoTile
              icon="star"
              label="Puan"
              value={`${barber.rating.toFixed(1)} (${barber.reviewCount} yorum)`}
              color={colors.gold}
              colors={colors}
            />
            <InfoTile
              icon="navigate-outline"
              label="Uzaklık"
              value={`${barber.distanceKm.toFixed(1)} km`}
              color={colors.secondary}
              colors={colors}
            />
            <InfoTile
              icon="time-outline"
              label="Saatler"
              value={`${barber.openingTime} - ${barber.closingTime}`}
              color={colors.primaryMuted}
              colors={colors}
            />
          </View>

          <View style={[styles.contentGrid, isWide && styles.contentGridWide]}>
            <View style={styles.mainColumn}>
              <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hizmetler ve Fiyatlar</Text>
                    <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>Hizmeti seç ve randevu saatlerini gör.</Text>
                  </View>
                  <Ionicons name="cut-outline" size={22} color={colors.primary} />
                </View>

                {barber.services.map((service) => (
                  <Pressable
                    style={[styles.serviceRow, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                    key={service.id}
                    onPress={() => navigation.navigate("AppointmentSelection", { barberId: barber.id, serviceId: service.id })}
                  >
                    <View style={styles.serviceLeft}>
                      <Text style={[styles.serviceName, { color: colors.textPrimary }]}>{service.name}</Text>
                      <Text style={[styles.serviceHint, { color: colors.textMuted }]}>Randevu al ekranına geç</Text>
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

              <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Son Yorumlar</Text>
                    <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>Müşterilerin son deneyimleri.</Text>
                  </View>
                  <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
                </View>

                {barber.reviews.length ? (
                  barber.reviews.map((review) => (
                    <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]} key={review.id}>
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
                  ))
                ) : (
                  <Text style={[styles.noReviewsText, { color: colors.textMuted }]}>Henüz yorum eklenmemiş.</Text>
                )}
              </View>
            </View>

            <View style={[styles.sideColumn, isWide && styles.sideColumnWide]}>
              <View style={[styles.sideCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sideTitle, { color: colors.textPrimary }]}>İşletme Bilgileri</Text>
                <InfoLine icon="sunny-outline" label="Açılış" value={barber.openingTime} colors={colors} />
                <InfoLine icon="moon-outline" label="Kapanış" value={barber.closingTime} colors={colors} />
                <InfoLine icon="location-outline" label="Bölge" value={barber.locationLabel} colors={colors} />
              </View>

              <View style={[styles.ctaCard, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
                <Ionicons name="calendar-outline" size={28} color={colors.primary} />
                <Text style={[styles.ctaTitle, { color: colors.textPrimary }]}>Randevunu hemen oluştur</Text>
                <Text style={[styles.ctaText, { color: colors.textSecondary }]}>
                  Hizmetlerden birini seçerek müsait saatlere geçebilirsin.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoTile({ icon, label, value, color, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[styles.infoTile, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
      <View style={[styles.infoTileIcon, { backgroundColor: colors.primaryBg }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.infoTileLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.infoTileValue, { color: colors.textPrimary }]} numberOfLines={2}>{value}</Text>
    </View>
  );
}

function InfoLine({ icon, label, value, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[styles.infoLine, { borderBottomColor: colors.divider }]}>
      <View style={styles.infoLineLeft}>
        <Ionicons name={icon} size={16} color={colors.primary} />
        <Text style={[styles.infoLineLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoLineValue, { color: colors.secondary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 48
  },
  page: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 18
  },
  heroCard: {
    height: 390,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden"
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%"
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject
  },
  heroTopRow: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12
  },
  coverButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  coverButtonText: {
    fontWeight: "800",
    fontSize: 13
  },
  heroContent: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    maxWidth: 720
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 14
  },
  heroDescription: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 16,
    lineHeight: 25,
    marginTop: 10,
    maxWidth: 620
  },
  statusPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 999
  },
  statusText: {
    fontSize: 12,
    fontWeight: "800"
  },
  statsGrid: {
    flexDirection: "column",
    gap: 12,
    marginTop: 16
  },
  statsGridWide: {
    flexDirection: "row"
  },
  infoTile: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    minHeight: 116
  },
  infoTileIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12
  },
  infoTileLabel: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  infoTileValue: {
    fontSize: 15,
    fontWeight: "800",
    lineHeight: 20
  },
  contentGrid: {
    gap: 16,
    marginTop: 16
  },
  contentGridWide: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  mainColumn: {
    flex: 1,
    gap: 16
  },
  sideColumn: {
    gap: 16
  },
  sideColumnWide: {
    width: 330
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3
  },
  sectionCaption: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "500"
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 15,
    marginBottom: 10
  },
  serviceLeft: {
    flex: 1,
    marginRight: 12
  },
  serviceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  serviceName: {
    fontWeight: "800",
    fontSize: 16
  },
  serviceHint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600"
  },
  servicePrice: {
    fontWeight: "900",
    fontSize: 16
  },
  serviceArrowBg: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  reviewCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 10
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  reviewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  reviewAvatarText: {
    fontWeight: "900",
    fontSize: 14
  },
  reviewHeaderText: {
    flex: 1
  },
  reviewUser: {
    fontWeight: "800"
  },
  reviewStars: {
    flexDirection: "row",
    gap: 2,
    marginTop: 3
  },
  reviewComment: {
    lineHeight: 22,
    fontSize: 14
  },
  reviewDate: {
    fontSize: 12,
    fontWeight: "700"
  },
  noReviewsText: {
    fontSize: 14,
    fontWeight: "600"
  },
  sideCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20
  },
  sideTitle: {
    fontSize: 19,
    fontWeight: "900",
    marginBottom: 10
  },
  infoLine: {
    borderBottomWidth: 1,
    paddingVertical: 13,
    gap: 10
  },
  infoLineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9
  },
  infoLineLabel: {
    fontSize: 13,
    fontWeight: "700"
  },
  infoLineValue: {
    fontSize: 16,
    fontWeight: "900"
  },
  ctaCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 8
  },
  ctaText: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600"
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  emptyCard: {
    width: "100%",
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    alignItems: "center"
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 8
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18
  },
  emptyButton: {
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "900"
  }
});
