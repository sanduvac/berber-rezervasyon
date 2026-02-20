import { useEffect, useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Appointment } from "../types/appointment";
import { Barber } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";

type AppointmentsScreenProps = {
  appointments: Appointment[];
  barbers: Barber[];
  onOpenAppointment: (appointmentId: string) => void;
};

function parseDateTime(dateKey: string, time: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function formatRemaining(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "Geçti";
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}g ${hours}s`;
  if (hours > 0) return `${hours}s ${minutes}d`;
  return `${minutes} dk`;
}

export function AppointmentsScreen({ appointments, barbers, onOpenAppointment }: AppointmentsScreenProps) {
  const { colors, mode } = useTheme();
  const [clock, setClock] = useState(() => Date.now());

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
      return { ...appointment, barber, service, appointmentDate: parseDateTime(appointment.date, appointment.time) };
    }).filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => a.appointmentDate.getTime() - b.appointmentDate.getTime());
  }, [appointments, barbers]);

  const secondaryBadgeBg = mode === "dark" ? "rgba(0, 210, 255, 0.1)" : "rgba(8, 145, 178, 0.08)";
  const secondaryBadgeBorder = mode === "dark" ? "rgba(0, 210, 255, 0.2)" : "rgba(8, 145, 178, 0.2)";
  const pastBadgeBg = mode === "dark" ? "rgba(58, 69, 99, 0.2)" : "rgba(148, 163, 184, 0.1)";
  const pastBadgeBorder = mode === "dark" ? "rgba(58, 69, 99, 0.3)" : "rgba(148, 163, 184, 0.2)";

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Randevularım</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Aldığın randevular burada listelenir.</Text>

      <FlatList data={appointmentItems} keyExtractor={(item) => item.id} showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz alınmış randevu yok.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isPast = item.appointmentDate.getTime() <= now.getTime();
          const remaining = formatRemaining(item.appointmentDate, now);
          return (
            <Pressable style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]} onPress={() => onOpenAppointment(item.id)}>
              <View style={[styles.remainingBadge, {
                backgroundColor: isPast ? pastBadgeBg : secondaryBadgeBg,
                borderColor: isPast ? pastBadgeBorder : secondaryBadgeBorder
              }]}>
                <Ionicons name="timer-outline" size={12} color={isPast ? colors.textMuted : colors.secondary} />
                <Text style={[styles.remainingLabel, { color: isPast ? colors.textMuted : colors.secondary }]}>{remaining}</Text>
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
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { marginTop: 6, marginBottom: 14 },
  listContent: { paddingBottom: 80 },
  emptyWrap: { alignItems: "center", marginTop: 50, gap: 12 },
  emptyText: { textAlign: "center", fontSize: 14 },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, marginBottom: 10 },
  remainingBadge: { position: "absolute", right: 12, top: 12, flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  remainingLabel: { fontSize: 12, fontWeight: "700" },
  barberName: { fontSize: 18, fontWeight: "800", marginBottom: 8, paddingRight: 100, letterSpacing: -0.2 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 3 },
  infoText: {},
  openHintRow: { marginTop: 12, flexDirection: "row", alignItems: "center", gap: 4 },
  openHint: { fontWeight: "700", fontSize: 13 }
});
