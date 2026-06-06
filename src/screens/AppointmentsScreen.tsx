import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import type { AppointmentsStackParamList } from "../types/navigation";
import { parseDateTime, formatRemaining } from "../utils/dateUtils";
import { AppointmentCardSkeleton } from "../components/Skeleton";

export function AppointmentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppointmentsStackParamList>>();
  const { appointments, barbers, dataLoaded } = useApp();
  const { colors, mode } = useTheme();
  const [clock, setClock] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => setClock(Date.now()), 30000);
    return () => clearInterval(intervalId);
  }, []);

  const now = new Date(clock);
  const appointmentItems = useMemo(() => {
    return appointments.map((appointment) => {
      const barber = barbers.find((item) => item.id === appointment.barberId);
      if (!barber) return null;
      const service = barber.services.find((item) => item.id === appointment.serviceId);
      if (!service) return null;
      const appointmentDate = parseDateTime(appointment.date, appointment.time);
      const isPast = appointmentDate.getTime() <= now.getTime();
      const status = appointment.status || (isPast ? "completed" : "upcoming");
      return { ...appointment, barber, service, appointmentDate, status };
    }).filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime());
  }, [appointments, barbers, now]);

  const secondaryBadgeBg = mode === "dark" ? "rgba(0, 210, 255, 0.1)" : "rgba(8, 145, 178, 0.08)";
  const secondaryBadgeBorder = mode === "dark" ? "rgba(0, 210, 255, 0.2)" : "rgba(8, 145, 178, 0.2)";
  const pastBadgeBg = mode === "dark" ? "rgba(58, 69, 99, 0.2)" : "rgba(148, 163, 184, 0.1)";
  const pastBadgeBorder = mode === "dark" ? "rgba(58, 69, 99, 0.3)" : "rgba(148, 163, 184, 0.2)";
  const completedBadgeBg = mode === "dark" ? "rgba(52, 211, 153, 0.1)" : "rgba(5, 150, 105, 0.08)";
  const completedBadgeBorder = mode === "dark" ? "rgba(52, 211, 153, 0.2)" : "rgba(5, 150, 105, 0.2)";

  async function onRefresh() {
    setRefreshing(true);
    setClock(Date.now());
    await new Promise(resolve => setTimeout(resolve, 600));
    setRefreshing(false);
  }

  function getStatusBadge(status: string, isPast: boolean) {
    if (status === "completed") {
      return { bg: completedBadgeBg, border: completedBadgeBorder, color: colors.success, icon: "checkmark-circle-outline" as const, label: "Tamamlandı" };
    }
    if (status === "cancelled") {
      return { bg: pastBadgeBg, border: pastBadgeBorder, color: colors.textMuted, icon: "close-circle-outline" as const, label: "İptal Edildi" };
    }
    if (isPast) {
      return { bg: pastBadgeBg, border: pastBadgeBorder, color: colors.textMuted, icon: "timer-outline" as const, label: "Geçti" };
    }
    return null;
  }

  return (
    <View style={styles.container}>
      {navigation.canGoBack() && (
        <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
          <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
        </Pressable>
      )}
      <Text style={[styles.title, { color: colors.textPrimary }]}>Randevularım</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Aldığın randevular burada listelenir.</Text>

      <FlatList data={!dataLoaded ? [] : appointmentItems} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          !dataLoaded ? (
            <View>
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
              <AppointmentCardSkeleton />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz alınmış randevu yok.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const isPast = item.appointmentDate.getTime() <= now.getTime();
          const remaining = formatRemaining(item.appointmentDate, now);
          const statusBadge = getStatusBadge(item.status, isPast);
          return (
            <Pressable style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} onPress={() => navigation.navigate("AppointmentDetail", { appointmentId: item.id })}>
              <View style={styles.badgeRow}>
                {statusBadge && (
                  <View style={[styles.statusBadge, { backgroundColor: statusBadge.bg, borderColor: statusBadge.border }]}>
                    <Ionicons name={statusBadge.icon} size={12} color={statusBadge.color} />
                    <Text style={[styles.statusLabel, { color: statusBadge.color }]}>{statusBadge.label}</Text>
                  </View>
                )}
                <View style={[styles.remainingBadge, {
                  backgroundColor: isPast ? pastBadgeBg : secondaryBadgeBg,
                  borderColor: isPast ? pastBadgeBorder : secondaryBadgeBorder
                }]}>
                  <Ionicons name="timer-outline" size={12} color={isPast ? colors.textMuted : colors.secondary} />
                  <Text style={[styles.remainingLabel, { color: isPast ? colors.textMuted : colors.secondary }]}>{remaining}</Text>
                </View>
              </View>
              <Text style={[styles.barberName, { color: colors.textPrimary }]}>{item.barber.name}</Text>
              <View style={styles.infoRow}><Ionicons name="cut-outline" size={13} color={colors.primary} /><Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.service.name}</Text></View>
              <View style={styles.infoRow}><Ionicons name="wallet-outline" size={13} color={colors.primary} /><Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.service.price} TL</Text></View>
              <View style={styles.infoRow}><Ionicons name="calendar-outline" size={13} color={colors.primary} /><Text style={[styles.infoText, { color: colors.textSecondary }]}>{item.date} {item.time}</Text></View>
              <View style={styles.openHintRow}><Text style={[styles.openHint, { color: colors.primary }]}>Randevu detayını aç</Text><Ionicons name="chevron-forward" size={14} color={colors.primary} /></View>
            </Pressable>
          );
        }}
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
  emptyText: { textAlign: "center", fontSize: 14 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 10 },
  badgeRow: { flexDirection: "row", justifyContent: "flex-end", gap: 6, marginBottom: 4 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  statusLabel: { fontSize: 12, fontWeight: "700" },
  remainingBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  remainingLabel: { fontSize: 12, fontWeight: "700" },
  barberName: { fontSize: 18, fontWeight: "800", marginBottom: 8, letterSpacing: -0.2 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  infoText: {},
  openHintRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 4 },
  openHint: { fontWeight: "700", fontSize: 13 }
});
