import { useMemo, useState } from "react";
import { View, StyleSheet, Text, Pressable, Platform, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { BarberDashboardScreen } from "../screens/barber/BarberDashboardScreen";
import { BarberAppointmentsScreen } from "../screens/barber/BarberAppointmentsScreen";
import { BarberServicesScreen } from "../screens/barber/BarberServicesScreen";
import { BarberScheduleScreen } from "../screens/barber/BarberScheduleScreen";
import { BarberCreateRequestScreen } from "../screens/barber/BarberCreateRequestScreen";
import { BarberRequestStatusScreen } from "../screens/barber/BarberRequestStatusScreen";
import { selectionHaptic } from "../utils/haptics";

export type BarberRoutes = "dashboard" | "appointments" | "services" | "schedule";

const MENU_ITEMS: { id: BarberRoutes; label: string; icon: any }[] = [
  { id: "dashboard", label: "İstatistikler", icon: "stats-chart" },
  { id: "appointments", label: "Randevular", icon: "calendar" },
  { id: "services", label: "Hizmetler & Fiyatlar", icon: "cut" },
  { id: "schedule", label: "Çalışma Saatleri", icon: "time" }
];

export function BarberNavigator() {
  const { colors, mode } = useTheme();
  const { logout } = useAuth();
  const { ownedBarber, barberRequests } = useApp();
  const [currentRoute, setCurrentRoute] = useState<BarberRoutes>("dashboard");
  const [statusDismissed, setStatusDismissed] = useState(false);

  // En son talep
  const latestRequest = useMemo(() => {
    if (barberRequests.length === 0) return null;
    return barberRequests[0]; // zaten createdAt desc sıralı
  }, [barberRequests]);

  // Gösterilmesi gereken sonuç bildirimi (onay/ret, henüz görülmemiş)
  const unseenResult = useMemo(() => {
    if (statusDismissed) return null;
    return barberRequests.find(
      (r) => (r.status === "approved" || r.status === "rejected") && !r.seen
    ) ?? null;
  }, [barberRequests, statusDismissed]);

  // Bekleyen başvuru var mı?
  const hasPendingRequest = useMemo(() => {
    return barberRequests.some((r) => r.status === "pending");
  }, [barberRequests]);

  // Durum: 
  // 1. unseenResult varsa → sonuç bildirimi göster
  // 2. ownedBarber varsa → normal panel
  // 3. hasPendingRequest varsa → bekleme ekranı
  // 4. Hiçbiri yoksa → başvuru formu

  // 1) Görülmemiş sonuç bildirimi
  if (unseenResult) {
    return (
      <BarberRequestStatusScreen
        request={unseenResult}
        onDismiss={() => setStatusDismissed(true)}
      />
    );
  }

  // 2) Berber yoksa ve bekleyen talep varsa → bekleme ekranı
  if (!ownedBarber && hasPendingRequest) {
    return (
      <BarberRequestStatusScreen
        request={latestRequest!}
        onDismiss={() => {}}
      />
    );
  }

  // 3) Berber yoksa ve bekleyen talep yoksa → başvuru formu
  if (!ownedBarber) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.sidebar, { backgroundColor: colors.surfaceAlt, borderRightColor: colors.cardBorder }]}>
          <View style={styles.sidebarHeader}>
            <View style={[styles.logoWrap, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
              <Ionicons name="cut" size={24} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.sidebarTitle, { color: colors.textPrimary }]}>Berber Panel</Text>
              <Text style={[styles.sidebarSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                Yeni başvuru
              </Text>
            </View>
          </View>

          <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
            <View style={[styles.menuItemActive, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
              <Ionicons name="add-circle" size={20} color={colors.primary} />
              <Text style={[styles.menuItemText, { color: colors.primary, fontWeight: "700" }]}>Berber Başvurusu</Text>
            </View>
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
          <BarberCreateRequestScreen />
        </View>
      </View>
    );
  }

  // 4) Normal berber paneli
  function renderContent() {
    switch (currentRoute) {
      case "dashboard": return <BarberDashboardScreen />;
      case "appointments": return <BarberAppointmentsScreen />;
      case "services": return <BarberServicesScreen />;
      case "schedule": return <BarberScheduleScreen />;
      default: return null;
    }
  }

  const isWebLarge = Platform.OS === "web"; // Basitlik için web ise sidebar göster

  if (!isWebLarge) {
    // Mobilde yönetim paneline girilirse (Şimdilik web odaklı yapıyoruz, mobil görünüm scroll olabilir)
    // Mobil için basit bir top-tab veya alt-tab yapısı kurulabilir ama web için Sidebar öncelikli istendi.
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sol Menü (Sidebar) */}
      <View style={[styles.sidebar, { backgroundColor: colors.surfaceAlt, borderRightColor: colors.cardBorder }]}>
        <View style={styles.sidebarHeader}>
          <View style={[styles.logoWrap, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
            <Ionicons name="cut" size={24} color={colors.primary} />
          </View>
          <View>
            <Text style={[styles.sidebarTitle, { color: colors.textPrimary }]}>Berber Panel</Text>
            <Text style={[styles.sidebarSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {ownedBarber ? ownedBarber.name : "Berber ataması yok"}
            </Text>
          </View>
        </View>

        <ScrollView style={styles.sidebarMenu} showsVerticalScrollIndicator={false}>
          {MENU_ITEMS.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.menuItem,
                  isActive && [styles.menuItemActive, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]
                ]}
                onPress={() => { selectionHaptic(); setCurrentRoute(item.id); }}
              >
                <Ionicons
                  name={isActive ? item.icon : `${item.icon}-outline`}
                  size={20}
                  color={isActive ? colors.primary : colors.textMuted}
                />
                <Text style={[
                  styles.menuItemText,
                  { color: isActive ? colors.primary : colors.textMuted },
                  isActive && { fontWeight: "700" }
                ]}>
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
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

      {/* Sağ İçerik Alanı */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row", // Web Sidebar Layout
  },
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: "column",
  },
  sidebarHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 40,
    paddingHorizontal: 8,
  },
  logoWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  sidebarSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  sidebarMenu: {
    flex: 1,
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
    borderColor: "transparent",
  },
  menuItemActive: {
    borderWidth: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
  },
  sidebarFooter: {
    marginTop: 20,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutBtnText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 15,
  },
  content: {
    flex: 1,
    padding: 24,
    overflow: "hidden", // Scrollable content inside screens
  }
});
