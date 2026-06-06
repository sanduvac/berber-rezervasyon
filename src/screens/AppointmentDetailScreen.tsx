import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import MapView, { Marker, Polyline } from "../components/MapWrapper";
import type { Region } from "../components/MapWrapper";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { BarberCoordinates } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import type { AppointmentsStackParamList } from "../types/navigation";
import { formatDateLabel, formatRemainingLong, parseDateTime } from "../utils/dateUtils";
import { mediumHaptic, errorHaptic } from "../utils/haptics";

export function AppointmentDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppointmentsStackParamList>>();
  const route = useRoute<RouteProp<AppointmentsStackParamList, "AppointmentDetail">>();
  const { getAppointment, getBarber, getService, cancelAppointment, showSuccessToast, submitReview } = useApp();
  const { colors, mode } = useTheme();

  const appointment = getAppointment(route.params.appointmentId);
  const barber = appointment ? getBarber(appointment.barberId) : undefined;
  const service = barber && appointment ? getService(appointment.barberId, appointment.serviceId) : undefined;

  const [showRoute, setShowRoute] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState<BarberCoordinates[]>([]);
  const [userCoords, setUserCoords] = useState<BarberCoordinates | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

  // Değerlendirme state'leri
  const [showReview, setShowReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  if (!appointment || !barber || !service) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Ionicons name="calendar-clear-outline" size={44} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Randevu detayı bulunamadı</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Bu randevu silinmiş olabilir ya da bağlı berber/hizmet bilgisi yüklenemedi.
          </Text>
          <Pressable style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={styles.emptyButtonText}>Randevulara Dön</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const appointmentDate = parseDateTime(appointment.date, appointment.time);
  const remaining = formatRemainingLong(appointmentDate, new Date());
  const isPast = appointmentDate.getTime() <= Date.now();

  const secondaryBadgeBg = mode === "dark" ? "rgba(0, 210, 255, 0.1)" : "rgba(8, 145, 178, 0.08)";
  const secondaryBadgeBorder = mode === "dark" ? "rgba(0, 210, 255, 0.2)" : "rgba(8, 145, 178, 0.2)";

  async function handleOpenRoute() {
    if (showRoute) {
      setShowRoute(false);
      return;
    }
    setShowRoute(true);
    setRouteLoading(true);
    setRouteError(null);

    const TEST_COORDS: BarberCoordinates = { latitude: 41.0082, longitude: 28.9784 };

    let currentLoc: BarberCoordinates;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        currentLoc = TEST_COORDS;
      } else {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        currentLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }
    } catch (_e) {
      currentLoc = TEST_COORDS;
    }

    setUserCoords(currentLoc);

    try {
      const originLng = currentLoc.longitude;
      const originLat = currentLoc.latitude;
      const destLng = barber!.coordinates.longitude;
      const destLat = barber!.coordinates.latitude;
      const url = `https://router.project-osrm.org/route/v1/driving/${originLng},${originLat};${destLng},${destLat}?overview=full&geometries=geojson`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.code === "Ok" && data.routes && data.routes.length > 0) {
        const coords: BarberCoordinates[] = data.routes[0].geometry.coordinates.map((c: number[]) => ({
          latitude: c[1],
          longitude: c[0]
        }));
        setRouteCoords(coords);
      } else {
        setRouteError("Rota bulunamadı");
      }
    } catch (_error) {
      setRouteError("Rota hesaplanırken hata oluştu");
    } finally {
      setRouteLoading(false);
    }
  }

  const mapRegion: Region | undefined = userCoords ? {
    latitude: (userCoords.latitude + barber.coordinates.latitude) / 2,
    longitude: (userCoords.longitude + barber.coordinates.longitude) / 2,
    latitudeDelta: Math.abs(userCoords.latitude - barber.coordinates.latitude) * 1.8 + 0.01,
    longitudeDelta: Math.abs(userCoords.longitude - barber.coordinates.longitude) * 1.8 + 0.01,
  } : {
    latitude: barber.coordinates.latitude,
    longitude: barber.coordinates.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  function handleCancel() {
    Alert.alert("Randevu İptali", "Bu randevuyu iptal etmek istiyor musun?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "İptal Et",
        style: "destructive",
        onPress: async () => {
          errorHaptic();
          await cancelAppointment(appointment!);
          navigation.goBack();
          showSuccessToast("Randevu iptal edildi.");
        }
      }
    ]);
  }

  function handleRebook() {
    mediumHaptic();
    // @ts-ignore — cross-tab navigation
    navigation.getParent()?.navigate("HomeTab", {
      screen: "AppointmentSelection",
      params: { barberId: barber!.id, serviceId: service!.id }
    });
  }

  async function handleSubmitReview() {
    if (!reviewComment.trim()) {
      Alert.alert("Uyarı", "Lütfen bir yorum yazın.");
      return;
    }
    setReviewLoading(true);
    try {
      await submitReview({
        barberId: barber!.id,
        appointmentId: appointment!.id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      setShowReview(false);
    } catch (err) {
      Alert.alert("Hata", "Değerlendirme gönderilemedi.");
    } finally {
      setReviewLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
        <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.textPrimary }]}>Randevu Detayı</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Randevu bilgilerini buradan takip edebilirsin.</Text>

      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={[styles.remainingBadge, { backgroundColor: secondaryBadgeBg, borderColor: secondaryBadgeBorder }]}>
          <Ionicons name="timer-outline" size={14} color={colors.secondary} />
          <Text style={[styles.remainingBadgeText, { color: colors.secondary }]}>Kalan: {remaining}</Text>
        </View>
        <Text style={[styles.barberName, { color: colors.textPrimary }]}>{barber.name}</Text>
        <View style={styles.infoRow}><Ionicons name="cut-outline" size={14} color={colors.primary} /><Text style={[styles.infoText, { color: colors.textSecondary }]}>Hizmet: {service.name}</Text></View>
        <View style={styles.infoRow}><Ionicons name="wallet-outline" size={14} color={colors.primary} /><Text style={[styles.infoText, { color: colors.textSecondary }]}>Ücret: {service.price} TL</Text></View>
        <View style={styles.infoRow}><Ionicons name="calendar-outline" size={14} color={colors.primary} /><Text style={[styles.infoText, { color: colors.textSecondary }]}>Tarih: {formatDateLabel(appointment.date)}</Text></View>
        <View style={styles.infoRow}><Ionicons name="time-outline" size={14} color={colors.primary} /><Text style={[styles.infoText, { color: colors.textSecondary }]}>Saat: {appointment.time}</Text></View>
        <View style={styles.infoRow}><Ionicons name="location-outline" size={14} color={colors.primary} /><Text style={[styles.infoText, { color: colors.textSecondary }]}>Konum: {barber.locationLabel}</Text></View>
      </View>

      <View style={styles.buttonsRow}>
        <Pressable
          style={[styles.directionsButton, { backgroundColor: showRoute ? colors.secondary : colors.primary }]}
          onPress={handleOpenRoute}
        >
          <Ionicons name={showRoute ? "close-circle" : "navigate-circle"} size={20} color="#ffffff" />
          <Text style={styles.directionsButtonText}>{showRoute ? "Haritayı Kapat" : "Yol Tarifi Al"}</Text>
        </Pressable>

        <Pressable style={styles.cancelButton} onPress={handleCancel}>
          <Ionicons name="close-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.cancelButtonText}>İptal Et</Text>
        </Pressable>
      </View>

      {/* Tekrar Randevu Al & Değerlendir */}
      <View style={styles.buttonsRow}>
        <Pressable
          style={[styles.rebookButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}
          onPress={handleRebook}
        >
          <Ionicons name="refresh" size={18} color={colors.primary} />
          <Text style={[styles.rebookButtonText, { color: colors.primary }]}>Tekrar Randevu Al</Text>
        </Pressable>

        {isPast && appointment.status !== "completed" && (
          <Pressable
            style={[styles.reviewButton, { backgroundColor: mode === "dark" ? "rgba(255, 215, 0, 0.1)" : "rgba(217, 119, 6, 0.08)", borderColor: mode === "dark" ? "rgba(255, 215, 0, 0.25)" : "rgba(217, 119, 6, 0.2)" }]}
            onPress={() => { mediumHaptic(); setShowReview(!showReview); }}
          >
            <Ionicons name="star" size={18} color={colors.gold} />
            <Text style={[styles.reviewButtonText, { color: colors.gold }]}>Değerlendir</Text>
          </Pressable>
        )}
      </View>

      {/* Değerlendirme Formu */}
      {showReview && (
        <View style={[styles.reviewCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Text style={[styles.reviewTitle, { color: colors.textPrimary }]}>Deneyimini Paylaş</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setReviewRating(star)}>
                <Ionicons
                  name={star <= reviewRating ? "star" : "star-outline"}
                  size={32}
                  color={star <= reviewRating ? colors.gold : colors.textMuted}
                />
              </Pressable>
            ))}
          </View>
          <TextInput
            style={[styles.reviewInput, { color: colors.textPrimary, backgroundColor: colors.searchBg, borderColor: colors.searchBorder }]}
            placeholder="Yorumunuzu yazın..."
            placeholderTextColor={colors.textMuted}
            value={reviewComment}
            onChangeText={setReviewComment}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            keyboardAppearance={mode}
          />
          <Pressable
            style={[styles.submitReviewButton, { opacity: reviewLoading ? 0.6 : 1 }]}
            onPress={handleSubmitReview}
            disabled={reviewLoading}
          >
            {reviewLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={16} color="#fff" />
                <Text style={styles.submitReviewText}>Gönder</Text>
              </>
            )}
          </Pressable>
        </View>
      )}

      {showRoute && (
        <View style={[styles.mapContainer, { borderColor: colors.cardBorder }]}>
          {routeLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Rota hesaplanıyor...</Text>
            </View>
          )}

          {routeError && (
            <View style={[styles.errorBanner, { backgroundColor: colors.cardBg }]}>
              <Ionicons name="warning-outline" size={16} color={colors.gold} />
              <Text style={[styles.errorText, { color: colors.textSecondary }]}>{routeError}</Text>
            </View>
          )}

          <MapView
            style={styles.map}
            region={mapRegion}
            showsUserLocation={false}
            showsCompass
          >
            {userCoords && (
              <Marker coordinate={userCoords} title="Konumun" pinColor="#00D2FF" />
            )}
            <Marker coordinate={barber.coordinates} title={barber.name} description={barber.locationLabel} pinColor="#6C5CE7" />

            {routeCoords.length > 0 && (
              <Polyline
                coordinates={routeCoords}
                strokeColor="#6C5CE7"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
            )}
          </MapView>

          {routeCoords.length > 0 && !routeLoading && (
            <View style={[styles.routeInfoBar, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Ionicons name="car" size={16} color={colors.primary} />
              <Text style={[styles.routeInfoText, { color: colors.textPrimary }]}>
                Araç ile yol tarifi gösteriliyor
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 12 },
  backButtonText: { fontWeight: "700" },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { marginTop: 6 },
  card: { marginTop: 16, borderRadius: 20, borderWidth: 1, padding: 16 },
  remainingBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12 },
  remainingBadgeText: { fontSize: 13, fontWeight: "700" },
  barberName: { fontSize: 20, fontWeight: "800", marginBottom: 8, letterSpacing: -0.2 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  infoText: { fontSize: 14 },
  buttonsRow: { marginTop: 12, flexDirection: "row", gap: 12 },
  directionsButton: {
    flex: 1, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingVertical: 14,
    flexDirection: "row", gap: 8,
    shadowColor: "#6C5CE7", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6
  },
  directionsButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  cancelButton: {
    flex: 1, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingVertical: 14,
    backgroundColor: "#EF4444", flexDirection: "row", gap: 8,
    shadowColor: "#EF4444", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6
  },
  cancelButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  rebookButton: {
    flex: 1, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingVertical: 14,
    flexDirection: "row", gap: 8, borderWidth: 1
  },
  rebookButtonText: { fontWeight: "800", fontSize: 14 },
  reviewButton: {
    flex: 1, borderRadius: 16, alignItems: "center", justifyContent: "center", paddingVertical: 14,
    flexDirection: "row", gap: 8, borderWidth: 1
  },
  reviewButtonText: { fontWeight: "800", fontSize: 14 },
  reviewCard: {
    marginTop: 16, borderRadius: 20, borderWidth: 1, padding: 18
  },
  reviewTitle: { fontSize: 18, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  starsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 16 },
  reviewInput: {
    borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 15, minHeight: 80, marginBottom: 12
  },
  submitReviewButton: {
    backgroundColor: "#6C5CE7", borderRadius: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    shadowColor: "#6C5CE7", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6
  },
  submitReviewText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  mapContainer: {
    marginTop: 16, borderRadius: 20, overflow: "hidden", borderWidth: 1, height: 350
  },
  map: { flex: 1 },
  loadingOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)", zIndex: 10,
    alignItems: "center", justifyContent: "center"
  },
  loadingText: { marginTop: 10, fontSize: 14, fontWeight: "600" },
  errorBanner: {
    position: "absolute", top: 10, left: 10, right: 10, zIndex: 10,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8
  },
  errorText: { fontSize: 13, flex: 1 },
  routeInfoBar: {
    position: "absolute", bottom: 10, left: 10, right: 10,
    borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8
  },
  routeInfoText: { fontWeight: "600", fontSize: 13 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyCard: { width: "100%", maxWidth: 440, borderWidth: 1, borderRadius: 24, padding: 28, alignItems: "center" },
  emptyTitle: { fontSize: 22, fontWeight: "900", marginTop: 14, marginBottom: 8, textAlign: "center" },
  emptyText: { textAlign: "center", lineHeight: 22, marginBottom: 18 },
  emptyButton: { borderRadius: 999, paddingHorizontal: 22, paddingVertical: 12 },
  emptyButtonText: { color: "#FFFFFF", fontWeight: "900" }
});
