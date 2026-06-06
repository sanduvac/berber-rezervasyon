import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { lightHaptic } from "../../utils/haptics";

type Props = { onBack: () => void };

const FAQ_ITEMS = [
  { q: "Randevumu nasıl iptal ederim?", a: "Randevularım ekranında ilgili randevuya dokununuz ve 'İptal Et' butonuna tıklayınız. İptal işlemi hemen gerçekleşir." },
  { q: "Ödeme ne zaman yapılır?", a: "Ödeme işlemi randevu tamamlandıktan sonra berberde yapılır. Uygulama üzerinden ön ödeme zorunluluğu yoktur." },
  { q: "Bildirim gelmiyor?", a: "Telefon Ayarları > Bildirimler menüsünden uygulamaya bildirim izni verdiğinizden emin olunuz." },
  { q: "Favori berberleri nasıl eklerim?", a: "Berber kartındaki kalp ikonuna basarak favorilere ekleyebilirsiniz. Favoriler sekmesinden kolayca erişebilirsiniz." },
  { q: "Tekrar randevu nasıl alırım?", a: "Randevu detay ekranında 'Tekrar Randevu Al' butonuna basarak aynı berberden yeni randevu alabilirsiniz." }
];

export function SupportView({ onBack }: Props) {
  const { colors, mode } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={onBack}>
        <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
        <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
      </Pressable>

      <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
        <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
        <Ionicons name="help-circle" size={28} color={colors.primary} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>Yardım Merkezi</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sık sorulan sorulara buradan ulaşabilirsin.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Sık Sorulan Sorular</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <Pressable
                key={idx}
                style={[styles.faqItem, { borderBottomColor: colors.divider }, idx === FAQ_ITEMS.length - 1 && styles.faqItemLast]}
                onPress={() => { lightHaptic(); setOpenIndex(isOpen ? null : idx); }}
              >
                <View style={styles.faqHeader}>
                  <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{item.q}</Text>
                  <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.primary} />
                </View>
                {isOpen && (
                  <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.a}</Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.contactCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color={colors.primary} />
        <View style={styles.contactTextWrap}>
          <Text style={[styles.contactTitle, { color: colors.textPrimary }]}>Hâlâ yardım mı lazım?</Text>
          <Text style={[styles.contactSubtitle, { color: colors.textMuted }]}>destek@berberrezrvasyon.com</Text>
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
  faqItem: { paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1 },
  faqItemLast: { borderBottomWidth: 0 },
  faqHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  faqQuestion: { fontSize: 14, fontWeight: "700", flex: 1, marginRight: 8 },
  faqAnswer: { marginTop: 8, lineHeight: 20 },
  contactCard: { marginTop: 16, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 12 },
  contactTextWrap: { flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: "700" },
  contactSubtitle: { marginTop: 2, fontSize: 13 }
});
