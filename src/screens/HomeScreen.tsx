import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCopilot, CopilotStep, walkthroughable } from "react-native-copilot";
import { BarberCard } from "../components/BarberCard";
import { BarberCardSkeleton } from "../components/Skeleton";
import { Barber } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import type { HomeStackParamList } from "../types/navigation";
import { isOpenNow } from "../utils/dateUtils";
import { selectionHaptic } from "../utils/haptics";
import MapView, { Marker, Callout } from "../components/MapWrapper";
import { darkMapStyle } from "../theme/mapStyle";

const WalkthroughableView = walkthroughable(View);

type SortMode = "default" | "rating" | "distance" | "price";
type FilterMode = "all" | "open";

export function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { barbers, favoriteBarberIds, toggleFavorite, dataLoaded } = useApp();
  const { user } = useAuth();
  const { colors, mode } = useTheme();
  const { start, copilotEvents } = useCopilot();
  const [query, setQuery] = useState("");
  const [isMapView, setIsMapView] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>("default");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [clock, setClock] = useState(() => Date.now());

  // Gerçek zamanlı saat güncellemesi (1 dakikada bir)
  useEffect(() => {
    const intervalId = setInterval(() => setClock(Date.now()), 60000);
    return () => clearInterval(intervalId);
  }, []);

  const now = useMemo(() => new Date(clock), [clock]);
  const todayLabel = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}`;

  const tourStartedRef = useRef(false);

  function handleStartTour() {
    start();
  }

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function checkTour() {
        if (!user || tourStartedRef.current) return;
        const tourKey = `@hasSeenTour_${user.uid}`;
        const hasSeen = await AsyncStorage.getItem(tourKey);
        
        if (!hasSeen && isMounted && !tourStartedRef.current) {
          tourStartedRef.current = true;
          
          // Ekran tamamen odakta olduğu için kısa bir bekleme yeterli
          setTimeout(() => {
            if (isMounted) start();
          }, 800);
        }
      }
      
      checkTour();
      return () => {
        isMounted = false;
      };
    }, [user, start])
  );

  useEffect(() => {
    if (copilotEvents && user) {
      copilotEvents.on("stop", async () => {
        await AsyncStorage.setItem(`@hasSeenTour_${user.uid}`, "true");
      });
    }
    return () => {
      if (copilotEvents) copilotEvents.off("stop");
    };
  }, [copilotEvents, user]);

  const filteredBarbers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    let result = barbers;

    // Metin filtresi
    if (normalizedQuery) {
      result = result.filter(
        (barber) =>
          barber.name.toLowerCase().includes(normalizedQuery) ||
          barber.locationLabel.toLowerCase().includes(normalizedQuery)
      );
    }

    // Açık/kapalı filtresi
    if (filterMode === "open") {
      result = result.filter((barber) => isOpenNow(barber, now));
    }

    // Sıralama
    switch (sortMode) {
      case "rating":
        result = [...result].sort((a, b) => b.rating - a.rating);
        break;
      case "distance":
        result = [...result].sort((a, b) => a.distanceKm - b.distanceKm);
        break;
      case "price":
        result = [...result].sort((a, b) => {
          const minA = Math.min(...a.services.map(s => s.price));
          const minB = Math.min(...b.services.map(s => s.price));
          return minA - minB;
        });
        break;
      default:
        break;
    }

    return result;
  }, [barbers, query, filterMode, sortMode, now]);

  const openCount = useMemo(
    () => filteredBarbers.filter((barber) => isOpenNow(barber, now)).length,
    [filteredBarbers, now]
  );

  const nearestDistance = useMemo(() => {
    if (filteredBarbers.length === 0) {
      return "--";
    }

    return Math.min(...filteredBarbers.map((barber) => barber.distanceKm)).toFixed(1);
  }, [filteredBarbers]);

  const averageRating = useMemo(() => {
    if (filteredBarbers.length === 0) {
      return "--";
    }

    const total = filteredBarbers.reduce((sum, barber) => sum + barber.rating, 0);
    return (total / filteredBarbers.length).toFixed(1);
  }, [filteredBarbers]);

  const heroStyle = mode === "dark"
    ? { backgroundColor: "#111633", borderColor: "rgba(108, 92, 231, 0.2)" }
    : { backgroundColor: "#6C5CE7", borderColor: "rgba(108, 92, 231, 0.3)" };

  function handleSort(newMode: SortMode) {
    selectionHaptic();
    setSortMode(prev => prev === newMode ? "default" : newMode);
  }

  function handleFilter(newMode: FilterMode) {
    selectionHaptic();
    setFilterMode(prev => prev === newMode ? "all" : newMode);
  }

  async function onRefresh() {
    setRefreshing(true);
    setClock(Date.now());
    // Kısa bir gecikme ile yenileme hissi ver
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.hero, heroStyle]}>
        <View style={[styles.glowOne, { backgroundColor: colors.glowPrimary }]} />
        <View style={[styles.glowTwo, { backgroundColor: colors.glowSecondary }]} />
        <View style={[styles.glowThree, { backgroundColor: colors.glowTertiary }]} />
        <View style={[styles.glowFour, { backgroundColor: mode === "dark" ? "rgba(0, 210, 255, 0.08)" : "rgba(255, 255, 255, 0.1)" }]} />

        <View style={styles.heroTopRow}>
          <View style={[styles.locationBadge, {
            borderColor: mode === "dark" ? "rgba(0, 210, 255, 0.25)" : "rgba(255, 255, 255, 0.35)",
            backgroundColor: mode === "dark" ? "rgba(0, 210, 255, 0.08)" : "rgba(255, 255, 255, 0.15)"
          }]}>
            <Ionicons name="location" size={12} color={mode === "dark" ? "#00D2FF" : "#ffffff"} />
            <Text style={[styles.locationBadgeText, { color: mode === "dark" ? "#B8E8F7" : "#ffffff" }]}>İstanbul • {todayLabel}</Text>
          </View>
          
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable 
              onPress={handleStartTour}
              style={[styles.totalBadge, {
                backgroundColor: mode === "dark" ? "rgba(255, 152, 0, 0.2)" : "rgba(255, 152, 0, 0.2)",
                borderColor: mode === "dark" ? "rgba(255, 152, 0, 0.4)" : "rgba(255, 152, 0, 0.4)",
                paddingHorizontal: 8
              }]}
            >
              <Ionicons name="help-circle" size={16} color={mode === "dark" ? "#FDBA74" : "#EA580C"} />
              <Text style={[styles.totalBadgeText, { color: mode === "dark" ? "#FDBA74" : "#EA580C", marginLeft: 4 }]}>Rehber</Text>
            </Pressable>

            <View style={[styles.totalBadge, {
              backgroundColor: mode === "dark" ? "rgba(108, 92, 231, 0.2)" : "rgba(255, 255, 255, 0.2)",
              borderColor: mode === "dark" ? "rgba(108, 92, 231, 0.3)" : "rgba(255, 255, 255, 0.3)"
            }]}>
              <Text style={[styles.totalBadgeText, { color: mode === "dark" ? "#C4B5FD" : "#ffffff" }]}>{filteredBarbers.length} berber</Text>
            </View>
          </View>
        </View>

        <Text style={styles.heroTitle}>Tarzını bugün</Text>
        <Text style={[styles.heroTitleAccent, { color: mode === "dark" ? "#00D2FF" : "#E0F7FF" }]}>doğru koltukla buluştur.</Text>
        <Text style={[styles.heroSubtitle, { color: mode === "dark" ? "#8896AE" : "rgba(255, 255, 255, 0.75)" }]}>Mesafe, saat ve puan verileriyle hızlı karar ver.</Text>

        <CopilotStep text="En yakın mesafedeki veya en yüksek puanlı açık berberlerin özetini buradan takip edebilirsiniz." order={1} name="stats">
          <WalkthroughableView style={styles.statsRow}>
            <View style={[styles.statCard, {
              backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.18)",
              borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.25)"
            }]}>
              <Text style={styles.statValue}>{openCount}</Text>
              <Text style={[styles.statLabel, { color: mode === "dark" ? "#7B8CA6" : "rgba(255, 255, 255, 0.7)" }]}>şu an açık</Text>
            </View>
            <View style={[styles.statCard, {
              backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.18)",
              borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.25)"
            }]}>
              <Text style={styles.statValue}>{nearestDistance}</Text>
              <Text style={[styles.statLabel, { color: mode === "dark" ? "#7B8CA6" : "rgba(255, 255, 255, 0.7)" }]}>en yakın km</Text>
            </View>
            <View style={[styles.statCard, {
              backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.06)" : "rgba(255, 255, 255, 0.18)",
              borderColor: mode === "dark" ? "rgba(255, 255, 255, 0.08)" : "rgba(255, 255, 255, 0.25)"
            }]}>
              <Text style={styles.statValue}>{averageRating}</Text>
              <Text style={[styles.statLabel, { color: mode === "dark" ? "#7B8CA6" : "rgba(255, 255, 255, 0.7)" }]}>ortalama puan</Text>
            </View>
          </WalkthroughableView>
        </CopilotStep>
      </View>

      <CopilotStep text="İstediğiniz berberin adını veya konumunu buradan hızlıca arayabilirsiniz." order={2} name="search">
        <WalkthroughableView style={[styles.searchWrap, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder, flexDirection: "row", alignItems: "center" }]}>
          <View style={[styles.searchIconWrap, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="search" size={16} color={colors.primary} />
          </View>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Berber veya konum ara..."
            placeholderTextColor={colors.searchPlaceholder}
            style={[styles.searchInput, { color: colors.textPrimary, flex: 1 }]}
          />
          {Platform.OS !== "web" && (
            <Pressable 
              onPress={() => { selectionHaptic(); setIsMapView(!isMapView); }}
              style={[styles.mapToggleBtn, { backgroundColor: isMapView ? colors.primary : "transparent" }]}
            >
              <Ionicons name={isMapView ? "list" : "map"} size={20} color={isMapView ? "#fff" : colors.textMuted} />
            </Pressable>
          )}
        </WalkthroughableView>
      </CopilotStep>

      {/* Filtreler ve Sıralama */}
      <View style={styles.chipRow}>
        <Pressable
          style={[styles.chip, {
            backgroundColor: filterMode === "open" ? colors.primaryBg : colors.chipBg,
            borderColor: filterMode === "open" ? colors.primary : colors.chipBorder
          }]}
          onPress={() => handleFilter("open")}
        >
          <View style={[styles.chipDot, { backgroundColor: filterMode === "open" ? colors.primary : "#34D399" }]} />
          <Text style={[styles.chipText, { color: filterMode === "open" ? colors.primary : colors.chipText }]}>Açık: {openCount}</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, {
            backgroundColor: sortMode === "rating" ? colors.primaryBg : colors.chipBg,
            borderColor: sortMode === "rating" ? colors.primary : colors.chipBorder
          }]}
          onPress={() => handleSort("rating")}
        >
          <Ionicons name="star" size={11} color={sortMode === "rating" ? colors.primary : colors.gold} />
          <Text style={[styles.chipText, { color: sortMode === "rating" ? colors.primary : colors.chipText }]}>Puan</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, {
            backgroundColor: sortMode === "distance" ? colors.primaryBg : colors.chipBg,
            borderColor: sortMode === "distance" ? colors.primary : colors.chipBorder
          }]}
          onPress={() => handleSort("distance")}
        >
          <Ionicons name="navigate" size={11} color={sortMode === "distance" ? colors.primary : colors.textMuted} />
          <Text style={[styles.chipText, { color: sortMode === "distance" ? colors.primary : colors.chipText }]}>Mesafe</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, {
            backgroundColor: sortMode === "price" ? colors.primaryBg : colors.chipBg,
            borderColor: sortMode === "price" ? colors.primary : colors.chipBorder
          }]}
          onPress={() => handleSort("price")}
        >
          <Ionicons name="wallet" size={11} color={sortMode === "price" ? colors.primary : colors.textMuted} />
          <Text style={[styles.chipText, { color: sortMode === "price" ? colors.primary : colors.chipText }]}>Fiyat</Text>
        </Pressable>
      </View>

      <CopilotStep text="Buradan berberleri inceleyebilir, favorilere ekleyebilir veya tıklayıp hemen randevu oluşturabilirsiniz." order={3} name="list">
        <WalkthroughableView style={{ flex: 1, overflow: "hidden", borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          {isMapView ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: 40.9908,
                longitude: 29.0280,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              customMapStyle={mode === "dark" ? darkMapStyle : []}
              showsUserLocation={true}
            >
              {filteredBarbers.map((barber) => (
                <Marker
                  key={barber.id}
                  coordinate={barber.coordinates}
                >
                  <View style={[styles.mapMarker, { backgroundColor: colors.primary, borderColor: colors.primaryBg }]}>
                    <Ionicons name="cut" size={16} color="#fff" />
                  </View>
                  <Callout tooltip onPress={() => navigation.navigate("BarberDetail", { barberId: barber.id })}>
                    <View style={[styles.calloutContainer, { backgroundColor: mode === "dark" ? "#1F2335" : "#fff" }]}>
                      <Text style={[styles.calloutTitle, { color: mode === "dark" ? "#fff" : "#000" }]}>{barber.name}</Text>
                      <View style={styles.calloutRow}>
                        <Ionicons name="star" size={12} color={colors.gold} />
                        <Text style={[styles.calloutRating, { color: mode === "dark" ? "#B8E8F7" : "#555" }]}>{barber.rating}</Text>
                      </View>
                      <Text style={styles.calloutLink}>Detayları Gör →</Text>
                    </View>
                  </Callout>
                </Marker>
              ))}
            </MapView>
          ) : (
            <FlatList
              data={!dataLoaded ? [] : filteredBarbers}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  tintColor={colors.primary}
                  colors={[colors.primary]}
                />
              }
              renderItem={({ item }) => (
                <BarberCard
                  barber={item}
                  onPress={(barber) => navigation.navigate("BarberDetail", { barberId: barber.id })}
                  isFavorite={favoriteBarberIds.includes(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
              )}
              ListEmptyComponent={
                !dataLoaded ? (
                  <View>
                    <BarberCardSkeleton />
                    <BarberCardSkeleton />
                    <BarberCardSkeleton />
                  </View>
                ) : (
                  <Text style={[styles.emptyText, { color: colors.textMuted }]}>Sonuç bulunamadı.</Text>
                )
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
            />
          )}
        </WalkthroughableView>
      </CopilotStep>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  hero: {
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 20,
    marginBottom: 0,
    overflow: "hidden",
    borderWidth: 1
  },
  glowOne: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    top: -90,
    right: -50
  },
  glowTwo: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 999,
    bottom: -60,
    left: -35
  },
  glowThree: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 20,
    right: 30,
    top: 80,
    transform: [{ rotate: "20deg" }]
  },
  glowFour: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 999,
    left: 60,
    top: 30
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1
  },
  locationBadgeText: {
    fontSize: 12,
    fontWeight: "600"
  },
  totalBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1
  },
  totalBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.3
  },
  heroTitleAccent: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20
  },
  statsRow: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1
  },
  statValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  statLabel: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "500"
  },
  mapToggleBtn: {
    padding: 8,
    borderRadius: 12,
    marginLeft: 8,
    marginRight: 4,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    marginTop: 10,
    marginBottom: 12,
    marginHorizontal: 2,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4
  },
  searchIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    paddingLeft: 10,
    fontSize: 14
  },
  chipRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 2
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 999
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600"
  },
  listContent: {
    paddingBottom: 80
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 14
  },
  mapMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 8,
  },
  calloutContainer: {
    width: 160,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    marginBottom: 8,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
    textAlign: "center",
  },
  calloutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  calloutRating: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  calloutLink: {
    fontSize: 12,
    color: "#00D2FF",
    fontWeight: "600",
  }
});
