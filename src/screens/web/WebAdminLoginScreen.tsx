import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, Image, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";

export function WebAdminLoginScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const navigation = useNavigation<any>();
  const { login, logout } = useAuth();
  const { userProfile } = useApp();

  async function handleAdminLogin() {
    if (!email || !password) {
      setErrorMsg("Lütfen e-posta ve şifrenizi girin.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    
    try {
      await login(email, password);
      // Login olduktan sonra AppContext otomatik olarak userProfile'ı çekecektir.
      // Eğer role === "barber" değilse reddedeceğiz ama bu asenkron olduğu için
      // en temizi AppNavigator'da role bazlı redirect yapmaktır.
      // Firebase auth login sonrası AppNavigator zaten otomatik "BarberNavigator"a yönlendirecek.
      // Ancak müşteri giriş yaparsa, onu engelleyip çıkartmamız gerekir.
      // (Bu kontrol AppNavigator veya burada useEffect ile yapılabilir)
    } catch (err: any) {
      setErrorMsg("Giriş başarısız. Bilgilerinizi kontrol edin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {isDesktop && (
        <View style={styles.leftPanel}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=2074&auto=format&fit=crop" }} 
            style={styles.bgImage} 
          />
          <View style={styles.overlay}>
            <Text style={styles.overlayTitle}>Berber Rezervasyon</Text>
            <Text style={styles.overlaySubtitle}>Dükkanınızı dijitale taşıyın, randevularınızı kolayca yönetin.</Text>
          </View>
        </View>
      )}

      <View style={styles.rightPanel}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#64748B" />
          <Text style={styles.backText}>Siteye Dön</Text>
        </Pressable>

        <View style={styles.formContainer}>
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Ionicons name="shield-checkmark" size={28} color="#fff" />
            </View>
            <Text style={styles.title}>Yönetici Girişi</Text>
            <Text style={styles.subtitle}>Berber yönetim paneline erişmek için yetkili bilgilerinizle giriş yapın.</Text>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-Posta Adresi</Text>
            <TextInput
              style={styles.input}
              placeholder="admin@berber.com"
              placeholderTextColor="#94A3B8"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#94A3B8"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Pressable style={styles.loginBtn} onPress={handleAdminLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>Giriş Yap</Text>}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#fff",
  },
  leftPanel: {
    flex: 1,
  },
  bgImage: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    padding: 60,
    justifyContent: "flex-end",
  },
  overlayTitle: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
    letterSpacing: -1,
    marginBottom: 16,
  },
  overlaySubtitle: {
    color: "#CBD5E1",
    fontSize: 20,
    lineHeight: 32,
    maxWidth: 500,
  },
  rightPanel: {
    flex: 1,
    maxWidth: 600,
    width: "100%",
    backgroundColor: "#fff",
    padding: 40,
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: 40,
    left: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 15,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  header: {
    marginBottom: 40,
  },
  iconBox: {
    width: 56,
    height: 56,
    backgroundColor: "#0F172A",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#64748B",
    lineHeight: 24,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  errorText: {
    color: "#EF4444",
    fontWeight: "500",
    fontSize: 14,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
    outlineStyle: "none",
  } as any,
  loginBtn: {
    backgroundColor: "#0F172A",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  loginBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  }
});
