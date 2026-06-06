import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext, ThemeMode, getThemeColors } from "./src/theme/ThemeContext";
import { AuthProvider } from "./src/context/AuthContext";
import { AppProvider } from "./src/context/AppContext";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { CopilotProvider } from "react-native-copilot";
import { CustomTooltip } from "./src/components/CustomTooltip";

const THEME_STORAGE_KEY = "@theme_mode";

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [themeLoaded, setThemeLoaded] = useState(false);
  const colors = useMemo(() => getThemeColors(themeMode), [themeMode]);

  // Kaydedilmiş tema tercihini yükle
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (saved === "light" || saved === "dark") {
          setThemeMode(saved);
        }
      } catch {
        // Hata olursa varsayılan temayı kullan
      } finally {
        setThemeLoaded(true);
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      AsyncStorage.setItem(THEME_STORAGE_KEY, next).catch(() => {});
      return next;
    });
  }, []);

  // Tema yüklenene kadar bekle (flash önleme)
  if (!themeLoaded) return null;

  return (
    <ThemeContext.Provider value={{ mode: themeMode, colors, toggleTheme }}>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar style={colors.statusBarStyle} />
        <AuthProvider>
          <AppProvider>
            <CopilotProvider
              tooltipComponent={CustomTooltip}
              stepNumberComponent={() => null} // Adım numarasını gizle
              backdropColor="rgba(0,0,0,0.8)"
              tooltipStyle={{ backgroundColor: "transparent" }}
            >
              <AppNavigator />
            </CopilotProvider>
          </AppProvider>
        </AuthProvider>
      </SafeAreaView>
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  }
});
