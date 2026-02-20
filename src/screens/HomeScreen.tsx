import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BarberCard } from "../components/BarberCard";
import { Barber } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";

type HomeScreenProps = {
  barbers: Barber[];
  onSelectBarber: (barber: Barber) => void;
  favoriteBarberIds: string[];
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

export function HomeScreen({
  barbers,
  onSelectBarber,
  favoriteBarberIds,
  onToggleFavorite
}: HomeScreenProps) {
  const { colors, mode } = useTheme();
  const [query, setQuery] = useState("");
  const now = new Date();
  const todayLabel = `${String(now.getDate()).padStart(2, "0")}.${String(now.getMonth() + 1).padStart(2, "0")}`;

  const filteredBarbers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) {
      return barbers;
    }

    return barbers.filter(
      (barber) =>
        barber.name.toLowerCase().includes(normalizedQuery) ||
        barber.locationLabel.toLowerCase().includes(normalizedQuery)
    );
  }, [barbers, query]);

  const openCount = useMemo(
    () => filteredBarbers.filter((barber) => isOpenNow(barber)).length,
    [filteredBarbers]
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
          <View style={[styles.totalBadge, {
            backgroundColor: mode === "dark" ? "rgba(108, 92, 231, 0.2)" : "rgba(255, 255, 255, 0.2)",
            borderColor: mode === "dark" ? "rgba(108, 92, 231, 0.3)" : "rgba(255, 255, 255, 0.3)"
          }]}>
            <Text style={[styles.totalBadgeText, { color: mode === "dark" ? "#C4B5FD" : "#ffffff" }]}>{filteredBarbers.length} berber</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>Tarzını bugün</Text>
        <Text style={[styles.heroTitleAccent, { color: mode === "dark" ? "#00D2FF" : "#E0F7FF" }]}>doğru koltukla buluştur.</Text>
        <Text style={[styles.heroSubtitle, { color: mode === "dark" ? "#8896AE" : "rgba(255, 255, 255, 0.75)" }]}>Mesafe, saat ve puan verileriyle hızlı karar ver.</Text>

        <View style={styles.statsRow}>
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
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder }]}>
        <View style={[styles.searchIconWrap, { backgroundColor: colors.primaryBg }]}>
          <Ionicons name="search" size={16} color={colors.primary} />
        </View>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Berber veya konum ara..."
          placeholderTextColor={colors.searchPlaceholder}
          style={[styles.searchInput, { color: colors.textPrimary }]}
        />
      </View>

      <View style={styles.chipRow}>
        <View style={[styles.chip, { backgroundColor: colors.chipBg, borderColor: colors.chipBorder }]}>
          <View style={styles.chipDot} />
          <Text style={[styles.chipText, { color: colors.chipText }]}>Bugün açık: {openCount}</Text>
        </View>
        <View style={[styles.chip, { backgroundColor: colors.chipBg, borderColor: colors.chipBorder }]}>
          <Ionicons name="star" size={11} color={colors.gold} />
          <Text style={[styles.chipText, { color: colors.chipText }]}>Ortalama: {averageRating}</Text>
        </View>
      </View>

      <FlatList
        data={filteredBarbers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BarberCard
            barber={item}
            onPress={onSelectBarber}
            isFavorite={favoriteBarberIds.includes(item.id)}
            onToggleFavorite={onToggleFavorite}
          />
        )}
        ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.textMuted }]}>Sonuç bulunamadı.</Text>}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
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
    borderRadius: 999,
    backgroundColor: "#34D399"
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
  }
});
