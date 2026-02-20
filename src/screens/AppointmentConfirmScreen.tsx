import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Barber, BarberService } from "../types/barber";
import { useTheme } from "../theme/ThemeContext";

type AppointmentConfirmScreenProps = {
  barber: Barber;
  service: BarberService;
  date: string;
  time: string;
  onBack: () => void;
  onCancel: () => void;
  onConfirm: () => void;
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

export function AppointmentConfirmScreen({ barber, service, date, time, onBack, onCancel, onConfirm }: AppointmentConfirmScreenProps) {
  const { colors, mode } = useTheme();

  return (
    <View style={styles.container}>
      <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={onBack}>
        <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
        <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
      </Pressable>

      <View style={styles.headerIconWrap}>
        <Ionicons name="checkmark-circle" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Randevu Onayı</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Bilgileri kontrol et, sonra onayla.</Text>

      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={[styles.row, { borderColor: colors.divider }]}>
          <View style={styles.keyRow}><Ionicons name="cut-outline" size={15} color={colors.primary} /><Text style={[styles.key, { color: colors.textSecondary }]}>Berber</Text></View>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{barber.name}</Text>
        </View>
        <View style={[styles.row, { borderColor: colors.divider }]}>
          <View style={styles.keyRow}><Ionicons name="sparkles-outline" size={15} color={colors.primary} /><Text style={[styles.key, { color: colors.textSecondary }]}>Hizmet</Text></View>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{service.name}</Text>
        </View>
        <View style={[styles.row, { borderColor: colors.divider }]}>
          <View style={styles.keyRow}><Ionicons name="wallet-outline" size={15} color={colors.primary} /><Text style={[styles.key, { color: colors.textSecondary }]}>Ücret</Text></View>
          <Text style={[styles.valueAccent, { color: colors.secondary }]}>{service.price} TL</Text>
        </View>
        <View style={[styles.row, { borderColor: colors.divider }]}>
          <View style={styles.keyRow}><Ionicons name="calendar-outline" size={15} color={colors.primary} /><Text style={[styles.key, { color: colors.textSecondary }]}>Tarih</Text></View>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{formatDateLabel(date)}</Text>
        </View>
        <View style={styles.rowNoBorder}>
          <View style={styles.keyRow}><Ionicons name="time-outline" size={15} color={colors.primary} /><Text style={[styles.key, { color: colors.textSecondary }]}>Saat</Text></View>
          <Text style={[styles.value, { color: colors.textPrimary }]}>{time}</Text>
        </View>
      </View>

      <Pressable style={styles.confirmButton} onPress={onConfirm}>
        <Ionicons name="checkmark" size={20} color="#ffffff" />
        <Text style={styles.confirmButtonText}>Onayla</Text>
      </Pressable>

      <Pressable style={[styles.cancelButton, { borderColor: colors.cardBorder, backgroundColor: mode === "dark" ? "rgba(18, 22, 45, 0.6)" : colors.surface }]} onPress={onCancel}>
        <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Vazgeç</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 12 },
  backButtonText: { fontWeight: "700" },
  headerIconWrap: { alignItems: "center", marginBottom: 8 },
  title: { fontSize: 28, fontWeight: "800", textAlign: "center", letterSpacing: -0.3 },
  subtitle: { marginTop: 6, marginBottom: 18, textAlign: "center" },
  card: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 8 },
  row: { paddingVertical: 13, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 14 },
  rowNoBorder: { paddingVertical: 13, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 14 },
  keyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  key: { fontWeight: "600" },
  value: { fontWeight: "700", textAlign: "right", flex: 1 },
  valueAccent: { fontWeight: "800", textAlign: "right", flex: 1, fontSize: 16 },
  confirmButton: {
    marginTop: 20, backgroundColor: "#6C5CE7", borderRadius: 16, alignItems: "center", justifyContent: "center",
    paddingVertical: 14, flexDirection: "row", gap: 8,
    shadowColor: "#6C5CE7", shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6
  },
  confirmButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  cancelButton: { marginTop: 10, borderRadius: 16, borderWidth: 1, alignItems: "center", justifyContent: "center", paddingVertical: 14 },
  cancelButtonText: { fontWeight: "700", fontSize: 15 }
});
