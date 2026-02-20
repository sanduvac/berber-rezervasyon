import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { Barber, BarberCoordinates } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";

type MapScreenProps = {
  barbers: Barber[];
  onOpenBarber: (barberId: string) => void;
};

type LocationState = "checking" | "granted" | "denied";

const DEFAULT_REGION: Region = { latitude: 41.0151, longitude: 28.9795, latitudeDelta: 0.09, longitudeDelta: 0.09 };
const FORCE_ISTANBUL_TEST_LOCATION = true;
const ISTANBUL_TEST_COORDINATES: BarberCoordinates = { latitude: 41.0082, longitude: 28.9784 };

function toRegion(coordinates: BarberCoordinates): Region {
  return { latitude: coordinates.latitude, longitude: coordinates.longitude, latitudeDelta: 0.07, longitudeDelta: 0.07 };
}

export function MapScreen({ barbers, onOpenBarber }: MapScreenProps) {
  const { colors, mode } = useTheme();
  const [locationState, setLocationState] = useState<LocationState>("checking");
  const [userCoordinates, setUserCoordinates] = useState<BarberCoordinates | null>(null);

  useEffect(() => {
    let active = true;
    async function loadLocation() {
      if (FORCE_ISTANBUL_TEST_LOCATION) { setLocationState("granted"); setUserCoordinates(ISTANBUL_TEST_COORDINATES); return; }
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        if (permission.status !== "granted") { setLocationState("denied"); return; }
        setLocationState("granted");
        const currentPosition = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (!active) return;
        setUserCoordinates({ latitude: currentPosition.coords.latitude, longitude: currentPosition.coords.longitude });
      } catch (_error) { if (active) setLocationState("denied"); }
    }
    loadLocation();
    return () => { active = false; };
  }, []);

  const initialRegion = useMemo(() => {
    if (userCoordinates) return toRegion(userCoordinates);
    if (barbers.length > 0) return toRegion(barbers[0].coordinates);
    return DEFAULT_REGION;
  }, [barbers, userCoordinates]);

  const heroStyle = mode === "dark"
    ? { backgroundColor: "rgba(18, 22, 45, 0.95)", borderColor: "rgba(108, 92, 231, 0.2)" }
    : { backgroundColor: "#6C5CE7", borderColor: "rgba(108, 92, 231, 0.3)" };

  return (
    <View style={styles.container}>
      <View style={[styles.headerCard, heroStyle]}>
        <View style={[styles.headerGlow, { backgroundColor: mode === "dark" ? "rgba(0, 210, 255, 0.08)" : "rgba(255, 255, 255, 0.1)" }]} />
        <View style={styles.headerTitleRow}>
          <Ionicons name="map" size={24} color={mode === "dark" ? "#00D2FF" : "#ffffff"} />
          <Text style={styles.title}>Harita</Text>
        </View>
        <Text style={[styles.subtitle, { color: mode === "dark" ? "#8896AE" : "rgba(255, 255, 255, 0.8)" }]}>Bulunduğun konum ve berber noktalarını canlı gör.</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, {
            backgroundColor: mode === "dark" ? colors.badgeBg : "rgba(255, 255, 255, 0.15)",
            borderColor: mode === "dark" ? colors.badgeBorder : "rgba(255, 255, 255, 0.25)"
          }]}>
            <Ionicons name="location" size={12} color={mode === "dark" ? colors.primary : "#ffffff"} />
            <Text style={[styles.badgeText, { color: mode === "dark" ? "#A5B4CB" : "#ffffff" }]}>{barbers.length} berber noktası</Text>
          </View>
        </View>
      </View>

      <View style={[styles.mapWrap, { borderColor: colors.cardBorder }]}>
        <MapView key={userCoordinates ? "with-user" : "without-user"} style={styles.map} initialRegion={initialRegion} showsCompass showsScale>
          {barbers.map((barber) => (
            <Marker key={barber.id} coordinate={barber.coordinates} title={barber.name} description={barber.locationLabel}
              pinColor="#6C5CE7" onCalloutPress={() => onOpenBarber(barber.id)}
            >
              <Callout>
                <View style={styles.callout}>
                  <View style={styles.calloutTitleRow}>
                    <Text style={styles.calloutTitle}>{barber.name}</Text>
                    <View style={styles.ratingBadge}>
                      <Ionicons name="star" size={10} color="#D97706" />
                      <Text style={styles.ratingBadgeText}>{barber.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <Text style={styles.calloutSubtitle}>{barber.locationLabel}</Text>
                  <Text style={styles.calloutHours}>Saatler: {barber.openingTime} - {barber.closingTime}</Text>
                  <Text style={styles.calloutHint}>Detaya git →</Text>
                </View>
              </Callout>
            </Marker>
          ))}
          {userCoordinates ? <Marker coordinate={userCoordinates} title="Konumun" description="Buradasın" pinColor="#00D2FF" /> : null}
        </MapView>

        {locationState === "checking" ? (
          <View style={[styles.overlay, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={[styles.overlayText, { color: colors.primaryMuted }]}>Konum alınıyor...</Text>
          </View>
        ) : null}

        {locationState === "denied" ? (
          <View style={[styles.deniedBanner, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Ionicons name="warning-outline" size={16} color={colors.gold} />
            <Text style={[styles.deniedText, { color: colors.textSecondary }]}>Konum izni kapalı. Sadece berber noktaları gösteriliyor.</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: { borderRadius: 22, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 16, marginBottom: 12, overflow: "hidden" },
  headerGlow: { position: "absolute", width: 160, height: 160, borderRadius: 999, top: -60, right: -30 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { marginTop: 4 },
  badgeRow: { marginTop: 12, flexDirection: "row", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  badgeText: { fontSize: 12, fontWeight: "600" },
  mapWrap: { flex: 1, borderRadius: 22, overflow: "hidden", borderWidth: 1 },
  map: { flex: 1 },
  callout: { width: 220 },
  calloutTitleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  calloutTitle: { color: "#182a3b", fontWeight: "700", fontSize: 14, flex: 1 },
  ratingBadge: { flexDirection: "row", alignItems: "center", gap: 3, borderRadius: 999, backgroundColor: "#FFF8E1", borderWidth: 1, borderColor: "#f5d98d", paddingHorizontal: 8, paddingVertical: 3 },
  ratingBadgeText: { color: "#8a5a00", fontSize: 12, fontWeight: "700" },
  calloutSubtitle: { color: "#4f6173", marginTop: 4 },
  calloutHours: { color: "#37516a", marginTop: 4, fontSize: 12.5, fontWeight: "600" },
  calloutHint: { marginTop: 6, color: "#6C5CE7", fontWeight: "700" },
  overlay: { position: "absolute", top: 10, left: 10, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 8 },
  overlayText: { fontWeight: "600" },
  deniedBanner: { position: "absolute", bottom: 12, left: 10, right: 10, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row", alignItems: "center", gap: 8 },
  deniedText: { fontSize: 12.5, flex: 1 }
});
