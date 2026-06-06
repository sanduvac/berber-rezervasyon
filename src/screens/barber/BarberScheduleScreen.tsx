import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";

export function BarberScheduleScreen() {
  const { colors } = useTheme();
  const { ownedBarber, updateOwnedBarber, showSuccessToast } = useApp();
  const [openingTime, setOpeningTime] = useState("");
  const [closingTime, setClosingTime] = useState("");

  useEffect(() => {
    setOpeningTime(ownedBarber?.openingTime ?? "");
    setClosingTime(ownedBarber?.closingTime ?? "");
  }, [ownedBarber]);

  async function handleSave() {
    if (!openingTime.trim() || !closingTime.trim()) {
      Alert.alert("Uyarı", "Lütfen açılış ve kapanış saatlerini girin.");
      return;
    }

    await updateOwnedBarber({
      openingTime: openingTime.trim(),
      closingTime: closingTime.trim()
    });
    showSuccessToast("Çalışma saatleri güncellendi.");
  }

  if (!ownedBarber) {
    return (
      <View style={[styles.emptyOwnerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Ionicons name="storefront-outline" size={42} color={colors.textMuted} />
        <Text style={[styles.emptyOwnerTitle, { color: colors.textPrimary }]}>Berber ataması yok</Text>
        <Text style={[styles.emptyOwnerText, { color: colors.textSecondary }]}>
          Bu yönetici hesabı bir berbere bağlanınca çalışma saatleri buradan düzenlenebilir.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Çalışma Saatleri</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{ownedBarber.name} için müşterilerin randevu alabileceği saat aralığını belirleyin.</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Açılış Saati</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder, color: colors.textPrimary }]}
              placeholder="09:00"
              placeholderTextColor={colors.searchPlaceholder}
              value={openingTime}
              onChangeText={setOpeningTime}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Kapanış Saati</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder, color: colors.textPrimary }]}
              placeholder="22:00"
              placeholderTextColor={colors.searchPlaceholder}
              value={closingTime}
              onChangeText={setClosingTime}
            />
          </View>
        </View>
      </View>

      <Pressable style={[styles.saveBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Değişiklikleri Kaydet</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
  },
  inputRow: {
    flexDirection: "row",
    gap: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  dayLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dayLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  timeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  timeSeparator: {
    fontSize: 16,
    fontWeight: "500",
  },
  closedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  closedText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "700",
  },
  saveBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 40,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyOwnerCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyOwnerTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "800",
  },
  emptyOwnerText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  }
});
