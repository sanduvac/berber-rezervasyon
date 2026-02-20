import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { Appointment } from "../types/appointment";
import { Barber, BarberCoordinates, BarberService } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";

type AppointmentDetailScreenProps = {
  appointment: Appointment;
  barber: Barber;
  service: BarberService;
  onBack: () => void;
  onCancel: () => void;
};

const MONTH_NAMES = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const WEEKDAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function parseDateTime(dateKey: string, time: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${WEEKDAY_NAMES[date.getDay()]}`;
}

function formatRemaining(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Geçti";
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} gün ${hours} saat`;
  if (hours > 0) return `${hours} saat ${minutes} dk`;
  return `${minutes} dakika`;
}

export function AppointmentDetailScreen({ appointment, barber, service, onBack, onCancel }: AppointmentDetailScreenProps) {
  const { colors, mode } = useTheme();
  const appointmentDate = parseDateTime(appointment.date, appointment.time);
  const remaining = formatRemaining(appointmentDate, new Date());

  const [showRoute, setShowRoute] = useState(false);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeCoords, setRouteCoords] = useState<BarberCoordinates[]>([]);
  const [userCoords, setUserCoords] = useState<BarberCoordinates | null>(null);
  const [routeError, setRouteError] = useState<string | null>(null);

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

    // Test konumu - MapScreen ile aynı
    const FORCE_TEST_LOCATION = true;
    const TEST_COORDS: BarberCoordinates = { latitude: 41.0082, longitude: 28.9784 };

    let currentLoc: BarberCoordinates;
    if (FORCE_TEST_LOCATION) {
      currentLoc = TEST_COORDS;
    } else {
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
    }

    setUserCoords(currentLoc);

    try {
      const originLng = currentLoc.longitude;
      const originLat = currentLoc.latitude;
      const destLng = barber.coordinates.longitude;
      const destLat = barber.coordinates.latitude;
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={onBack}>
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

        <Pressable style={styles.cancelButton} onPress={onCancel}>
          <Ionicons name="close-circle-outline" size={20} color="#ffffff" />
          <Text style={styles.cancelButtonText}>İptal Et</Text>
        </Pressable>
      </View>

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
  buttonsRow: { marginTop: 18, flexDirection: "row", gap: 12 },
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
  routeInfoText: { fontWeight: "600", fontSize: 13 }
});
