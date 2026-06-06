import { Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../theme/ThemeContext";
import { WebNavbar } from "../../components/web/WebNavbar";
import { selectionHaptic } from "../../utils/haptics";

type WebAuthRequiredParams = {
  barberName?: string;
};

export function WebAuthRequiredScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute();
  const { colors } = useTheme();
  const routeParams = route.params as WebAuthRequiredParams | undefined;

  function goToAuth(initialScreen: "login" | "register") {
    selectionHaptic();
    navigation.navigate("Auth", { initialScreen });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <WebNavbar />

      <View style={styles.contentWrap}>
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
            <Ionicons name="lock-closed-outline" size={42} color={colors.primary} />
          </View>

          <Text style={[styles.title, { color: colors.textPrimary }]}>Bu sayfaya erişmek için giriş yapınız</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {routeParams?.barberName ? `${routeParams.barberName} detaylarını görmek` : "Berber detaylarını görmek"} ve randevu oluşturmak için hesabına giriş yapabilir ya da kolayca kayıt olabilirsin.
          </Text>

          <View style={styles.actionsRow}>
            <Pressable style={[styles.primaryButton, { backgroundColor: colors.primary }]} onPress={() => goToAuth("login")}>
              <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
              <Text style={styles.primaryButtonText}>Giriş Yap</Text>
            </Pressable>

            <Pressable
              style={[styles.secondaryButton, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}
              onPress={() => goToAuth("register")}
            >
              <Ionicons name="person-add-outline" size={20} color={colors.primary} />
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>Kolayca Kayıt Ol</Text>
            </Pressable>
          </View>

          <Pressable style={styles.backHomeButton} onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("WebLanding")}>
            <Ionicons name="arrow-back-outline" size={16} color={colors.textMuted} />
            <Text style={[styles.backHomeText, { color: colors.textMuted }]}>Geri dön</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 56
  },
  card: {
    width: "100%",
    maxWidth: 620,
    borderWidth: 1,
    borderRadius: 30,
    paddingHorizontal: 34,
    paddingVertical: 36,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 }
  },
  iconWrap: {
    width: 86,
    height: 86,
    borderRadius: 28,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: -0.5
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 25,
    textAlign: "center",
    maxWidth: 500
  },
  actionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    marginTop: 28
  },
  primaryButton: {
    minWidth: 160,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.3,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900"
  },
  secondaryButton: {
    minWidth: 190,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "900"
  },
  backHomeButton: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  backHomeText: {
    fontSize: 13,
    fontWeight: "800"
  }
});
