import { createContext, useContext } from "react";

export type ThemeMode = "dark" | "light";

export type ThemeColors = {
    // Backgrounds
    background: string;
    surface: string;
    surfaceAlt: string;
    // Accent
    primary: string;
    primaryMuted: string;
    primaryBorder: string;
    primaryBg: string;
    secondary: string;
    // Text
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    textOnPrimary: string;
    // Status
    success: string;
    successBg: string;
    successBorder: string;
    error: string;
    errorBg: string;
    errorBorder: string;
    // Cards / Borders
    cardBg: string;
    cardBorder: string;
    divider: string;
    // Specific
    gold: string;
    pink: string;
    pinkMuted: string;
    tabBarBg: string;
    tabBarBorder: string;
    tabInactiveText: string;
    tabActiveText: string;
    tabActiveBg: string;
    tabActiveIconBg: string;
    // Hero glow
    glowPrimary: string;
    glowSecondary: string;
    glowTertiary: string;
    // Search
    searchBg: string;
    searchBorder: string;
    searchPlaceholder: string;
    // Chip
    chipBg: string;
    chipBorder: string;
    chipText: string;
    // Badge
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    // Cover overlay
    coverOverlay: string;
    coverBadgeBg: string;
    coverBadgeBorder: string;
    // StatusBar
    statusBarStyle: "light" | "dark";
};

const darkColors: ThemeColors = {
    background: "#0B0F1A",
    surface: "rgba(18, 22, 45, 0.9)",
    surfaceAlt: "rgba(18, 22, 45, 0.95)",
    primary: "#6C5CE7",
    primaryMuted: "#C4B5FD",
    primaryBorder: "rgba(108, 92, 231, 0.25)",
    primaryBg: "rgba(108, 92, 231, 0.12)",
    secondary: "#00D2FF",
    textPrimary: "#F1F5F9",
    textSecondary: "#8896AE",
    textMuted: "#6B7FA0",
    textOnPrimary: "#ffffff",
    success: "#34D399",
    successBg: "rgba(52, 211, 153, 0.12)",
    successBorder: "rgba(52, 211, 153, 0.25)",
    error: "#EF4444",
    errorBg: "rgba(239, 68, 68, 0.12)",
    errorBorder: "rgba(239, 68, 68, 0.25)",
    cardBg: "rgba(18, 22, 45, 0.9)",
    cardBorder: "rgba(108, 92, 231, 0.15)",
    divider: "rgba(108, 92, 231, 0.08)",
    gold: "#FFD700",
    pink: "#FF6B9D",
    pinkMuted: "rgba(255, 107, 157, 0.1)",
    tabBarBg: "rgba(15, 18, 35, 0.92)",
    tabBarBorder: "rgba(108, 92, 231, 0.25)",
    tabInactiveText: "#6b7fa0",
    tabActiveText: "#C4B5FD",
    tabActiveBg: "rgba(108, 92, 231, 0.18)",
    tabActiveIconBg: "rgba(108, 92, 231, 0.4)",
    glowPrimary: "rgba(108, 92, 231, 0.25)",
    glowSecondary: "rgba(0, 210, 255, 0.15)",
    glowTertiary: "rgba(108, 92, 231, 0.12)",
    searchBg: "rgba(20, 24, 50, 0.9)",
    searchBorder: "rgba(108, 92, 231, 0.2)",
    searchPlaceholder: "#52617a",
    chipBg: "rgba(108, 92, 231, 0.1)",
    chipBorder: "rgba(108, 92, 231, 0.2)",
    chipText: "#A5B4CB",
    badgeBg: "rgba(108, 92, 231, 0.1)",
    badgeBorder: "rgba(108, 92, 231, 0.2)",
    badgeText: "#8896AE",
    coverOverlay: "rgba(11, 15, 26, 0.35)",
    coverBadgeBg: "rgba(11, 15, 26, 0.7)",
    coverBadgeBorder: "rgba(255, 255, 255, 0.12)",
    statusBarStyle: "light"
};

const lightColors: ThemeColors = {
    background: "#F0F2F7",
    surface: "#ffffff",
    surfaceAlt: "#ffffff",
    primary: "#6C5CE7",
    primaryMuted: "#6C5CE7",
    primaryBorder: "rgba(108, 92, 231, 0.25)",
    primaryBg: "rgba(108, 92, 231, 0.08)",
    secondary: "#0891B2",
    textPrimary: "#1E293B",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    textOnPrimary: "#ffffff",
    success: "#059669",
    successBg: "rgba(5, 150, 105, 0.08)",
    successBorder: "rgba(5, 150, 105, 0.2)",
    error: "#DC2626",
    errorBg: "rgba(220, 38, 38, 0.08)",
    errorBorder: "rgba(220, 38, 38, 0.2)",
    cardBg: "#ffffff",
    cardBorder: "#E2E8F0",
    divider: "#F1F5F9",
    gold: "#D97706",
    pink: "#DB2777",
    pinkMuted: "rgba(219, 39, 119, 0.08)",
    tabBarBg: "rgba(255, 255, 255, 0.95)",
    tabBarBorder: "#E2E8F0",
    tabInactiveText: "#94A3B8",
    tabActiveText: "#6C5CE7",
    tabActiveBg: "rgba(108, 92, 231, 0.08)",
    tabActiveIconBg: "rgba(108, 92, 231, 0.15)",
    glowPrimary: "rgba(108, 92, 231, 0.12)",
    glowSecondary: "rgba(8, 145, 178, 0.1)",
    glowTertiary: "rgba(108, 92, 231, 0.06)",
    searchBg: "#ffffff",
    searchBorder: "#E2E8F0",
    searchPlaceholder: "#94A3B8",
    chipBg: "rgba(108, 92, 231, 0.06)",
    chipBorder: "rgba(108, 92, 231, 0.15)",
    chipText: "#64748B",
    badgeBg: "rgba(108, 92, 231, 0.06)",
    badgeBorder: "rgba(108, 92, 231, 0.15)",
    badgeText: "#64748B",
    coverOverlay: "rgba(0, 0, 0, 0.18)",
    coverBadgeBg: "rgba(255, 255, 255, 0.92)",
    coverBadgeBorder: "rgba(0, 0, 0, 0.08)",
    statusBarStyle: "dark"
};

export function getThemeColors(mode: ThemeMode): ThemeColors {
    return mode === "dark" ? darkColors : lightColors;
}

type ThemeContextValue = {
    mode: ThemeMode;
    colors: ThemeColors;
    toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
    mode: "dark",
    colors: darkColors,
    toggleTheme: () => { }
});

export function useTheme() {
    return useContext(ThemeContext);
}
