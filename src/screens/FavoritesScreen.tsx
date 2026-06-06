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
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { marginTop: 6, marginBottom: 14 },
  listContent: { paddingBottom: 80 },
  emptyWrap: { alignItems: "center", marginTop: 50, gap: 12 },
  emptyText: { textAlign: "center", lineHeight: 21, fontSize: 14 }
});
