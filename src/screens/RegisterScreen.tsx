import { useRef, useState } from "react";
import {
  ActivityIndicator,
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

type Props = {
  onGoToLogin: () => void;
};

export function RegisterScreen({ onGoToLogin }: Props) {
  const { colors, mode } = useTheme();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  function getErrorMessage(code: string): string {
    switch (code) {
      case "auth/email-already-in-use":
        return "Bu e-posta zaten kullanılıyor.";
      case "auth/invalid-email":
        return "Geçersiz e-posta adresi.";
      case "auth/weak-password":
        return "Şifre en az 6 karakter olmalıdır.";
      default:
        return "Kayıt olunamadı. Lütfen tekrar deneyin.";
    }
  }

  async function handleRegister() {
    if (!name.trim()) {
      setError("Lütfen adınızı girin.");
      return;
    }
    if (!email.trim()) {
      setError("Lütfen e-posta adresinizi girin.");
      return;
    }
    if (!password.trim()) {
      setError("Lütfen bir şifre belirleyin.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
    } catch (err: any) {
      setError(getErrorMessage(err?.code));
    } finally {
      setLoading(false);
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
            <Ionicons name="person-add" size={36} color={colors.primary} />
          </View>
          <Text style={[styles.appName, { color: colors.textPrimary }]}>Hesap Oluştur</Text>
          <Text style={[styles.appSubtitle, { color: colors.textSecondary }]}>
            Bilgilerinizi girerek kayıt olun
          </Text>
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={[styles.heroGlow, { backgroundColor: colors.glowSecondary }]} />

          {error ? (
            <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Ad Soyad</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder }]}>
              <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Adınız Soyadınız"
                placeholderTextColor={colors.searchPlaceholder}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                keyboardAppearance={mode}
              />
            </View>
          </View>

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
                placeholder="En az 6 karakter"
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

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Şifre Tekrar</Text>
            <Pressable
              style={[styles.inputWrap, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder }]}
              onPress={() => confirmPasswordRef.current?.focus()}
            >
              <Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                ref={confirmPasswordRef}
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Şifrenizi tekrar girin"
                placeholderTextColor={colors.searchPlaceholder}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                textContentType="oneTimeCode"
                autoComplete="off"
                keyboardAppearance={mode}
              />
            </Pressable>
          </View>

          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Kayıt Ol</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Login Link */}
        <View style={styles.bottomLink}>
          <Text style={[styles.bottomLinkText, { color: colors.textMuted }]}>Zaten hesabınız var mı? </Text>
          <Pressable onPress={onGoToLogin}>
            <Text style={[styles.bottomLinkAction, { color: colors.primary }]}>Giriş Yapın</Text>
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
  }
});
