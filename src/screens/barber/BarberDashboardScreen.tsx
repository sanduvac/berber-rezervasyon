import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";

export function BarberDashboardScreen() {
  const { colors, mode } = useTheme();
  const { appointments, ownedBarber } = useApp();

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter(a => a.date === todayStr);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>
        {ownedBarber ? `${ownedBarber.name} İstatistikleri` : "İstatistikler"}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Bugün işler nasıl gidiyor, bir göz atın.</Text>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.statIconWrap, { backgroundColor: colors.primaryBg }]}>
            <Ionicons name="calendar" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{todayAppointments.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bugünkü Randevular</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.statIconWrap, { backgroundColor: colors.successBg }]}>
            <Ionicons name="cash" size={24} color={colors.success} />
          </View>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>--- TL</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bugünkü Kazanç (Yakında)</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.statIconWrap, { backgroundColor: mode === "dark" ? "rgba(255, 215, 0, 0.1)" : "rgba(217, 119, 6, 0.08)" }]}>
            <Ionicons name="star" size={24} color={colors.gold} />
          </View>
          <Text style={[styles.statValue, { color: colors.textPrimary }]}>{ownedBarber?.rating ?? "-"}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ortalama Puan</Text>
        </View>
      </View>

      <View style={[styles.heroPanel, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
        <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
        <Text style={[styles.heroTitle, { color: colors.textPrimary }]}>Berber Paneline Hoş Geldiniz</Text>
        <Text style={[styles.heroDesc, { color: colors.textSecondary }]}>
          Sol menüyü kullanarak randevularınızı görüntüleyebilir, silebilir veya hizmetlerinizin fiyatlarını güncelleyebilirsiniz. Bu panel bilgisayar ve tablet ekranlarında rahat kullanım için tasarlanmıştır.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 24,
    fontSize: 15,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
  },
  statIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  heroPanel: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 30,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 300,
    height: 300,
    borderRadius: 999,
    right: -100,
    top: -100,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 12,
  },
  heroDesc: {
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 600,
  }
});
