import { useEffect, useState } from "react";
import { View, StyleSheet, Text, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { AdminCreateBarberScreen } from "../screens/admin/AdminCreateBarberScreen";
import { AdminBarberApprovalScreen } from "../screens/admin/AdminBarberApprovalScreen";
import { subscribeToAllBarberRequests } from "../services/barberRequestService";
import type { BarberRequest } from "../types/barberRequest";

type AdminRoute = "barbers" | "approval";

export function AdminNavigator() {
  const { colors, mode } = useTheme();
  const { logout } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<AdminRoute>("barbers");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToAllBarberRequests((requests: BarberRequest[]) => {
      setPendingCount(requests.filter((r) => r.status === "pending").length);
    });
    return unsubscribe;
  }, []);

  function renderContent() {
    switch (currentRoute) {
      case "barbers":
        return <AdminCreateBarberScreen />;
      case "approval":
        return <AdminBarberApprovalScreen />;
      default:
        return null;
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.sidebar, { backgroundColor: colors.surfaceAlt, borderRightColor: colors.cardBorder }]}>
        <View style={styles.sidebarHeader}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
            <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.sidebarTitle, { color: colors.textPrimary }]}>Platform Admin</Text>
            <Text style={[styles.sidebarSubtitle, { color: colors.textSecondary }]}>Berber ve sahip yönetimi</Text>
          </View>
        </View>

        <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
          {/* Berber Oluştur */}
          <Pressable
            style={[
              styles.menuItem,
              currentRoute === "barbers" && [styles.menuItemActive, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]
            ]}
            onPress={() => setCurrentRoute("barbers")}
          >
            <Ionicons
              name={currentRoute === "barbers" ? "business" : "business-outline"}
              size={20}
              color={currentRoute === "barbers" ? colors.primary : colors.textMuted}
            />
            <Text style={[styles.menuItemText, { color: currentRoute === "barbers" ? colors.primary : colors.textMuted }]}>
              Berber Oluştur
            </Text>
          </Pressable>

          {/* Berber Onay */}
          <Pressable
            style={[
              styles.menuItem,
              currentRoute === "approval" && [styles.menuItemActive, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]
            ]}
            onPress={() => setCurrentRoute("approval")}
          >
            <View style={styles.menuItemIconWrap}>
              <Ionicons
                name={currentRoute === "approval" ? "checkmark-done-circle" : "checkmark-done-circle-outline"}
                size={20}
                color={currentRoute === "approval" ? colors.primary : colors.textMuted}
              />
              {pendingCount > 0 ? (
                <View style={styles.badgeDot}>
                  <Text style={styles.badgeDotText}>{pendingCount > 9 ? "9+" : pendingCount}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.menuItemText, { color: currentRoute === "approval" ? colors.primary : colors.textMuted, flex: 1 }]}>
              Berber Onay
            </Text>
            {pendingCount > 0 ? (
              <View style={[styles.pendingBadge, { backgroundColor: mode === "dark" ? "rgba(251, 191, 36, 0.15)" : "#FFFBEB", borderColor: mode === "dark" ? "rgba(251, 191, 36, 0.3)" : "#FDE68A" }]}>
                <Text style={styles.pendingBadgeText}>{pendingCount} bekliyor</Text>
              </View>
            ) : null}
          </Pressable>
        </ScrollView>

        <View style={styles.sidebarFooter}>
          <Pressable
            style={[styles.logoutBtn, { backgroundColor: mode === "dark" ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2", borderColor: mode === "dark" ? "rgba(239, 68, 68, 0.2)" : "#FECACA" }]}
            onPress={() => logout()}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutBtnText}>Çıkış Yap</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row"
  },
  sidebar: {
    width: 290,
    borderRightWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
    paddingHorizontal: 8
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.3
  },
  sidebarSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  sidebarMenu: {
    flex: 1
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent"
  },
  menuItemActive: {
    borderWidth: 1
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "800"
  },
  menuItemIconWrap: {
    position: "relative"
  },
  badgeDot: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#F59E0B",
    borderRadius: 999,
    minWidth: 18,
    height: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4
  },
  badgeDotText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "900"
  },
  pendingBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  pendingBadgeText: {
    color: "#F59E0B",
    fontSize: 11,
    fontWeight: "800"
  },
  sidebarFooter: {
    marginTop: 20
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1
  },
  logoutBtnText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 15
  },
  content: {
    flex: 1,
    padding: 24,
    overflow: "hidden"
  }
});
