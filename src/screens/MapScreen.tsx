import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Callout, Marker } from "../components/MapWrapper";
import type { Region } from "../components/MapWrapper";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Barber, BarberCoordinates } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import type { RootTabParamList, HomeStackParamList } from "../types/navigation";

type MapNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, "MapTab">,
  NativeStackNavigationProp<HomeStackParamList>
>;

const DEFAULT_COORDS: BarberCoordinates = { latitude: 41.0082, longitude: 28.9784 };

export function MapScreen() {
  const navigation = useNavigation<MapNavProp>();
  const { barbers } = useApp();
  const { colors, mode } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [userCoordinates, setUserCoordinates] = useState<BarberCoordinates>(DEFAULT_COORDS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadLocation() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          if (active) {
            setUserCoordinates({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
          }
        }
      } catch {
        // Konum alınamazsa varsayılan koordinatları kullan
      } finally {
        if (active) setLoading(false);
      }
    }
    loadLocation();
    return () => { active = false; };
  }, []);

  const region: Region = useMemo(() => {
    if (barbers.length === 0) {
      return {
        latitude: userCoordinates.latitude,
        longitude: userCoordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
    }

    const allLats = [userCoordinates.latitude, ...barbers.map(b => b.coordinates.latitude)];
    const allLngs = [userCoordinates.longitude, ...barbers.map(b => b.coordinates.longitude)];
    const minLat = Math.min(...allLats);
    const maxLat = Math.max(...allLats);
    const minLng = Math.min(...allLngs);
    const maxLng = Math.max(...allLngs);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.02),
      longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.02),
    };
  }, [barbers, userCoordinates]);

  const isDark = mode === "dark";

  const heroStyle = isDark
    ? { backgroundColor: "rgba(18, 22, 45, 0.95)", borderColor: "rgba(108, 92, 231, 0.2)" }
    : { backgroundColor: "#6C5CE7", borderColor: "rgba(108, 92, 231, 0.3)" };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.headerCard, heroStyle]}>
        <View style={[styles.headerGlow, { backgroundColor: isDark ? "rgba(0, 210, 255, 0.08)" : "rgba(255, 255, 255, 0.1)" }]} />
        {navigation.canGoBack() && (
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={16} color="#ffffff" />
            <Text style={styles.backButtonText}>Geri</Text>
          </Pressable>
        )}
        <View style={styles.headerTitleRow}>
          <Ionicons name="map" size={24} color={isDark ? "#00D2FF" : "#ffffff"} />
          <Text style={styles.title}>Yakındakiler</Text>
        </View>
        <Text style={[styles.subtitle, { color: isDark ? "#8896AE" : "rgba(255, 255, 255, 0.8)" }]}>Sana en yakın berber kuaförlerini bul</Text>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, {
            backgroundColor: isDark ? colors.badgeBg : "rgba(255, 255, 255, 0.15)",
            borderColor: isDark ? colors.badgeBorder : "rgba(255, 255, 255, 0.25)"
          }]}>
            <Ionicons name="location" size={12} color={isDark ? colors.primary : "#ffffff"} />
            <Text style={[styles.badgeText, { color: isDark ? "#A5B4CB" : "#ffffff" }]}>{barbers.length} berber bulundu</Text>
          </View>
        </View>
      </View>

      {/* Harita */}
      <View style={[styles.mapWrapper, { borderColor: colors.cardBorder }]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Konum alınıyor...</Text>
          </View>
        ) : (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            showsUserLocation
            showsMyLocationButton
            showsCompass
          >
            {/* Berber Marker'ları */}
            {barbers.map((barber) => (
              <Marker
                key={barber.id}
                coordinate={barber.coordinates}
                title={barber.name}
                description={barber.locationLabel}
                pinColor="#6C5CE7"
              >
                <Callout tooltip onPress={() => navigation.navigate("HomeTab", { screen: "BarberDetail", params: { barberId: barber.id } })}>
                  <View style={styles.calloutContainer}>
                    {barber.coverImageUrl ? (
                      <Image source={{ uri: barber.coverImageUrl }} style={styles.calloutImage} />
                    ) : null}
                    <View style={styles.calloutInfo}>
                      <Text style={styles.calloutName} numberOfLines={1}>{barber.name}</Text>
                      <View style={styles.calloutRatingRow}>
                        <Ionicons name="star" size={12} color="#D97706" />
                        <Text style={styles.calloutRating}>{barber.rating.toFixed(1)}</Text>
                        <Text style={styles.calloutReviews}>({barber.reviewCount})</Text>
                      </View>
                      <Text style={styles.calloutLocation} numberOfLines={1}>
                        {barber.locationLabel}
                      </Text>
                      <Text style={styles.calloutHours}>
                        {barber.openingTime} - {barber.closingTime}
                      </Text>
                      <View style={styles.calloutButton}>
                        <Text style={styles.calloutButtonText}>Detaya Git →</Text>
                      </View>
                    </View>
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Konumuma git butonu */}
        {!loading && (
          <Pressable
            style={[styles.recenterButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
            onPress={() => {
              mapRef.current?.animateToRegion({
                latitude: userCoordinates.latitude,
                longitude: userCoordinates.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
              }, 500);
            }}
          >
            <Ionicons name="locate" size={20} color={colors.primary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: {
    borderRadius: 22, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 16,
    overflow: "hidden", marginBottom: 8
  },
  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, marginBottom: 12 },
  backButtonText: { fontWeight: "700", fontSize: 13, color: "#ffffff" },
  headerGlow: { position: "absolute", width: 160, height: 160, borderRadius: 999, top: -60, right: -30 },
  headerTitleRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  title: { color: "#ffffff", fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { marginTop: 4 },
  badgeRow: { marginTop: 12, flexDirection: "row", gap: 8 },
  badge: {
    flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 999,
    borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6
  },
  badgeText: { fontSize: 12, fontWeight: "600" },

  mapWrapper: {
    flex: 1, borderRadius: 20, overflow: "hidden", borderWidth: 1, marginBottom: 60
  },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 12
  },
  loadingText: { fontSize: 14, fontWeight: "600" },

  recenterButton: {
    position: "absolute", bottom: 16, right: 16,
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 1, alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 4
  },

  // Callout Styles
  calloutContainer: {
    backgroundColor: "#ffffff", borderRadius: 14, overflow: "hidden",
    width: 220, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 6
  },
  calloutImage: { width: 220, height: 100 },
  calloutInfo: { padding: 10 },
  calloutName: { fontSize: 15, fontWeight: "800", color: "#1E293B", marginBottom: 4 },
  calloutRatingRow: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 },
  calloutRating: { fontSize: 12, fontWeight: "700", color: "#D97706" },
  calloutReviews: { fontSize: 11, color: "#94A3B8" },
  calloutLocation: { fontSize: 12, color: "#64748B", marginBottom: 2 },
  calloutHours: { fontSize: 11, color: "#94A3B8", marginBottom: 8 },
  calloutButton: {
    backgroundColor: "#6C5CE7", borderRadius: 8, paddingVertical: 6,
    alignItems: "center"
  },
  calloutButtonText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
});
