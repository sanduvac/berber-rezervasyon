import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";
import { PrivacySettings } from "../../types/settings";
import { selectionHaptic } from "../../utils/haptics";

type Props = { onBack: () => void };

function ToggleRow({ title, subtitle, value, onValueChange }: { title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void }) {
  const { colors, mode } = useTheme();
  return (
    <View style={[styles.toggleRow, { borderBottomColor: colors.divider }]}>
      <View style={styles.toggleTextWrap}>
        <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.toggleSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={(v) => { selectionHaptic(); onValueChange(v); }}
        trackColor={{ false: mode === "dark" ? "#2A3250" : "#E2E8F0", true: "rgba(108, 92, 231, 0.4)" }}
        thumbColor={value ? "#6C5CE7" : (mode === "dark" ? "#52617A" : "#CBD5E1")}
      />
    </View>
  );
}

export function PrivacySecurityView({ onBack }: Props) {
  const { privacySettings, setPrivacySettings } = useApp();
  const { colors } = useTheme();
  const { biometricLogin, twoFactorAuth, locationSharing, analyticsData } = privacySettings;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={onBack}>
        <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
        <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
      </Pressable>

      <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
        <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
        <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>Gizlilik ve Güvenlik</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Hesabının güvenlik adımlarını ve veri izinlerini yönet.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Güvenlik</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <ToggleRow title="Biyometrik Giriş" subtitle="Face ID veya Touch ID ile hızlı giriş yap"
            value={biometricLogin}
            onValueChange={(value) => setPrivacySettings({ ...privacySettings, biometricLogin: value })}
          />
          <ToggleRow title="İki Adımlı Doğrulama" subtitle="Giriş yaparken SMS onay kodu iste"
            value={twoFactorAuth}
            onValueChange={(value) => setPrivacySettings({ ...privacySettings, twoFactorAuth: value })}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Veri İzinleri</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <ToggleRow title="Konum Paylaşımı" subtitle="En yakın berberleri bulmak için konumu kullan"
            value={locationSharing}
            onValueChange={(value) => setPrivacySettings({ ...privacySettings, locationSharing: value })}
          />
          <ToggleRow title="Analitik Verileri" subtitle="Uygulamayı geliştirmemiz için kullanım verilerini anonim olarak paylaş"
            value={analyticsData}
            onValueChange={(value) => setPrivacySettings({ ...privacySettings, analyticsData: value })}
          />
        </View>
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
  toggleSubtitle: { marginTop: 3, fontSize: 12.5 }
});
