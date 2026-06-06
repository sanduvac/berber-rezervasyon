import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Platform, useWindowDimensions, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { WebNavbar } from "../../components/web/WebNavbar";

export function WebLandingScreen({ navigation }: any) {
  const { colors, mode } = useTheme();
  const { barbers } = useApp();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [searchText, setSearchText] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  const filteredBarbers = useMemo(() => {
    const normalizedSearch = activeSearch.trim().toLocaleLowerCase("tr-TR");
    if (!normalizedSearch) return barbers;

    return barbers.filter((barber) => {
      const searchableText = [
        barber.name,
        barber.locationLabel,
        barber.description,
        ...barber.services.map((service) => service.name)
      ].join(" ").toLocaleLowerCase("tr-TR");

      return searchableText.includes(normalizedSearch);
    });
  }, [activeSearch, barbers]);

  function handleSearch() {
    setActiveSearch(searchText.trim());
  }

  function clearSearch() {
    setSearchText("");
    setActiveSearch("");
  }

  function handleOpenBarber(barber: (typeof barbers)[number]) {
    if (!user) {
      navigation.navigate("WebAuthRequired", { barberName: barber.name });
      return;
    }

    navigation.navigate("WebBarberDetail", { barberId: barber.id });
  }

  // Grid kolon sayısı hesaplama
  let numColumns = 1;
  if (width > 1200) numColumns = 4;
  else if (width > 900) numColumns = 3;
  else if (width > 600) numColumns = 2;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Üst Menü */}
      <WebNavbar />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Hero Section */}
        <View style={[styles.heroSection, { backgroundColor: mode === "dark" ? "#1A1B23" : "#F8FAFC" }]}>
          <View style={styles.heroInner}>
            <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>
              Tarzını Keşfet,{"\n"}Hemen <Text style={{ color: colors.primary }}>Randevu Al</Text>
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
              Şehrindeki en iyi berberleri bul. Yorumları oku, hizmetleri incele ve saniyeler içinde yerini ayırt.
            </Text>

            <View style={[styles.searchBox, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Ionicons name="search" size={24} color={colors.textMuted} />
              <TextInput 
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Berber adı, hizmet veya konum ara..."
                placeholderTextColor={colors.textMuted}
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
              />
              <Pressable style={[styles.searchBtn, { backgroundColor: colors.primary }]} onPress={handleSearch}>
                <Text style={styles.searchBtnText}>Ara</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Berberler Grid Section */}
        <View style={styles.listSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                {activeSearch ? "Arama Sonuçları" : "Önerilen Berberler"}
              </Text>
              {activeSearch ? (
                <Text style={[styles.searchSummary, { color: colors.textSecondary }]}>
                  “{activeSearch}” için {filteredBarbers.length} sonuç bulundu.
                </Text>
              ) : null}
            </View>

            {activeSearch ? (
              <Pressable style={[styles.clearSearchBtn, { borderColor: colors.cardBorder }]} onPress={clearSearch}>
                <Ionicons name="close" size={16} color={colors.textSecondary} />
                <Text style={[styles.clearSearchText, { color: colors.textSecondary }]}>Temizle</Text>
              </Pressable>
            ) : null}
          </View>
          
          {filteredBarbers.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <Ionicons name="search-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Sonuç bulunamadı</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Berber adı, hizmet veya konum için farklı bir kelime deneyin.
              </Text>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {filteredBarbers.map((barber) => (
              <View 
                key={barber.id} 
                style={[
                  styles.gridItem, 
                  { 
                    width: `${100 / numColumns}%`, 
                    paddingHorizontal: 10,
                    marginBottom: 20
                  }
                ]}
              >
                <Pressable 
                  style={[styles.barberCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
                  onPress={() => handleOpenBarber(barber)}
                >
                  <Image source={{ uri: barber.coverImageUrl }} style={styles.barberImage} />
                  <View style={styles.barberInfo}>
                    <Text style={[styles.barberName, { color: colors.textPrimary }]} numberOfLines={1}>{barber.name}</Text>
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color={colors.gold} />
                      <Text style={[styles.ratingText, { color: colors.textPrimary }]}>{barber.rating}</Text>
                      <Text style={[styles.reviewText, { color: colors.textMuted }]}>({barber.reviewCount} değerlendirme)</Text>
                    </View>
                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
                      <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>{barber.locationLabel}</Text>
                    </View>
                  </View>
                </Pressable>
              </View>
              ))}
            </View>
          )}
        </View>

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.cardBorder, backgroundColor: colors.cardBg }]}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            © 2026 Berber Rezervasyon. Tüm hakları saklıdır.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    paddingVertical: 80,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  heroInner: {
    maxWidth: 800,
    width: "100%",
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -1,
    lineHeight: 60,
    marginBottom: 20,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: "center",
    lineHeight: 28,
    marginBottom: 40,
    maxWidth: 600,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    maxWidth: 600,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    paddingLeft: 24,
    paddingRight: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    marginLeft: 12,
    outlineStyle: "none", // Web özel
  } as any,
  searchBtn: {
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
  },
  searchBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  listSection: {
    maxWidth: 1240,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 60,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  searchSummary: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  clearSearchBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  clearSearchText: {
    fontSize: 13,
    fontWeight: "700",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    // Genişlik inline veriliyor
  },
  barberCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    height: 320,
  },
  barberImage: {
    width: "100%",
    height: 180,
  },
  barberInfo: {
    padding: 16,
    flex: 1,
    justifyContent: "space-between",
  },
  barberName: {
    fontSize: 18,
    fontWeight: "700",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "700",
  },
  reviewText: {
    fontSize: 13,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    paddingVertical: 40,
    alignItems: "center",
    borderTopWidth: 1,
    marginTop: "auto",
  },
  footerText: {
    fontSize: 14,
  },
  emptyState: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  }
});
