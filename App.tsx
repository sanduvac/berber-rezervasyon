import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { type ComponentProps, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Animated, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import { mockBarbers } from "./src/data/mockBarbers";
import { AppointmentConfirmScreen } from "./src/screens/AppointmentConfirmScreen";
import { AppointmentDetailScreen } from "./src/screens/AppointmentDetailScreen";
import { AppointmentSelectionScreen } from "./src/screens/AppointmentSelectionScreen";
import { AppointmentsScreen } from "./src/screens/AppointmentsScreen";
import { FavoritesScreen } from "./src/screens/FavoritesScreen";
import { MapScreen } from "./src/screens/MapScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import type { NotificationSettings } from "./src/screens/ProfileScreen";
import { Barber, BarberService } from "./src/types/barber";
import { Appointment } from "./src/types/appointment";
import { BarberDetailScreen } from "./src/screens/BarberDetailScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import {
  cancelAppointmentReminderNotifications,
  scheduleAppointmentReminderNotifications
} from "./src/services/notificationService";
import { ThemeContext, ThemeMode, getThemeColors } from "./src/theme/ThemeContext";

type TabKey = "home" | "appointments" | "favorites" | "map" | "profile";
type TabIconName = ComponentProps<typeof Ionicons>["name"];

type RouteState =
  | { name: "home" }
  | { name: "detail"; barberId: string }
  | { name: "appointment"; barberId: string; serviceId: string; preselectedDate?: string; preselectedTime?: string }
  | { name: "confirm"; barberId: string; serviceId: string; date: string; time: string };

type ToastState = {
  message: string;
};

const TABS: { key: TabKey; label: string; icon: TabIconName; activeIcon: TabIconName }[] = [
  { key: "home", label: "Ana Sayfa", icon: "home-outline", activeIcon: "home" },
  { key: "appointments", label: "Randevularım", icon: "calendar-outline", activeIcon: "calendar" },
  { key: "favorites", label: "Favorilerim", icon: "heart-outline", activeIcon: "heart" },
  { key: "map", label: "Harita", icon: "map-outline", activeIcon: "map" },
  { key: "profile", label: "Profilim", icon: "person-outline", activeIcon: "person" }
];

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const colors = useMemo(() => getThemeColors(themeMode), [themeMode]);
  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const [barbers, setBarbers] = useState<Barber[]>(mockBarbers);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    allNotifications: true,
    appointmentReminders: true,
    systemNotifications: true
  });
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [favoriteBarberIds, setFavoriteBarberIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [route, setRoute] = useState<RouteState>({ name: "home" });
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastProgress = useRef(new Animated.Value(1)).current;
  const remindersEnabled =
    notificationSettings.allNotifications && notificationSettings.appointmentReminders;

  // Fotoğrafları uygulama açılır açılmaz önbelleğe al
  useEffect(() => {
    barbers.forEach((barber) => {
      if (barber.coverImageUrl) {
        Image.prefetch(barber.coverImageUrl);
      }
    });
  }, []);

  const activeBarber = useMemo(() => {
    if (route.name === "home") {
      return null;
    }

    return barbers.find((barber) => barber.id === route.barberId) ?? null;
  }, [barbers, route]);

  const activeServiceId = route.name === "appointment" || route.name === "confirm" ? route.serviceId : null;

  const activeService = useMemo<BarberService | null>(() => {
    if (!activeBarber || !activeServiceId) {
      return null;
    }

    return activeBarber.services.find((service) => service.id === activeServiceId) ?? null;
  }, [activeBarber, activeServiceId]);

  const selectedAppointment = useMemo(
    () => appointments.find((appointment) => appointment.id === selectedAppointmentId) ?? null,
    [appointments, selectedAppointmentId]
  );

  useEffect(() => {
    if (!toast) {
      return;
    }

    toastProgress.setValue(1);

    const animation = Animated.timing(toastProgress, {
      toValue: 0,
      duration: 5000,
      useNativeDriver: false
    });

    animation.start();
    const timeoutId = setTimeout(() => setToast(null), 5000);

    return () => {
      animation.stop();
      clearTimeout(timeoutId);
    };
  }, [toast, toastProgress]);

  useEffect(() => {
    if (remindersEnabled) {
      return;
    }

    const appointmentsWithReminders = appointments.filter(
      (appointment) => (appointment.reminderNotificationIds?.length ?? 0) > 0
    );

    if (appointmentsWithReminders.length === 0) {
      return;
    }

    (async () => {
      await Promise.all(
        appointmentsWithReminders.map((appointment) =>
          cancelAppointmentReminderNotifications(appointment.reminderNotificationIds)
        )
      );

      setAppointments((previous) =>
        previous.map((appointment) =>
          appointment.reminderNotificationIds?.length
            ? { ...appointment, reminderNotificationIds: [] }
            : appointment
        )
      );
    })();
  }, [appointments, remindersEnabled]);

  function showSuccessToast(message: string) {
    setToast({ message });
  }

  function handleTabPress(tab: TabKey) {
    setActiveTab(tab);

    if (tab !== "home") {
      setRoute({ name: "home" });
      setSelectedAppointmentId(null);
      return;
    }

    if (route.name !== "home") {
      setRoute({ name: "home" });
    }

    setSelectedAppointmentId(null);
  }

  function toggleFavorite(barberId: string) {
    setFavoriteBarberIds((previous) =>
      previous.includes(barberId)
        ? previous.filter((id) => id !== barberId)
        : [...previous, barberId]
    );
  }

  function bookAppointment(barberId: string, date: string, time: string) {
    setBarbers((previous) =>
      previous.map((barber) =>
        barber.id === barberId
          ? {
            ...barber,
            availability: barber.availability.map((day) =>
              day.date === date
                ? {
                  ...day,
                  slots: day.slots.map((slot) =>
                    slot.time === time ? { ...slot, isBooked: true } : slot
                  )
                }
                : day
            )
          }
          : barber
      )
    );
  }

  async function cancelAppointment(appointment: Appointment) {
    await cancelAppointmentReminderNotifications(appointment.reminderNotificationIds);

    setAppointments((previous) => previous.filter((item) => item.id !== appointment.id));
    setBarbers((previous) =>
      previous.map((barber) =>
        barber.id === appointment.barberId
          ? {
            ...barber,
            availability: barber.availability.map((day) =>
              day.date === appointment.date
                ? {
                  ...day,
                  slots: day.slots.map((slot) =>
                    slot.time === appointment.time ? { ...slot, isBooked: false } : slot
                  )
                }
                : day
            )
          }
          : barber
      )
    );
  }

  const toastBarWidth = toastProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"]
  });

  const homeStackContent = (() => {
    if (route.name === "home") {
      return (
        <HomeScreen
          barbers={barbers}
          favoriteBarberIds={favoriteBarberIds}
          onToggleFavorite={toggleFavorite}
          onSelectBarber={(barber) => setRoute({ name: "detail", barberId: barber.id })}
        />
      );
    }

    if (!activeBarber) {
      return (
        <HomeScreen
          barbers={barbers}
          favoriteBarberIds={favoriteBarberIds}
          onToggleFavorite={toggleFavorite}
          onSelectBarber={(barber) => setRoute({ name: "detail", barberId: barber.id })}
        />
      );
    }

    if (route.name === "detail") {
      return (
        <BarberDetailScreen
          barber={activeBarber}
          onBack={() => setRoute({ name: "home" })}
          isFavorite={favoriteBarberIds.includes(activeBarber.id)}
          onToggleFavorite={toggleFavorite}
          onStartAppointment={(service) =>
            setRoute({
              name: "appointment",
              barberId: activeBarber.id,
              serviceId: service.id
            })
          }
        />
      );
    }

    if (route.name === "appointment") {
      if (!activeService) {
        return (
          <BarberDetailScreen
            barber={activeBarber}
            onBack={() => setRoute({ name: "home" })}
            isFavorite={favoriteBarberIds.includes(activeBarber.id)}
            onToggleFavorite={toggleFavorite}
            onStartAppointment={(service) =>
              setRoute({
                name: "appointment",
                barberId: activeBarber.id,
                serviceId: service.id
              })
            }
          />
        );
      }

      return (
        <AppointmentSelectionScreen
          barber={activeBarber}
          service={activeService}
          initialDate={route.preselectedDate}
          initialTime={route.preselectedTime}
          onBack={() => setRoute({ name: "detail", barberId: activeBarber.id })}
          onContinue={(date, time) =>
            setRoute({
              name: "confirm",
              barberId: activeBarber.id,
              serviceId: activeService.id,
              date,
              time
            })
          }
        />
      );
    }

    if (!activeService) {
      return (
        <BarberDetailScreen
          barber={activeBarber}
          onBack={() => setRoute({ name: "home" })}
          isFavorite={favoriteBarberIds.includes(activeBarber.id)}
          onToggleFavorite={toggleFavorite}
          onStartAppointment={(service) =>
            setRoute({
              name: "appointment",
              barberId: activeBarber.id,
              serviceId: service.id
            })
          }
        />
      );
    }

    return (
      <AppointmentConfirmScreen
        barber={activeBarber}
        service={activeService}
        date={route.date}
        time={route.time}
        onBack={() =>
          setRoute({
            name: "appointment",
            barberId: route.barberId,
            serviceId: route.serviceId,
            preselectedDate: route.date,
            preselectedTime: route.time
          })
        }
        onCancel={() => setRoute({ name: "detail", barberId: route.barberId })}
        onConfirm={async () => {
          const createdAt = Date.now();
          let reminderNotificationIds: string[] = [];

          if (remindersEnabled) {
            try {
              reminderNotificationIds = await scheduleAppointmentReminderNotifications({
                barberName: activeBarber.name,
                serviceName: activeService.name,
                date: route.date,
                time: route.time
              });
            } catch {
              reminderNotificationIds = [];
            }
          }

          bookAppointment(route.barberId, route.date, route.time);
          setAppointments((previous) => [
            {
              id: `${createdAt}`,
              barberId: route.barberId,
              serviceId: route.serviceId,
              date: route.date,
              time: route.time,
              createdAt,
              reminderNotificationIds
            },
            ...previous
          ]);
          showSuccessToast("Randevunuz başarıyla alındı.");
          setActiveTab("home");
          setRoute({ name: "home" });
        }}
      />
    );
  })();

  const tabContent = (() => {
    if (activeTab === "home") {
      return homeStackContent;
    }

    if (activeTab === "appointments") {
      if (selectedAppointment) {
        const barber = barbers.find((item) => item.id === selectedAppointment.barberId);
        const service = barber?.services.find((item) => item.id === selectedAppointment.serviceId);

        if (barber && service) {
          return (
            <AppointmentDetailScreen
              appointment={selectedAppointment}
              barber={barber}
              service={service}
              onBack={() => setSelectedAppointmentId(null)}
              onCancel={() => {
                Alert.alert("Randevu İptali", "Bu randevuyu iptal etmek istiyor musun?", [
                  { text: "Vazgeç", style: "cancel" },
                  {
                    text: "İptal Et",
                    style: "destructive",
                    onPress: async () => {
                      await cancelAppointment(selectedAppointment);
                      setSelectedAppointmentId(null);
                      showSuccessToast("Randevu iptal edildi.");
                    }
                  }
                ]);
              }}
            />
          );
        }
      }

      return (
        <AppointmentsScreen
          appointments={appointments}
          barbers={barbers}
          onOpenAppointment={(appointmentId) => setSelectedAppointmentId(appointmentId)}
        />
      );
    }

    if (activeTab === "favorites") {
      return (
        <FavoritesScreen
          barbers={barbers}
          favoriteBarberIds={favoriteBarberIds}
          onToggleFavorite={toggleFavorite}
          onSelectBarber={(barber) => {
            setActiveTab("home");
            setRoute({ name: "detail", barberId: barber.id });
          }}
        />
      );
    }

    if (activeTab === "map") {
      return (
        <MapScreen
          barbers={barbers}
          onOpenBarber={(barberId) => {
            setActiveTab("home");
            setRoute({ name: "detail", barberId });
          }}
        />
      );
    }

    return (
      <ProfileScreen
        notificationSettings={notificationSettings}
        onNotificationSettingsChange={setNotificationSettings}
      />
    );
  })();

  return (
    <ThemeContext.Provider value={{ mode: themeMode, colors, toggleTheme }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style={colors.statusBarStyle} />
        <View style={styles.page}>{tabContent}</View>
        <View style={[styles.tabBar, {
          backgroundColor: colors.tabBarBg,
          borderColor: colors.tabBarBorder
        }]}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;

            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.tabItem,
                  isActive && [styles.tabItemActive, {
                    backgroundColor: colors.tabActiveBg,
                    borderColor: colors.primaryBorder
                  }]
                ]}
                onPress={() => handleTabPress(tab.key)}
              >
                <View style={[
                  styles.tabIconWrap,
                  isActive && [styles.tabIconWrapActive, { backgroundColor: colors.tabActiveIconBg }]
                ]}>
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={18}
                    color={isActive ? colors.textOnPrimary : colors.tabInactiveText}
                    style={styles.tabIcon}
                  />
                </View>
                <Text
                  style={[
                    styles.tabLabel,
                    { color: colors.tabInactiveText },
                    isActive && [styles.tabLabelActive, { color: colors.tabActiveText }]
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.72}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {toast ? (
          <View style={[styles.toastContainer, {
            backgroundColor: themeMode === "dark" ? "rgba(108, 92, 231, 0.92)" : "rgba(108, 92, 231, 0.95)"
          }]}>
            <View style={styles.toastIconRow}>
              <View style={styles.toastIconCircle}>
                <Text style={styles.toastIconText}>✓</Text>
              </View>
              <Text style={styles.toastText}>{toast.message}</Text>
            </View>
            <View style={styles.toastTrack}>
              <Animated.View style={[styles.toastProgress, { width: toastBarWidth }]} />
            </View>
          </View>
        ) : null}
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0
  },
  tabBar: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    paddingVertical: 7,
    paddingHorizontal: 4,
    gap: 3
  },
  tabItemActive: {
    borderWidth: 1
  },
  tabIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center"
  },
  tabIconWrapActive: {},
  tabLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    textAlign: "center"
  },
  tabIcon: {
    marginBottom: 0
  },
  tabLabelActive: {
    fontWeight: "700"
  },
  toastContainer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 88,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(108, 92, 231, 0.5)",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8
  },
  toastIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  toastIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center"
  },
  toastIconText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13
  },
  toastText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
    flex: 1
  },
  toastTrack: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    overflow: "hidden"
  },
  toastProgress: {
    height: "100%",
    backgroundColor: "#00D2FF"
  }
});
