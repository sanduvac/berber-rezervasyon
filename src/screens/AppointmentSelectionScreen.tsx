import { useEffect, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import { formatDateLabel, isPastSlot } from "../utils/dateUtils";
import { mediumHaptic, selectionHaptic } from "../utils/haptics";

type AppointmentSelectionParams = {
  barberId?: string;
  serviceId?: string;
  preselectedDate?: string;
  preselectedTime?: string;
};

export function AppointmentSelectionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { getBarber, getService } = useApp();
  const { colors } = useTheme();

  const routeParams = route.params as AppointmentSelectionParams | undefined;
  const barber = routeParams?.barberId ? getBarber(routeParams.barberId) : undefined;
  const service = routeParams?.barberId && routeParams?.serviceId ? getService(routeParams.barberId, routeParams.serviceId) : undefined;
  const isWide = width >= 960;

  const availableDates = useMemo(() => {
    if (!barber) return [];
    return barber.availability.filter((day) =>
      day.slots.some((slot) => !slot.isBooked && !isPastSlot(day.date, slot.time))
    );
  }, [barber]);

  const [selectedDate, setSelectedDate] = useState<string | null>(routeParams?.preselectedDate ?? null);
  const [selectedTime, setSelectedTime] = useState<string | null>(routeParams?.preselectedTime ?? null);

  useEffect(() => {
    if (!barber) return;
    if (selectedDate && availableDates.some((day) => day.date === selectedDate)) return;
    setSelectedDate(routeParams?.preselectedDate ?? availableDates[0]?.date ?? null);
  }, [availableDates, barber, routeParams?.preselectedDate, selectedDate]);

  const slotsForDate = useMemo(() => {
    if (!barber || !selectedDate) return [];
    const day = barber.availability.find((item) => item.date === selectedDate);
    return day?.slots ?? [];
  }, [barber, selectedDate]);

  useEffect(() => {
    if (!selectedTime || !selectedDate) return;
    const selectedSlot = slotsForDate.find((slot) => slot.time === selectedTime);
    if (!selectedSlot || selectedSlot.isBooked || isPastSlot(selectedDate, selectedSlot.time)) {
      setSelectedTime(null);
    }
  }, [selectedDate, selectedTime, slotsForDate]);

  const availableSlotCount = slotsForDate.filter((slot) => !slot.isBooked && !isPastSlot(selectedDate ?? "", slot.time)).length;

  if (!barber || !service) {
    return (
      <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.emptyCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Ionicons name="calendar-clear-outline" size={42} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Randevu bilgisi bulunamadı</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Hizmet veya berber bilgisi yüklenemedi. Lütfen berber detayından tekrar seçim yapın.
          </Text>
          <Pressable style={[styles.emptyButton, { backgroundColor: colors.primary }]} onPress={() => navigation.goBack()}>
            <Text style={styles.emptyButtonText}>Geri Dön</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function handleSelectDate(date: string) {
    selectionHaptic();
    setSelectedDate(date);
    setSelectedTime(null);
  }

  function handleContinue() {
    if (!selectedDate || !selectedTime || !barber || !service) return;
    mediumHaptic();
    navigation.navigate("AppointmentConfirm", {
      barberId: barber.id,
      serviceId: service.id,
      date: selectedDate,
      time: selectedTime
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.page}>
          <View style={[styles.heroCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <Image source={{ uri: barber.coverImageUrl }} style={styles.coverImage} resizeMode="cover" />
            <View style={[styles.coverOverlay, { backgroundColor: colors.coverOverlay }]} />

            <View style={styles.heroTopRow}>
              <Pressable
                style={[styles.coverButton, { backgroundColor: colors.coverBadgeBg, borderColor: colors.coverBadgeBorder }]}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="chevron-back" size={18} color={colors.textPrimary} />
                <Text style={[styles.coverButtonText, { color: colors.textPrimary }]}>Geri</Text>
              </Pressable>
            </View>

            <View style={styles.heroContent}>
              <View style={[styles.stepBadge, { backgroundColor: colors.coverBadgeBg, borderColor: colors.coverBadgeBorder }]}>
                <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
                <Text style={styles.stepBadgeText}>Randevu zamanı seç</Text>
              </View>
              <Text style={styles.heroTitle}>{barber.name}</Text>
              <Text style={styles.heroDescription}>
                {service.name} için sana uygun tarihi ve saati seç.
              </Text>
            </View>
          </View>

          <View style={[styles.contentGrid, isWide && styles.contentGridWide]}>
            <View style={styles.mainColumn}>
              <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tarih Seç</Text>
                    <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>
                      Sadece müsait randevu günü olan tarihler listelenir.
                    </Text>
                  </View>
                  <Ionicons name="calendar-number-outline" size={24} color={colors.primary} />
                </View>

                {availableDates.length ? (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateRow}>
                    {availableDates.map((day) => {
                      const isSelected = selectedDate === day.date;
                      const freeSlots = day.slots.filter((slot) => !slot.isBooked && !isPastSlot(day.date, slot.time)).length;
                      return (
                        <Pressable
                          key={day.date}
                          style={[
                            styles.dateCard,
                            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                            isSelected && { backgroundColor: colors.primaryBg, borderColor: colors.primary }
                          ]}
                          onPress={() => handleSelectDate(day.date)}
                        >
                          <Text style={[styles.dateLabel, { color: isSelected ? colors.primary : colors.textPrimary }]}>{formatDateLabel(day.date)}</Text>
                          <Text style={[styles.dateSlotCount, { color: isSelected ? colors.primaryMuted : colors.textMuted }]}>{freeSlots} müsait saat</Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <View style={[styles.noSlotCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <Ionicons name="calendar-clear-outline" size={28} color={colors.textMuted} />
                    <Text style={[styles.noSlotTitle, { color: colors.textPrimary }]}>Müsait tarih yok</Text>
                    <Text style={[styles.noSlotText, { color: colors.textSecondary }]}>Bu hizmet için yakın tarihte boş randevu görünmüyor.</Text>
                  </View>
                )}
              </View>

              <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Saat Seç</Text>
                    <Text style={[styles.sectionCaption, { color: colors.textMuted }]}>
                      {selectedDate ? `${formatDateLabel(selectedDate)} tarihinde ${availableSlotCount} saat müsait.` : "Önce bir tarih seçin."}
                    </Text>
                  </View>
                  <Ionicons name="time-outline" size={24} color={colors.primary} />
                </View>

                {slotsForDate.length ? (
                  <View style={styles.timeGrid}>
                    {slotsForDate.map((slot) => {
                      const past = isPastSlot(selectedDate ?? "", slot.time);
                      const disabled = slot.isBooked || past;
                      const isSelected = selectedTime === slot.time;
                      return (
                        <Pressable
                          key={slot.time}
                          disabled={disabled}
                          style={[
                            styles.timeCard,
                            { backgroundColor: colors.surface, borderColor: colors.cardBorder },
                            disabled && { opacity: 0.38 },
                            isSelected && { backgroundColor: colors.primaryBg, borderColor: colors.primary }
                          ]}
                          onPress={() => {
                            selectionHaptic();
                            setSelectedTime(slot.time);
                          }}
                        >
                          <Text style={[styles.timeText, { color: isSelected ? colors.primary : colors.textPrimary }, disabled && { color: colors.textMuted }]}>
                            {slot.time}
                          </Text>
                          <Text style={[styles.timeStatus, { color: isSelected ? colors.primaryMuted : colors.textMuted }]}>
                            {slot.isBooked ? "Dolu" : past ? "Geçti" : "Müsait"}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <View style={[styles.noSlotCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                    <Ionicons name="time-outline" size={28} color={colors.textMuted} />
                    <Text style={[styles.noSlotTitle, { color: colors.textPrimary }]}>Saat bulunamadı</Text>
                    <Text style={[styles.noSlotText, { color: colors.textSecondary }]}>Önce müsait bir tarih seçin veya daha sonra tekrar kontrol edin.</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={[styles.sideColumn, isWide && styles.sideColumnWide]}>
              <View style={[styles.summaryCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
                <Text style={[styles.summaryTitle, { color: colors.textPrimary }]}>Randevu Özeti</Text>
                <InfoLine icon="cut-outline" label="Hizmet" value={service.name} colors={colors} />
                <InfoLine icon="wallet-outline" label="Ücret" value={`${service.price} TL`} colors={colors} />
                <InfoLine icon="calendar-outline" label="Tarih" value={selectedDate ? formatDateLabel(selectedDate) : "Seçilmedi"} colors={colors} />
                <InfoLine icon="time-outline" label="Saat" value={selectedTime ?? "Seçilmedi"} colors={colors} />
              </View>

              <Pressable
                style={[styles.continueButton, { backgroundColor: colors.primary }, !selectedTime && styles.continueButtonDisabled]}
                disabled={!selectedTime}
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>Devam Et</Text>
                <Ionicons name="arrow-forward" size={18} color="#ffffff" />
              </Pressable>

              <Text style={[styles.helpText, { color: colors.textMuted }]}>
                Randevuyu bir sonraki ekranda son kez kontrol edeceksin.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function InfoLine({ icon, label, value, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={[styles.infoLine, { borderBottomColor: colors.divider }]}>
      <View style={styles.infoLineLeft}>
        <Ionicons name={icon} size={16} color={colors.primary} />
        <Text style={[styles.infoLineLabel, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[styles.infoLineValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 48
  },
  page: {
    width: "100%",
    maxWidth: 1180,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 18
  },
  heroCard: {
    height: 320,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden"
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%"
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject
  },
  heroTopRow: {
    position: "absolute",
    top: 18,
    left: 18,
    right: 18,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  coverButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  coverButtonText: {
    fontWeight: "900",
    fontSize: 13
  },
  heroContent: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 24,
    maxWidth: 680
  },
  stepBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  stepBadgeText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 12
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -0.8,
    marginTop: 14
  },
  heroDescription: {
    color: "rgba(255,255,255,0.86)",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8
  },
  contentGrid: {
    gap: 16,
    marginTop: 16
  },
  contentGridWide: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  mainColumn: {
    flex: 1,
    gap: 16
  },
  sideColumn: {
    gap: 14
  },
  sideColumnWide: {
    width: 330
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.3
  },
  sectionCaption: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600"
  },
  dateRow: {
    gap: 10,
    paddingRight: 8
  },
  dateCard: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 15,
    minWidth: 150
  },
  dateLabel: {
    fontWeight: "900",
    fontSize: 15
  },
  dateSlotCount: {
    marginTop: 5,
    fontSize: 12,
    fontWeight: "700"
  },
  noSlotCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 20,
    alignItems: "center"
  },
  noSlotTitle: {
    marginTop: 10,
    fontWeight: "900",
    fontSize: 17
  },
  noSlotText: {
    marginTop: 6,
    textAlign: "center",
    lineHeight: 22
  },
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  timeCard: {
    minWidth: 104,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center"
  },
  timeText: {
    fontWeight: "900",
    fontSize: 16
  },
  timeStatus: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: "800"
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 20
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 10
  },
  infoLine: {
    borderBottomWidth: 1,
    paddingVertical: 13,
    gap: 8
  },
  infoLineLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  infoLineLabel: {
    fontSize: 13,
    fontWeight: "700"
  },
  infoLineValue: {
    fontSize: 16,
    fontWeight: "900"
  },
  continueButton: {
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.32,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6
  },
  continueButtonDisabled: {
    opacity: 0.42
  },
  continueButtonText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 16
  },
  helpText: {
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600"
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  emptyCard: {
    width: "100%",
    maxWidth: 440,
    borderWidth: 1,
    borderRadius: 24,
    padding: 28,
    alignItems: "center"
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 14,
    marginBottom: 8
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 18
  },
  emptyButton: {
    borderRadius: 999,
    paddingHorizontal: 22,
    paddingVertical: 12
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontWeight: "900"
  }
});
