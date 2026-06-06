import React from "react";
import { View, Text, StyleSheet, Pressable, Platform, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useApp } from "../../context/AppContext";
import { selectionHaptic } from "../../utils/haptics";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

export function WebNavbar() {
  const { colors, mode } = useTheme();
  const { user, logout } = useAuth();
  const { userProfile } = useApp();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();

  const isMobileView = width < 768;

  return (
    <View style={[styles.navbar, { backgroundColor: colors.cardBg, borderBottomColor: colors.cardBorder }]}>
      <View style={styles.container}>
        {/* Sol Taraf: Logo */}
        <Pressable style={styles.logoWrap} onPress={() => { selectionHaptic(); navigation.navigate("WebLanding"); }}>
          <View style={[styles.iconBox, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
            <Ionicons name="cut" size={20} color={colors.primary} />
          </View>
          <Text style={[styles.logoText, { color: colors.textPrimary }]}>Berber Rezervasyon</Text>
        </Pressable>

        {/* Sağ Taraf: Linkler */}
        <View style={styles.linksWrap}>
          {isMobileView ? (
            <Pressable style={styles.menuBtn}>
              <Ionicons name="menu" size={28} color={colors.textPrimary} />
            </Pressable>
          ) : (
            <>
              {/* Sadece çıkış yapmışsa "Yönetici Girişi" butonunu göster */}
              {!user && (
                <Pressable
                  style={[styles.adminBtn, { backgroundColor: mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "#F1F5F9" }]}
                  onPress={() => { selectionHaptic(); navigation.navigate("WebAdminLogin"); }}
                >
                  <Ionicons name="shield-checkmark" size={16} color={colors.textSecondary} />
                  <Text style={[styles.adminBtnText, { color: colors.textSecondary }]}>Yönetici Girişi</Text>
                </Pressable>
              )}

              {user ? (
                <View style={styles.userRow}>
                  <Text style={[styles.greeting, { color: colors.textPrimary }]}>
                    Merhaba, {userProfile?.name || "Kullanıcı"}
                  </Text>
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate("AppointmentsTab")}>
                    <Text style={styles.actionBtnText}>Randevularım</Text>
                  </Pressable>
                  <Pressable style={styles.logoutBtn} onPress={logout}>
                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                  </Pressable>
                </View>
              ) : (
                <View style={styles.authRow}>
                  <Pressable style={styles.loginBtn} onPress={() => navigation.navigate("Auth", { initialScreen: "login" })}>
                    <Text style={[styles.loginText, { color: colors.textPrimary }]}>Giriş Yap</Text>
                  </Pressable>
                  <Pressable style={[styles.registerBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate("Auth", { initialScreen: "register" })}>
                    <Text style={styles.registerText}>Kayıt Ol</Text>
                  </Pressable>
                </View>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    height: 70,
    borderBottomWidth: 1,
    justifyContent: "center",
  },
  container: {
    maxWidth: 1200,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  logoWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  linksWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  menuBtn: {
    padding: 8,
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  adminBtnText: {
    fontSize: 13,
    fontWeight: "600",
  },
  authRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  loginBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  loginText: {
    fontWeight: "600",
    fontSize: 14,
  },
  registerBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  registerText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  logoutBtn: {
    padding: 8,
  }
});
