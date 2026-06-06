import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { HomeScreen } from "../screens/HomeScreen";
import { BarberDetailScreen } from "../screens/BarberDetailScreen";
import { AppointmentSelectionScreen } from "../screens/AppointmentSelectionScreen";
import { AppointmentConfirmScreen } from "../screens/AppointmentConfirmScreen";
import { AppointmentsScreen } from "../screens/AppointmentsScreen";
import { AppointmentDetailScreen } from "../screens/AppointmentDetailScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { MapScreen } from "../screens/MapScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { SplashScreen } from "../components/SplashScreen";
import { OnboardingScreen } from "../screens/OnboardingScreen";
import { BarberNavigator } from "./BarberNavigator";
import { AdminNavigator } from "./AdminNavigator";
import { WebLandingScreen } from "../screens/web/WebLandingScreen";
import { WebAdminLoginScreen } from "../screens/web/WebAdminLoginScreen";
import { WebAuthRequiredScreen } from "../screens/web/WebAuthRequiredScreen";
import { Platform } from "react-native";
import type { RootTabParamList, HomeStackParamList, AppointmentsStackParamList, WebStackParamList } from "../types/navigation";

type TabIconName = ComponentProps<typeof Ionicons>["name"];

const Tab = createBottomTabNavigator<RootTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const AppointmentsStack = createNativeStackNavigator<AppointmentsStackParamList>();

const TAB_CONFIG: { key: keyof RootTabParamList; label: string; icon: TabIconName; activeIcon: TabIconName }[] = [
    { key: "HomeTab", label: "Ana Sayfa", icon: "home-outline", activeIcon: "home" },
    { key: "AppointmentsTab", label: "Randevularım", icon: "calendar-outline", activeIcon: "calendar" },
    { key: "FavoritesTab", label: "Favorilerim", icon: "heart-outline", activeIcon: "heart" },
    { key: "MapTab", label: "Harita", icon: "map-outline", activeIcon: "map" },
    { key: "ProfileTab", label: "Profilim", icon: "person-outline", activeIcon: "person" }
];

function HomeStackNavigator() {
    const { colors } = useTheme();
    return (
        <HomeStack.Navigator screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 16 },
            animation: "slide_from_right",
            animationDuration: 250
        }}>
            <HomeStack.Screen name="Home" component={HomeScreen} />
            <HomeStack.Screen name="BarberDetail" component={BarberDetailScreen} />
            <HomeStack.Screen name="AppointmentSelection" component={AppointmentSelectionScreen} />
            <HomeStack.Screen name="AppointmentConfirm" component={AppointmentConfirmScreen} />
        </HomeStack.Navigator>
    );
}

function AppointmentsStackNavigator() {
    const { colors } = useTheme();
    return (
        <AppointmentsStack.Navigator screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 16 },
            animation: "slide_from_right",
            animationDuration: 250
        }}>
            <AppointmentsStack.Screen name="AppointmentsList" component={AppointmentsScreen} />
            <AppointmentsStack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
        </AppointmentsStack.Navigator>
    );
}

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
    const { colors } = useTheme();

    return (
        <View style={[styles.tabBar, {
            backgroundColor: colors.tabBarBg,
            borderColor: colors.tabBarBorder
        }]}>
            {state.routes.map((route, index) => {
                const tabConfig = TAB_CONFIG.find((t) => t.key === route.name);
                if (!tabConfig) return null;

                const isActive = state.index === index;

                return (
                    <Pressable
                        key={route.key}
                        style={[
                            styles.tabItem,
                            isActive && [styles.tabItemActive, {
                                backgroundColor: colors.tabActiveBg,
                                borderColor: colors.primaryBorder
                            }]
                        ]}
                        onPress={() => {
                            const event = navigation.emit({
                                type: "tabPress",
                                target: route.key,
                                canPreventDefault: true,
                            });
                            if (!event.defaultPrevented) {
                                navigation.navigate(route.name);
                            }
                        }}
                    >
                        <View style={[
                            styles.tabIconWrap,
                            isActive && [styles.tabIconWrapActive, { backgroundColor: colors.tabActiveIconBg }]
                        ]}>
                            <Ionicons
                                name={isActive ? tabConfig.activeIcon : tabConfig.icon}
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
                            {tabConfig.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

function AuthNavigator({ route }: { route?: { params?: { initialScreen?: "login" | "register"; screen?: "login" | "register" } } }) {
    const { colors } = useTheme();
    const requestedScreen = route?.params?.initialScreen ?? route?.params?.screen;
    const [screen, setScreen] = useState<"login" | "register">(requestedScreen === "register" ? "register" : "login");
    const [fadeAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        if (requestedScreen === "login" || requestedScreen === "register") {
            setScreen(requestedScreen);
        }
    }, [requestedScreen]);

    function switchScreen(target: "login" | "register") {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true
        }).start(() => {
            setScreen(target);
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true
            }).start();
        });
    }

    return (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
            {screen === "register" ? (
                <RegisterScreen onGoToLogin={() => switchScreen("login")} />
            ) : (
                <LoginScreen onGoToRegister={() => switchScreen("register")} />
            )}
        </Animated.View>
    );
}

function WebProtectedScreen({ children }: { children: ReactNode }) {
    const { user } = useAuth();

    if (!user) {
        return <WebAuthRequiredScreen />;
    }

    return <>{children}</>;
}

function MainNavigator() {
    const { colors } = useTheme();

    return (
        <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                animation: "fade"
            }}
        >
            <Tab.Screen name="HomeTab" component={HomeStackNavigator} />
            <Tab.Screen name="AppointmentsTab" component={AppointmentsStackNavigator} />
            <Tab.Screen name="FavoritesTab">
                {() => <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 16 }}><FavoritesScreen /></View>}
            </Tab.Screen>
            <Tab.Screen name="MapTab">
                {() => <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 16 }}><MapScreen /></View>}
            </Tab.Screen>
            <Tab.Screen name="ProfileTab">
                {() => <View style={{ flex: 1, backgroundColor: colors.background, paddingHorizontal: 16, paddingTop: 16 }}><ProfileScreen /></View>}
            </Tab.Screen>
        </Tab.Navigator>
    );
}

// ---- Web Özel (Desktop) Navigator ----
const WebStack = createNativeStackNavigator<WebStackParamList>();

function WebMainNavigator() {
    return (
        <WebStack.Navigator screenOptions={{ headerShown: false, animation: "fade" }}>
            <WebStack.Screen name="WebLanding" component={WebLandingScreen} />
            <WebStack.Screen name="WebAdminLogin" component={WebAdminLoginScreen} />
            <WebStack.Screen name="WebAuthRequired" component={WebAuthRequiredScreen} />
            <WebStack.Screen name="Auth" component={AuthNavigator} />
            <WebStack.Screen name="WebBarberDetail">
                {() => (
                    <WebProtectedScreen>
                        <BarberDetailScreen />
                    </WebProtectedScreen>
                )}
            </WebStack.Screen>
            <WebStack.Screen name="AppointmentSelection">
                {() => (
                    <WebProtectedScreen>
                        <AppointmentSelectionScreen />
                    </WebProtectedScreen>
                )}
            </WebStack.Screen>
            <WebStack.Screen name="AppointmentConfirm">
                {() => (
                    <WebProtectedScreen>
                        <AppointmentConfirmScreen />
                    </WebProtectedScreen>
                )}
            </WebStack.Screen>
            {/* Müşteri randevuları için mevcut mobil stack kullanılabilir veya ilerde Web'e özel yapılabilir */}
            <WebStack.Screen name="AppointmentsTab">
                {() => (
                    <WebProtectedScreen>
                        <AppointmentsStackNavigator />
                    </WebProtectedScreen>
                )}
            </WebStack.Screen>
        </WebStack.Navigator>
    );
}

export function AppNavigator() {
    const { user, isLoading } = useAuth();
    const { userProfile } = useApp();
    const [showSplash, setShowSplash] = useState(true);
    const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

    useEffect(() => {
        async function checkOnboarding() {
            try {
                const value = await AsyncStorage.getItem("@hasSeenOnboarding");
                setHasSeenOnboarding(value === "true");
            } catch (err) {
                setHasSeenOnboarding(true);
            }
        }
        checkOnboarding();
    }, []);

    if (showSplash || isLoading || hasSeenOnboarding === null) {
        return <SplashScreen onFinish={() => setShowSplash(false)} />;
    }

    if (!user && !hasSeenOnboarding) {
        return <OnboardingScreen onFinish={() => setHasSeenOnboarding(true)} />;
    }

    return (
        <NavigationContainer>
            {Platform.OS === "web" ? (
                // --- WEB MİMARİSİ ---
                !user ? (
                    <WebMainNavigator />
                ) : !userProfile ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}><ActivityIndicator size="large" color="#6C5CE7" /></View>
                ) : userProfile.role === "admin" ? (
                    <AdminNavigator />
                ) : userProfile.role === "barber" ? (
                    <BarberNavigator />
                ) : (
                    <WebMainNavigator />
                )
            ) : (
                // --- MOBİL MİMARİSİ ---
                !user ? (
                    <AuthNavigator />
                ) : !userProfile ? (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}><ActivityIndicator size="large" color="#6C5CE7" /></View>
                ) : userProfile.role === "admin" ? (
                    <AdminNavigator />
                ) : userProfile.role === "barber" ? (
                    <BarberNavigator />
                ) : (
                    <MainNavigator />
                )
            )}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
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
    }
});
