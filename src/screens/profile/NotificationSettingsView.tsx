import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";
import { NotificationSettings } from "../../types/settings";
import { selectionHaptic } from "../../utils/haptics";

type Props = { onBack: () => void };

function ToggleRow({ title, subtitle, value, onValueChange, disabled }: { title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean }) {
  const { colors, mode } = useTheme();
  return (
    <View style={[styles.toggleRow, { borderBottomColor: colors.divider }, disabled && { backgroundColor: mode === "dark" ? "rgba(11, 15, 26, 0.5)" : "#F8FAFC" }]}>
      <View style={styles.toggleTextWrap}>
        <Text style={[styles.toggleTitle, { color: disabled ? colors.textMuted : colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.toggleSubtitle, { color: disabled ? (mode === "dark" ? "#3A4563" : "#CBD5E1") : colors.textMuted }]}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={(v) => { selectionHaptic(); onValueChange(v); }} disabled={disabled}
        trackColor={{ false: mode === "dark" ? "#2A3250" : "#E2E8F0", true: "rgba(108, 92, 231, 0.4)" }}
        thumbColor={value ? "#6C5CE7" : (mode === "dark" ? "#52617A" : "#CBD5E1")}
      />
    </View>
  );
}

export function NotificationSettingsView({ onBack }: Props) {
  const { notificationSettings, setNotificationSettings } = useApp();
  const { colors, mode } = useTheme();
  const { allNotifications, appointmentReminders, systemNotifications } = notificationSettings;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={onBack}>
        <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
        <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
      </Pressable>

      <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
        <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
        <Ionicons name="notifications" size={28} color={colors.primary} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>Bildirim Ayarları</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Randevu ve uygulama bildirim tercihlerini yönet.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tercihler</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <ToggleRow title="Tüm Bildirimler" subtitle="Uygulama bildirimlerini tamamen aç / kapat"
            value={allNotifications} onValueChange={(value) => {
              const next: NotificationSettings = { ...notificationSettings, allNotifications: value };
              if (!value) { next.appointmentReminders = false; next.systemNotifications = false; }
              setNotificationSettings(next);
            }}
          />
          <ToggleRow title="Randevu Hatırlatmaları" subtitle="Randevu saatinden önce hatırlatma al"
            value={appointmentReminders} disabled={!allNotifications}
            onValueChange={(value) => setNotificationSettings({ ...notificationSettings, appointmentReminders: value })}
          />
          <ToggleRow title="Sistem Bildirimleri" subtitle="Uygulama güncelleme ve önemli bilgilendirmeler"
            value={systemNotifications} disabled={!allNotifications}
            onValueChange={(value) => setNotificationSettings({ ...notificationSettings, systemNotifications: value })}
          />
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.infoIconRow}>
          <Ionicons name="information-circle" size={18} color={colors.primary} />
          <Text style={[styles.infoTitle, { color: colors.primaryMuted }]}>Not</Text>
        </View>
        <Text style={[styles.infoText, { color: colors.textMuted }]}>
          Cihaz düzeyindeki izinler kapalıysa bu ayarlar tek başına bildirim göndermeyi başlatmaz. İzinleri telefon ayarlarından yönetebilirsin.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 80 },
  backButton: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 12
  },
  backButtonText: { fontWeight: "700" },
  hero: { borderRadius: 22, borderWidth: 1, padding: 20, alignItems: "center", overflow: "hidden" },
  heroGlow: { position: "absolute", width: 200, height: 200, borderRadius: 999, top: -80, right: -40 },
  name: { fontSize: 22, fontWeight: "800", letterSpacing: -0.2, marginTop: 4 },
  subtitle: { marginTop: 6, lineHeight: 19, textAlign: "center" },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 8 },
  sectionCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  toggleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10,
    paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1
  },
  toggleTextWrap: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: "700" },
  toggleSubtitle: { marginTop: 3, fontSize: 12.5 },
  infoCard: { marginTop: 16, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  infoIconRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  infoTitle: { fontWeight: "700" },
  infoText: { lineHeight: 20 }
});
