import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Barber, BarberService } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";

type AppointmentSelectionScreenProps = {
  barber: Barber;
  service: BarberService;
  initialDate?: string;
  initialTime?: string;
  onBack: () => void;
  onContinue: (date: string, time: string) => void;
};

const MONTH_NAMES = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const WEEKDAY_NAMES = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function parseDateKey(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateLabel(dateKey: string): string {
  const date = parseDateKey(dateKey);
  return `${date.getDate()} ${MONTH_NAMES[date.getMonth()]} ${WEEKDAY_NAMES[date.getDay()]}`;
}

function isPastSlot(dateKey: string, time: string, now: Date = new Date()): boolean {
  const [hour, minute] = time.split(":").map(Number);
  const slotDate = parseDateKey(dateKey);
  slotDate.setHours(hour, minute, 0, 0);
  return slotDate.getTime() < now.getTime();
}

export function AppointmentSelectionScreen({ barber, service, initialDate, initialTime, onBack, onContinue }: AppointmentSelectionScreenProps) {
  const { colors, mode } = useTheme();
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    if (initialDate) return initialDate;
    const firstAvailableDay = barber.availability.find((day) => day.slots.some((slot) => !slot.isBooked && !isPastSlot(day.date, slot.time)));
    return firstAvailableDay?.date ?? barber.availability[0]?.date ?? null;
  });
  const [selectedTime, setSelectedTime] = useState<string | null>(initialTime ?? null);
  const selectedDay = useMemo(() => barber.availability.find((day) => day.date === selectedDate) ?? null, [barber.availability, selectedDate]);
  const canContinue = useMemo(() => {
    if (!selectedDay || !selectedTime) return false;
    const selectedSlot = selectedDay.slots.find((slot) => slot.time === selectedTime);
    if (!selectedSlot) return false;
    return !selectedSlot.isBooked && !isPastSlot(selectedDay.date, selectedSlot.time);
  }, [selectedDay, selectedTime]);

  const disabledBg = mode === "dark" ? "rgba(18, 22, 45, 0.4)" : "rgba(148, 163, 184, 0.1)";
  const disabledBorder = mode === "dark" ? "rgba(58, 69, 99, 0.2)" : "rgba(148, 163, 184, 0.2)";
  const disabledText = mode === "dark" ? "#3A4563" : "#CBD5E1";
  const selectedBg = mode === "dark" ? "rgba(108, 92, 231, 0.3)" : "rgba(108, 92, 231, 0.12)";
  const selectedBorder = mode === "dark" ? "rgba(108, 92, 231, 0.5)" : "rgba(108, 92, 231, 0.4)";

  return (
    <View style={styles.container}>
      <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={onBack}>
        <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
        <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
      </Pressable>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Randevu Saati Seç</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Hizmet: {service.name}</Text>

        <View style={[styles.serviceInfoCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.serviceInfoLeft}>
            <View style={[styles.serviceInfoIcon, { backgroundColor: colors.primaryBg }]}>
              <Ionicons name="cut" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.serviceInfoTitle, { color: colors.textPrimary }]}>{service.name}</Text>
          </View>
          <Text style={[styles.serviceInfoPrice, { color: colors.secondary }]}>{service.price} TL</Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tarih Seçimi</Text>
        <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>Dolu günler gri ve seçilemez görünür.</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
          {barber.availability.map((day) => {
            const hasAvailableSlot = day.slots.some((slot) => !slot.isBooked && !isPastSlot(day.date, slot.time));
            const isSelected = selectedDate === day.date;
            return (
              <Pressable key={day.date}
                style={[styles.dateChip, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                isSelected && { backgroundColor: selectedBg, borderColor: selectedBorder },
                !hasAvailableSlot && { backgroundColor: disabledBg, borderColor: disabledBorder }
                ]}
                onPress={() => { setSelectedDate(day.date); setSelectedTime(null); }}
                disabled={!hasAvailableSlot}
              >
                <Text style={[styles.dateChipText, { color: colors.textSecondary },
                isSelected && { color: colors.primaryMuted, fontWeight: "700" },
                !hasAvailableSlot && { color: disabledText }
                ]}>{formatDateLabel(day.date)}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Saat Seçimi</Text>
        <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>Dolu saatler gri, boş saatler seçilebilir.</Text>

        {selectedDay ? (
          <View style={styles.slotGrid}>
            {selectedDay.slots.map((slot) => {
              const slotIsDisabled = slot.isBooked || isPastSlot(selectedDay.date, slot.time);
              const slotIsSelected = selectedTime === slot.time;
              return (
                <Pressable key={`${selectedDay.date}-${slot.time}`}
                  style={[styles.slotButton, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
                  slotIsDisabled && { backgroundColor: disabledBg, borderColor: disabledBorder },
                  slotIsSelected && { backgroundColor: selectedBg, borderColor: selectedBorder }
                  ]}
                  onPress={() => setSelectedTime(slot.time)} disabled={slotIsDisabled}
                >
                  <Text style={[styles.slotButtonText, { color: colors.textSecondary },
                  slotIsDisabled && { color: disabledText },
                  slotIsSelected && { color: colors.primaryMuted }
                  ]}>{slot.time}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Bu berber için uygun tarih yok.</Text>
        )}

        {selectedDay && !selectedDay.slots.some((slot) => !slot.isBooked && !isPastSlot(selectedDay.date, slot.time)) ? (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>Bu tarihte seçilebilir saat kalmadı.</Text>
        ) : null}

        <View style={styles.selectionRow}>
          <Ionicons name="checkmark-circle" size={16} color={selectedDate && selectedTime ? colors.secondary : colors.textMuted} />
          <Text style={[styles.selectionText, { color: colors.textSecondary }]}>
            {selectedDate && selectedTime ? `Seçim: ${formatDateLabel(selectedDate)} ${selectedTime}` : "Seçim yapmak için bir saat kutusuna dokun."}
          </Text>
        </View>

        <Pressable
          style={[styles.continueButton, !canContinue && { backgroundColor: mode === "dark" ? "rgba(108, 92, 231, 0.3)" : "rgba(108, 92, 231, 0.4)", shadowOpacity: 0 }]}
          onPress={() => { if (selectedDate && selectedTime) onContinue(selectedDate, selectedTime); }}
          disabled={!canContinue}
        >
          <Text style={styles.continueButtonText}>Devam Et</Text>
          <Ionicons name="arrow-forward" size={18} color="#ffffff" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 12 },
  backButtonText: { fontWeight: "700" },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  subtitle: { marginTop: 6 },
  serviceInfoCard: { marginTop: 14, borderWidth: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  serviceInfoLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  serviceInfoIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  serviceInfoTitle: { fontWeight: "700" },
  serviceInfoPrice: { fontWeight: "800", fontSize: 16 },
  sectionTitle: { marginTop: 22, fontSize: 20, fontWeight: "800", letterSpacing: -0.2 },
  sectionCaption: { marginTop: 6 },
  dateRow: { paddingVertical: 10, gap: 8 },
  dateChip: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  dateChipText: { fontSize: 12, fontWeight: "600" },
  slotGrid: { marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 },
  slotButton: { minWidth: 78, alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  slotButtonText: { fontWeight: "700", fontSize: 14 },
  emptyText: { marginTop: 10 },
  selectionRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 8 },
  selectionText: { fontWeight: "600" },
  continueButton: {
    marginTop: 16, marginBottom: 24, backgroundColor: "#6C5CE7", borderRadius: 16,
    alignItems: "center", justifyContent: "center", paddingVertical: 14,
    flexDirection: "row", gap: 8,
    shadowColor: "#6C5CE7", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6
  },
  continueButtonText: { color: "#ffffff", fontWeight: "800", fontSize: 16 }
});
