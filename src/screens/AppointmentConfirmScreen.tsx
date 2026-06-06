import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import { formatDateLabel } from "../utils/dateUtils";
import { mediumHaptic } from "../utils/haptics";

type AppointmentConfirmParams = {
  barberId?: string;
  serviceId?: string;
  date?: string;
  time?: string;
};

export function AppointmentConfirmScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { getBarber, getService, confirmAppointment } = useApp();
  const { colors } = useTheme();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const routeParams = route.params as AppointmentConfirmParams | undefined;
  const barber = routeParams?.barberId ? getBarber(routeParams.barberId) : undefined;
  const service = routeParams?.barberId && routeParams?.serviceId ? getService(routeParams.barberId, routeParams.serviceId) : undefined;
  const isWide = width >= 960;

  if (!routeParams?.date || !routeParams?.time || !barber || !service) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Ionicons name="alert-circle-outline" size={44} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Randevu onayı açılamadı</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Berber, hizmet veya zaman bilgisi eksik. Lütfen randevu seçim ekranından tekrar deneyin.
          </Text>
          <Pressable style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={styles.emptyButtonText}>Geri Dön</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  async function handleConfirm() {
    if (isSubmitting || !routeParams?.date || !routeParams?.time || !barber || !service) return;
    setIsSubmitting(true);
    try {
      mediumHaptic();
      await confirmAppointment({
        barberId: barber.id,
        serviceId: service.id,
        date: routeParams.date,
        time: routeParams.time,
        barberName: barber.name,
        serviceName: service.name
      });
      navigation.popToTop();
    } catch (error) {
      console.error("Randevu onaylanamadı:", error);
      setIsSubmitting(false);
    }
  }

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
            </View>

            <View style={styles.heroContent}>
              <View style={[styles.stepBadge, { backgroundColor: colors.coverBadgeBg, borderColor: colors.coverBadgeBorder }]}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#FFFFFF" />
                <Text style={styles.stepBadgeText}>Son kontrol</Text>
              </View>
              <Text style={styles.heroTitle}>Randevu Onayı</Text>
              <Text style={styles.heroDescription}>
                {barber.name} için seçtiğin randevuyu kontrol et ve tek tıkla onayla.
              </Text>
            </View>
          </View>

          <View style={[styles.contentGrid, isWide && styles.contentGridWide]}>
            <View style={styles.mainColumn}>
              <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.confirmHeader}>
                  <View style={[styles.confirmIconWrap, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
                    <Ionicons name="checkmark-circle" size={34} color={colors.success} />
                  </View>
                  <View style={styles.confirmHeaderText}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bilgileri kontrol et</Text>
                    <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>
                      Randevu kaydedilmeden önce son adımdasın.
                    </Text>
                  </View>
                </View>

                <View style={[styles.summaryBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <InfoLine icon="cut-outline" label="Berber" value={barber.name} colors={colors} />
                  <InfoLine icon="sparkles-outline" label="Hizmet" value={service.name} colors={colors} />
                  <InfoLine icon="wallet-outline" label="Ücret" value={`${service.price} TL`} colors={colors} accent />
                  <InfoLine icon="calendar-outline" label="Tarih" value={formatDateLabel(routeParams.date)} colors={colors} />
                  <InfoLine icon="time-outline" label="Saat" value={routeParams.time} colors={colors} last />
                </View>
              </View>
            </View>

            <View style={[styles.sideColumn, isWide && styles.sideColumnWide]}>
              <View style={[styles.sideCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={[styles.sideTitle, { color: colors.textPrimary }]}>Berber Bilgisi</Text>
                <InfoPill icon="location-outline" text={barber.locationLabel} colors={colors} />
                <InfoPill icon="star" text={`${barber.rating.toFixed(1)} puan · ${barber.reviewCount} yorum`} colors={colors} />
                <InfoPill icon="time-outline" text={`${barber.openingTime} - ${barber.closingTime}`} colors={colors} />
              </View>

              <Pressable
                style={[styles.confirmButton, { backgroundColor: colors.primary }, isSubmitting && styles.buttonDisabled]}
                disabled={isSubmitting}
                onPress={handleConfirm}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    <Text style={styles.confirmButtonText}>Randevuyu Onayla</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.cancelButton, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
                disabled={isSubmitting}
                onPress={() => navigation.goBack()}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Seçime Geri Dön</Text>
              </Pressable>

              <Text style={[styles.helpText, { color: colors.textMuted }]}>
                Onaydan sonra randevun Firebase veritabanına kaydedilir.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoLine({ icon, label, value, colors, accent = false, last = false }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
  accent?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.infoLine, { borderBottomColor: colors.divider }, last && styles.infoLineLast]}>
      <View style={styles.infoLineLeft}>
        <Ionicons name={icon} size={17} color={accent ? colors.secondary : colors.primary} />
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoValue, { color: accent ? colors.secondary : colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

function InfoPill({ icon, text, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[styles.infoPill, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={[styles.infoPillText, { color: colors.textSecondary }]}>{text}</Text>
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
    height: 300,
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
    right: 18
  },
  coverButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  coverButtonText: {
    fontWeight: "900",
    fontSize: 13
  },
  heroContent: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    maxWidth: 700
  },
  stepBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  stepBadgeText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 14
  },
  heroDescription: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8
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
    flex: 1
  },
  sideColumn: {
    gap: 14
  },
  sideColumnWide: {
    width: 330
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20
  },
  confirmHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18
  },
  confirmIconWrap: {
    width: 62,
    height: 62,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  confirmHeaderText: {
    flex: 1
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4
  },
  sectionCaption: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600"
  },
  summaryBox: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  infoLine: {
    borderBottomWidth: 1,
    paddingVertical: 15,
    gap: 10
  },
  infoLineLast: {
    borderBottomWidth: 0
  },
  infoLineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: "700"
  },
  infoValue: {
    fontSize: 17,
    fontWeight: "900"
  },
  sideCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20
  },
  sideTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 14
  },
  infoPill: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8
  },
  infoPillText: {
    flex: 1,
    fontWeight: "700",
    lineHeight: 19
  },
  confirmButton: {
    minHeight: 54,
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16
  },
  buttonDisabled: {
    opacity: 0.65
  },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15
  },
  cancelButtonText: {
    fontWeight: "900",
    fontSize: 15
  },
  helpText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
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
    marginBottom: 8,
    textAlign: "center"
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
