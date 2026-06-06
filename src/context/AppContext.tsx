import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { Barber, BarberService } from "../types/barber";
import { Appointment } from "../types/appointment";
import { NotificationSettings, PrivacySettings, UserRole } from "../types/settings";
import {
    cancelAppointmentReminderNotifications,
    scheduleAppointmentReminderNotifications
} from "../services/notificationService";
import { useAuth } from "./AuthContext";
import {
    getUserDocument,
    updateUserDocument,
    addAppointment as firestoreAddAppointment,
    addBarberAppointment as firestoreAddBarberAppointment,
    deleteAppointment as firestoreDeleteAppointment,
    updateAppointment as firestoreUpdateAppointment,
    subscribeToAppointments,
    subscribeToBarberAppointments,
    addReview as firestoreAddReview,
    type FirestoreReview
} from "../services/firestoreService";
import { subscribeToBarbers, updateBarberDocument } from "../services/barberService";
import { subscribeToOwnerRequests } from "../services/barberRequestService";
import type { BarberRequest } from "../types/barberRequest";
import { successHaptic, errorHaptic } from "../utils/haptics";

type ToastState = {
    message: string;
    type: "success" | "error";
};

type AppContextValue = {
    barbers: Barber[];
    ownedBarber: Barber | null;
    barberRequests: BarberRequest[];
    appointments: Appointment[];
    favoriteBarberIds: string[];
    notificationSettings: NotificationSettings;
    privacySettings: PrivacySettings;
    profilePhotoUri: string | null;
    userProfile: { name: string; email: string; phone: string; birthday: string; gender: string; role: UserRole } | null;
    dataLoaded: boolean;
    toggleFavorite: (barberId: string) => void;
    bookAppointment: (barberId: string, date: string, time: string) => void;
    cancelAppointment: (appointment: Appointment) => Promise<void>;
    confirmAppointment: (params: {
        barberId: string;
        serviceId: string;
        date: string;
        time: string;
        barberName: string;
        serviceName: string;
    }) => Promise<void>;
    setNotificationSettings: (settings: NotificationSettings) => void;
    setPrivacySettings: (settings: PrivacySettings) => void;
    setProfilePhotoUri: (uri: string | null) => void;
    updateOwnedBarber: (data: Partial<Omit<Barber, "id" | "ownerUid">>) => Promise<void>;
    updateUserProfile: (data: { name?: string; phone?: string; birthday?: string; gender?: string; role?: UserRole }) => void;
    showSuccessToast: (message: string) => void;
    getBarber: (barberId: string) => Barber | undefined;
    getService: (barberId: string, serviceId: string) => BarberService | undefined;
    getAppointment: (appointmentId: string) => Appointment | undefined;
    submitReview: (params: { barberId: string; appointmentId: string; rating: number; comment: string }) => Promise<void>;
};

const AppContext = createContext<AppContextValue>(null as any);

export function useApp() {
    return useContext(AppContext);
}

export function AppProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [barbers, setBarbers] = useState<Barber[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [favoriteBarberIds, setFavoriteBarberIds] = useState<string[]>([]);
    const [notificationSettings, setNotificationSettingsState] = useState<NotificationSettings>({
        allNotifications: true,
        appointmentReminders: true,
        systemNotifications: true
    });
    const [privacySettings, setPrivacySettingsState] = useState<PrivacySettings>({
        biometricLogin: false,
        twoFactorAuth: false,
        locationSharing: true,
        analyticsData: true
    });
    const [profilePhotoUri, setProfilePhotoUriState] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<{ name: string; email: string; phone: string; birthday: string; gender: string; role: UserRole } | null>(null);
    const [toast, setToast] = useState<ToastState | null>(null);
    const toastProgress = useRef(new Animated.Value(1)).current;
    const [dataLoaded, setDataLoaded] = useState(false);
    const [barberRequests, setBarberRequests] = useState<BarberRequest[]>([]);

    // Sonsuz döngüyü önlemek için ref kullanıyoruz
    const reminderCleanupDone = useRef(false);

    const remindersEnabled =
        notificationSettings.allNotifications && notificationSettings.appointmentReminders;

    const ownedBarber = useMemo(() => {
        if (!user) return null;
        return barbers.find((barber) => barber.ownerUid === user.uid) ?? null;
    }, [barbers, user]);

    useEffect(() => {
        const unsubscribe = subscribeToBarbers(setBarbers);
        return unsubscribe;
    }, []);

    // Berber sahibi ise kendi taleplerini dinle
    useEffect(() => {
        if (!user || userProfile?.role !== "barber") {
            setBarberRequests([]);
            return;
        }
        const unsubscribe = subscribeToOwnerRequests(user.uid, setBarberRequests);
        return unsubscribe;
    }, [user, userProfile?.role]);

    // Fotoğrafları uygulama açılır açılmaz önbelleğe al
    useEffect(() => {
        barbers.forEach((barber) => {
            if (barber.coverImageUrl) {
                Image.prefetch(barber.coverImageUrl);
            }
        });
    }, [barbers]);

    // Kullanıcı verisini Firestore'dan yükle
    useEffect(() => {
        if (!user) {
            setDataLoaded(false);
            setAppointments([]);
            setFavoriteBarberIds([]);
            setProfilePhotoUriState(null);
            setUserProfile(null);
            return;
        }

        let cancelled = false;

        (async () => {
            try {
                const userDoc = await getUserDocument(user.uid);
                if (cancelled) return;

                if (userDoc) {
                    setFavoriteBarberIds(userDoc.favoriteBarberIds ?? []);
                    setNotificationSettingsState(userDoc.notificationSettings ?? {
                        allNotifications: true,
                        appointmentReminders: true,
                        systemNotifications: true
                    });
                    setPrivacySettingsState(userDoc.privacySettings ?? {
                        biometricLogin: false,
                        twoFactorAuth: false,
                        locationSharing: true,
                        analyticsData: true
                    });
                    setProfilePhotoUriState(userDoc.profilePhotoUri ?? null);
                    setUserProfile({
                        name: userDoc.name ?? user.displayName ?? "",
                        email: userDoc.email ?? user.email ?? "",
                        phone: userDoc.phone ?? "",
                        birthday: userDoc.birthday ?? "",
                        gender: userDoc.gender ?? "",
                        role: userDoc.role ?? "customer"
                    });
                } else {
                    setUserProfile({
                        name: user.displayName ?? "",
                        email: user.email ?? "",
                        phone: "",
                        birthday: "",
                        gender: "",
                        role: "customer"
                    });
                }
                setDataLoaded(true);
            } catch (err) {
                console.error("Kullanıcı verisi yüklenemedi:", err);
                setDataLoaded(true);
            }
        })();

        return () => { cancelled = true; };
    }, [user]);

    // Randevuları gerçek zamanlı dinle
    useEffect(() => {
        if (!user) return;

        if (userProfile?.role === "barber") {
            if (!ownedBarber) {
                setAppointments([]);
                return;
            }

            return subscribeToBarberAppointments(ownedBarber.id, (firestoreAppointments) => {
                setAppointments(firestoreAppointments);
            });
        }

        const unsubscribe = subscribeToAppointments(user.uid, (firestoreAppointments) => {
            setAppointments(firestoreAppointments);
        });

        return unsubscribe;
    }, [user, userProfile?.role, ownedBarber]);

    useEffect(() => {
        if (!toast) return;
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

    // Bildirim hatırlatmaları kapatıldığında mevcut hatırlatmaları iptal et
    // useRef ile sonsuz döngü önleniyor
    useEffect(() => {
        if (remindersEnabled) {
            reminderCleanupDone.current = false;
            return;
        }
        if (reminderCleanupDone.current) return;

        const appointmentsWithReminders = appointments.filter(
            (appointment) => (appointment.reminderNotificationIds?.length ?? 0) > 0
        );
        if (appointmentsWithReminders.length === 0) return;

        reminderCleanupDone.current = true;
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

    const showSuccessToast = useCallback((message: string) => {
        setToast({ message, type: "success" });
    }, []);

    const showErrorToast = useCallback((message: string) => {
        setToast({ message, type: "error" });
        errorHaptic();
    }, []);

    const updateOwnedBarber = useCallback(async (data: Partial<Omit<Barber, "id" | "ownerUid">>) => {
        if (!ownedBarber) {
            showErrorToast("Bu yönetici hesabına atanmış bir berber yok.");
            return;
        }

        await updateBarberDocument(ownedBarber.id, data);
        setBarbers((previous) =>
            previous.map((barber) =>
                barber.id === ownedBarber.id ? { ...barber, ...data } : barber
            )
        );
    }, [ownedBarber, showErrorToast]);

    const toggleFavorite = useCallback((barberId: string) => {
        setFavoriteBarberIds((previous) => {
            const next = previous.includes(barberId)
                ? previous.filter((id) => id !== barberId)
                : [...previous, barberId];

            // Firestore'a kaydet
            if (user) {
                updateUserDocument(user.uid, { favoriteBarberIds: next }).catch(console.error);
            }
            return next;
        });
    }, [user]);

    const bookAppointment = useCallback((barberId: string, date: string, time: string) => {
        const barber = barbers.find((item) => item.id === barberId);
        const nextAvailability = barber?.availability.map((day) =>
            day.date === date
                ? {
                    ...day,
                    slots: day.slots.map((slot) =>
                        slot.time === time ? { ...slot, isBooked: true } : slot
                    )
                }
                : day
        );

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

        if (nextAvailability) {
            updateBarberDocument(barberId, { availability: nextAvailability }).catch(console.error);
        }
    }, [barbers]);

    const cancelAppointmentFn = useCallback(async (appointment: Appointment) => {
        await cancelAppointmentReminderNotifications(appointment.reminderNotificationIds);

        // Firestore'da randevu durumunu güncelle ve sil
        if (user) {
            await firestoreDeleteAppointment(user.uid, appointment.id);
        }

        const barber = barbers.find((item) => item.id === appointment.barberId);
        const nextAvailability = barber?.availability.map((day) =>
            day.date === appointment.date
                ? {
                    ...day,
                    slots: day.slots.map((slot) =>
                        slot.time === appointment.time ? { ...slot, isBooked: false } : slot
                    )
                }
                : day
        );

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

        if (nextAvailability) {
            await updateBarberDocument(appointment.barberId, { availability: nextAvailability });
        }
        errorHaptic();
    }, [user, barbers]);

    const confirmAppointment = useCallback(async (params: {
        barberId: string;
        serviceId: string;
        date: string;
        time: string;
        barberName: string;
        serviceName: string;
    }) => {
        const createdAt = Date.now();
        let reminderNotificationIds: string[] = [];

        if (remindersEnabled) {
            try {
                reminderNotificationIds = await scheduleAppointmentReminderNotifications({
                    barberName: params.barberName,
                    serviceName: params.serviceName,
                    date: params.date,
                    time: params.time
                });
            } catch {
                reminderNotificationIds = [];
            }
        }

        bookAppointment(params.barberId, params.date, params.time);

        // Firestore'a kaydet
        if (user) {
            const appointment = {
                customerUid: user.uid,
                customerName: user.displayName ?? user.email ?? "Müşteri",
                barberId: params.barberId,
                serviceId: params.serviceId,
                date: params.date,
                time: params.time,
                createdAt,
                reminderNotificationIds,
                status: "upcoming"
            } as const;

            await firestoreAddAppointment(user.uid, appointment);
            await firestoreAddBarberAppointment(appointment);
        }

        successHaptic();
        showSuccessToast("Randevunuz başarıyla alındı.");
    }, [remindersEnabled, bookAppointment, showSuccessToast, user]);

    const setNotificationSettings = useCallback((settings: NotificationSettings) => {
        setNotificationSettingsState(settings);
        if (user) {
            updateUserDocument(user.uid, { notificationSettings: settings }).catch(console.error);
        }
    }, [user]);

    const setPrivacySettings = useCallback((settings: PrivacySettings) => {
        setPrivacySettingsState(settings);
        if (user) {
            updateUserDocument(user.uid, { privacySettings: settings }).catch(console.error);
        }
    }, [user]);

    const setProfilePhotoUri = useCallback((uri: string | null) => {
        setProfilePhotoUriState(uri);
        if (user) {
            updateUserDocument(user.uid, { profilePhotoUri: uri }).catch(console.error);
        }
    }, [user]);

    const updateUserProfile = useCallback(async (data: { name?: string; phone?: string; birthday?: string; gender?: string; role?: UserRole }) => {
        if (!user) return;
        try {
            await updateUserDocument(user.uid, data);
            setUserProfile(prev => prev ? { ...prev, ...data } : null);
            showSuccessToast("Profil güncellendi.");
        } catch (err) {
            showErrorToast("Profil güncellenirken hata oluştu.");
        }
    }, [user, showSuccessToast, showErrorToast]);

    const submitReview = useCallback(async (params: { barberId: string; appointmentId: string; rating: number; comment: string }) => {
        if (!user || !userProfile) return;

        const review: FirestoreReview = {
            barberId: params.barberId,
            appointmentId: params.appointmentId,
            rating: params.rating,
            comment: params.comment,
            userName: userProfile.name || "Anonim",
            createdAt: Date.now()
        };

        await firestoreAddReview(user.uid, review);

        // Randevuyu değerlendirildi olarak işaretle
        await firestoreUpdateAppointment(user.uid, params.appointmentId, { status: "completed" as any });

        successHaptic();
        showSuccessToast("Değerlendirmeniz kaydedildi.");
    }, [user, userProfile, showSuccessToast]);

    const getBarber = useCallback((barberId: string) => {
        return barbers.find((b) => b.id === barberId);
    }, [barbers]);

    const getService = useCallback((barberId: string, serviceId: string) => {
        const barber = barbers.find((b) => b.id === barberId);
        return barber?.services.find((s) => s.id === serviceId);
    }, [barbers]);

    const getAppointment = useCallback((appointmentId: string) => {
        return appointments.find((a) => a.id === appointmentId);
    }, [appointments]);

    const value = useMemo<AppContextValue>(() => ({
        barbers,
        ownedBarber,
        barberRequests,
        appointments,
        favoriteBarberIds,
        notificationSettings,
        privacySettings,
        profilePhotoUri,
        userProfile,
        dataLoaded,
        toggleFavorite,
        bookAppointment,
        cancelAppointment: cancelAppointmentFn,
        confirmAppointment,
        setNotificationSettings,
        setPrivacySettings,
        setProfilePhotoUri,
        updateOwnedBarber,
        updateUserProfile,
        showSuccessToast,
        getBarber,
        getService,
        getAppointment,
        submitReview
    }), [barbers, ownedBarber, barberRequests, appointments, favoriteBarberIds, notificationSettings, privacySettings, profilePhotoUri, userProfile,
        dataLoaded, toggleFavorite, bookAppointment, cancelAppointmentFn, confirmAppointment,
        setNotificationSettings, setPrivacySettings, setProfilePhotoUri, updateOwnedBarber, updateUserProfile,
        showSuccessToast, getBarber, getService, getAppointment, submitReview]);

    const toastBarWidth = toastProgress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"]
    });

    return (
        <AppContext.Provider value={value}>
            {children}
            {toast ? (
                <View style={[toastStyles.toastContainer, {
                    backgroundColor: toast.type === "error" ? "rgba(214, 48, 49, 0.94)" : "rgba(108, 92, 231, 0.92)",
                    borderColor: toast.type === "error" ? "rgba(255, 118, 117, 0.55)" : "rgba(108, 92, 231, 0.5)"
                }]}>
                    <View style={toastStyles.toastIconRow}>
                        <View style={toastStyles.toastIconCircle}>
                            <Text style={toastStyles.toastIconText}>{toast.type === "error" ? "!" : "✓"}</Text>
                        </View>
                        <Text style={toastStyles.toastText}>{toast.message}</Text>
                    </View>
                    <View style={toastStyles.toastTrack}>
                        <Animated.View style={[toastStyles.toastProgress, { width: toastBarWidth }]} />
                    </View>
                </View>
            ) : null}
        </AppContext.Provider>
    );
}

const toastStyles = StyleSheet.create({
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
