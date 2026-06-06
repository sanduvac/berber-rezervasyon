import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { mediumHaptic, successHaptic } from "../utils/haptics";

type Props = {
  onGoToRegister: () => void;
};

export function LoginScreen({ onGoToRegister }: Props) {
  const { colors, mode } = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const passwordRef = useRef<TextInput>(null);

  function getErrorMessage(code: string): string {
    switch (code) {
      case "auth/user-not-found":
      case "auth/invalid-credential":
        return "E-posta veya şifre hatalı.";
      case "auth/wrong-password":
        return "Şifre hatalı.";
      case "auth/invalid-email":
        return "Geçersiz e-posta adresi.";
      case "auth/too-many-requests":
        return "Çok fazla deneme yaptınız. Lütfen bekleyin.";
      default:
        return "Giriş yapılamadı. Lütfen tekrar deneyin.";
    }
  }

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      setError("Lütfen e-posta ve şifrenizi girin.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      successHaptic();
    } catch (err: any) {
      setError(getErrorMessage(err?.code));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert("Uyarı", "Lütfen önce e-posta adresinizi girin.");
      return;
    }
    mediumHaptic();
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      successHaptic();
      Alert.alert(
        "Başarılı",
        `${trimmedEmail} adresine şifre sıfırlama bağlantısı gönderildi. Lütfen e-posta kutunuzu kontrol edin.`
      );
    } catch (err: any) {
      const code = err?.code;
      if (code === "auth/user-not-found") {
        Alert.alert("Hata", "Bu e-posta ile kayıtlı bir hesap bulunamadı.");
      } else if (code === "auth/invalid-email") {
        Alert.alert("Hata", "Geçersiz e-posta adresi.");
      } else {
        Alert.alert("Hata", "Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin.");
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Hero */}
        <View style={styles.heroSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
            <Ionicons name="cut" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Berber Rezervasyon</Text>
          <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
            Hesabınıza giriş yapın
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>E-posta</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="ornek@email.com"
                placeholderTextColor={colors.searchPlaceholder}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance={mode}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Şifre</Text>
            <Pressable
              style={[styles.inputWrap, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder }]}
              onPress={() => passwordRef.current?.focus()}
            >
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="••••••••"
                placeholderTextColor={colors.searchPlaceholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                textContentType="oneTimeCode"
                autoComplete="off"
                keyboardAppearance={mode}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={18} color={colors.textMuted} />
              </Pressable>
            </Pressable>
          </View>

          <Pressable style={styles.forgotPasswordLink} onPress={handleForgotPassword}>
            <Ionicons name="key-outline" size={14} color={colors.primary} />
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>Şifremi Unuttum</Text>
          </Pressable>

          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Giriş Yap</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Register Link */}
        <View style={styles.bottomLink}>
          <Text style={[styles.bottomLinkText, { color: colors.textMuted }]}>Hesabınız yok mu? </Text>
          <Pressable onPress={onGoToRegister}>
            <Text style={[styles.bottomLinkAction, { color: colors.primary }]}>Kayıt Olun</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40
  },
  heroSection: {
    alignItems: "center",
    marginBottom: 28
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3
  },
  appSubtitle: {
    fontSize: 15,
    marginTop: 6
  },
  formCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    overflow: "hidden"
  },
  heroGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 999,
    top: -100,
    right: -60
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1
  },
  inputGroup: {
    marginBottom: 16
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    marginLeft: 2
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12
  },
  inputIcon: {
    marginRight: 8
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    paddingVertical: 14
  },
  eyeButton: {
    padding: 6
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 8
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  },
  bottomLink: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24
  },
  bottomLinkText: {
    fontSize: 14,
    fontWeight: "600"
  },
  bottomLinkAction: {
    fontSize: 14,
    fontWeight: "800"
  },
  forgotPasswordLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
    paddingVertical: 8
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "700"
  }
});
