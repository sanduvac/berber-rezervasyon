import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
    Login: undefined;
    Register: undefined;
};

export type HomeStackParamList = {
    Home: undefined;
    BarberDetail: { barberId: string };
    AppointmentSelection: { barberId: string; serviceId: string; preselectedDate?: string; preselectedTime?: string };
    AppointmentConfirm: { barberId: string; serviceId: string; date: string; time: string };
};

export type AppointmentsStackParamList = {
    AppointmentsList: undefined;
    AppointmentDetail: { appointmentId: string };
};

export type WebStackParamList = {
    WebLanding: undefined;
    WebAdminLogin: undefined;
    WebAuthRequired: { barberName?: string } | undefined;
    Auth: { initialScreen?: "login" | "register"; screen?: "login" | "register" } | undefined;
    WebBarberDetail: { barberId: string };
    AppointmentSelection: { barberId: string; serviceId: string; preselectedDate?: string; preselectedTime?: string };
    AppointmentConfirm: { barberId: string; serviceId: string; date: string; time: string };
    AppointmentsTab: NavigatorScreenParams<AppointmentsStackParamList>;
};

export type RootTabParamList = {
    HomeTab: NavigatorScreenParams<HomeStackParamList>;
    AppointmentsTab: NavigatorScreenParams<AppointmentsStackParamList>;
    FavoritesTab: undefined;
    MapTab: undefined;
    ProfileTab: undefined;
};
