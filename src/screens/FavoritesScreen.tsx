import { FlatList, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { BarberCard } from "../components/BarberCard";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import type { RootTabParamList, HomeStackParamList } from "../types/navigation";

type FavoritesNavProp = CompositeNavigationProp<
  BottomTabNavigationProp<RootTabParamList, "FavoritesTab">,
  NativeStackNavigationProp<HomeStackParamList>
>;

export function FavoritesScreen() {
  const navigation = useNavigation<FavoritesNavProp>();
  const { barbers, favoriteBarberIds, toggleFavorite } = useApp();
  const { colors } = useTheme();
  const favoriteBarbers = barbers.filter((barber) => favoriteBarberIds.includes(barber.id));

  return (
    <View style={styles.container}>
      {navigation.canGoBack() && (
        <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
          <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
        </Pressable>
      )}
      <Text style={[styles.title, { color: colors.textPrimary }]}>Favorilerim</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Kaydettiğin berberler burada listelenir.</Text>

      <FlatList data={favoriteBarbers} keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="heart-outline" size={44} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>
              Henüz favori berberin yok.{"\n"}Ana sayfadan kalp simgesine basarak ekleyebilirsin.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <BarberCard
            barber={item}
            onPress={(barber) => {
              navigation.navigate("HomeTab", { screen: "BarberDetail", params: { barberId: barber.id } });
            }}
            isFavorite={true}
            onToggleFavorite={toggleFavorite}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 12 },
  backButtonText: { fontWeight: "700" },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { marginTop: 6, marginBottom: 14 },
  listContent: { paddingBottom: 80 },
  emptyWrap: { alignItems: "center", marginTop: 50, gap: 12 },
  emptyText: { textAlign: "center", lineHeight: 21, fontSize: 14 }
});
