import { useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../theme/ThemeContext";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { NotificationSettings } from "../types/settings";
import { lightHaptic, selectionHaptic } from "../utils/haptics";
import { NotificationSettingsView } from "./profile/NotificationSettingsView";
import { SupportView } from "./profile/SupportView";
import { PrivacySecurityView } from "./profile/PrivacySecurityView";
import { PersonalInfoView } from "./profile/PersonalInfoView";

const ACCOUNT_ITEMS = [
  { id: "personal", title: "Kişisel Bilgiler", subtitle: "Ad, telefon ve e-posta bilgileri", icon: "person-outline" as const },
  { id: "payments", title: "Ödeme Yöntemleri", subtitle: "Kart ve ödeme seçenekleri", icon: "card-outline" as const }
];

const APP_ITEMS = [
  { id: "notifications", title: "Bildirim Ayarları", subtitle: "Hatırlatma ve sistem tercihleri", icon: "notifications-outline" as const },
  { id: "support", title: "Yardım Merkezi", subtitle: "Sık sorulan sorular ve destek", icon: "help-circle-outline" as const },
  { id: "privacy", title: "Gizlilik ve Güvenlik", subtitle: "Güvenlik ayarları ve izinler", icon: "shield-outline" as const }
];

type SettingItem = {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
};

type ProfileView = "main" | "notifications" | "support" | "privacy" | "personal";

export function ProfileScreen() {
  const { notificationSettings, setNotificationSettings, profilePhotoUri, setProfilePhotoUri, userProfile, updateUserProfile } = useApp();
  const { colors, mode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [view, setView] = useState<ProfileView>("main");
  const [isUploading, setIsUploading] = useState(false);

  function handleLogout() {
    Alert.alert(
      "Çıkış Yap",
      "Hesabınızdan çıkış yapmak istediğinize emin misiniz?",
      [
        { text: "Vazgeç", style: "cancel" },
        { text: "Çıkış Yap", style: "destructive", onPress: () => logout() }
      ]
    );
  }

  async function handlePhotoSelection(base64String: string | null | undefined) {
    if (!user || !base64String) return;
    setIsUploading(true);
    try {
      // Fotoğrafı metin (base64) olarak doğrudan Firestore'a kaydediyoruz.
      // Bu sayede Firebase Storage ücretlendirmesine takılmıyoruz.
      const dataUri = `data:image/jpeg;base64,${base64String}`;
      setProfilePhotoUri(dataUri);
    } catch (err) {
      console.error("Fotoğraf kaydetme hatası:", err);
      Alert.alert("Hata", "Profil fotoğrafı kaydedilemedi. Lütfen tekrar deneyin.");
    } finally {
      setIsUploading(false);
    }
  }

  async function pickImageFromGallery() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Galeriye erişim için izin vermeniz gerekiyor.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      await handlePhotoSelection(result.assets[0].base64);
    }
  }

  async function pickImageFromCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("İzin Gerekli", "Kamera erişimi için izin vermeniz gerekiyor.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      await handlePhotoSelection(result.assets[0].base64);
    }
  }

  function showPhotoOptions() {
    const buttons: any[] = [
      { text: "Kamera", onPress: pickImageFromCamera },
      { text: "Galeri", onPress: pickImageFromGallery },
    ];
    if (profilePhotoUri) {
      buttons.push({ text: "Fotoğrafı Kaldır", style: "destructive" as const, onPress: () => setProfilePhotoUri(null) });
    }
    buttons.push({ text: "Vazgeç", style: "cancel" as const });
    Alert.alert("Profil Fotoğrafı", "Fotoğraf kaynağını seçin", buttons);
  }

  function SectionCard({ title, items, onItemPress }: { title: string; items: SettingItem[]; onItemPress?: (item: SettingItem) => void }) {
    return (
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
        <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {items.map((item, index) => {
            const isClickable = item.id === "notifications" || item.id === "support" || item.id === "privacy" || item.id === "personal";
            return (
              <Pressable key={item.id}
                style={[styles.itemRow, { borderBottomColor: colors.divider }, index === items.length - 1 && styles.itemRowLast]}
                onPress={() => { if (isClickable) { lightHaptic(); onItemPress?.(item); } }}
              >
                {item.icon ? (
                  <View style={[styles.itemIconWrap, { backgroundColor: colors.primaryBg }]}>
                    <Ionicons name={item.icon as any} size={18} color={colors.primary} />
                  </View>
                ) : null}
                <View style={styles.itemTextWrap}>
                  <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>{item.title}</Text>
                  <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>{item.subtitle}</Text>
                </View>
                {!isClickable ? (
                  <View style={[styles.badge, { backgroundColor: colors.badgeBg, borderColor: colors.badgeBorder }]}>
                    <Text style={[styles.badgeText, { color: colors.badgeText }]}>Yakında</Text>
                  </View>
                ) : (
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  if (view === "notifications") {
    return <NotificationSettingsView onBack={() => setView("main")} />;
  }

  if (view === "support") {
    return <SupportView onBack={() => setView("main")} />;
  }

  if (view === "privacy") {
    return <PrivacySecurityView onBack={() => setView("main")} />;
  }

  if (view === "personal") {
    return <PersonalInfoView onBack={() => setView("main")} />;
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
        <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
        <View style={[styles.avatarContainer, { borderColor: colors.primaryBorder }]}>
          {isUploading ? (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : profilePhotoUri ? (
            <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
          ) : (
            <Ionicons name="person" size={50} color={colors.primaryMuted} />
          )}
          <Pressable
            style={[styles.editAvatarButton, { backgroundColor: colors.primary }]}
            onPress={showPhotoOptions}
            disabled={isUploading}
          >
            <Ionicons name="camera" size={16} color="#FFFFFF" />
          </Pressable>
        </View>
        <Text style={[styles.name, { color: colors.textPrimary }]}>Profil Bilgileri</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Fotoğrafını değiştirmek için üzerine dokun.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Görünüm</Text>
        <View style={[styles.themeToggleCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Pressable
            style={[styles.themeOption, mode === "dark" && [styles.themeOptionActive, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]]}
            onPress={() => { if (mode !== "dark") { selectionHaptic(); toggleTheme(); } }}
          >
            <Ionicons name="moon" size={20} color={mode === "dark" ? colors.primaryMuted : colors.textMuted} />
            <Text style={[styles.themeOptionText, { color: mode === "dark" ? colors.primaryMuted : colors.textMuted }]}>Koyu</Text>
          </Pressable>
          <Pressable
            style={[styles.themeOption, mode === "light" && [styles.themeOptionActive, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]]}
            onPress={() => { if (mode !== "light") { selectionHaptic(); toggleTheme(); } }}
          >
            <Ionicons name="sunny" size={20} color={mode === "light" ? colors.primaryMuted : colors.textMuted} />
            <Text style={[styles.themeOptionText, { color: mode === "light" ? colors.primaryMuted : colors.textMuted }]}>Açık</Text>
          </Pressable>
        </View>
      </View>

      <SectionCard title="Hesap" items={ACCOUNT_ITEMS}
        onItemPress={(item) => {
          if (item.id === "personal") setView("personal");
        }}
      />
      <SectionCard title="Uygulama" items={APP_ITEMS}
        onItemPress={(item) => {
          if (item.id === "notifications") setView("notifications");
          else if (item.id === "support") setView("support");
          else if (item.id === "privacy") setView("privacy");
        }}
      />

      <View style={[styles.footerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.footerRow}>
          <Ionicons name="code-slash" size={16} color={colors.primary} />
          <Text style={[styles.footerTitle, { color: colors.textMuted }]}>Sürüm</Text>
        </View>
        <Text style={[styles.footerValue, { color: colors.primaryMuted }]}>v0.1.0</Text>
      </View>

      <Pressable
        style={[styles.logoutButton, { backgroundColor: mode === "dark" ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2", borderColor: mode === "dark" ? "rgba(239, 68, 68, 0.2)" : "#FECACA" }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </Pressable>

      <Pressable
        style={[styles.devButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}
        onPress={() => {
          // Geliştirici Modu: Rol Değiştirme
          const newRole = userProfile?.role === "barber" ? "customer" : "barber";
          updateUserProfile({ ...userProfile, role: newRole });
        }}
      >
        <Ionicons name="code-working-outline" size={20} color={colors.primary} />
        <Text style={[styles.devButtonText, { color: colors.primary }]}>
          Test: {userProfile?.role === "barber" ? "Müşteri Moduna Geç" : "Berber Paneline Geç"}
        </Text>
      </Pressable>

      {user?.email ? (
        <Text style={[styles.loggedInAs, { color: colors.textMuted }]}>
          {user.email} olarak giriş yapıldı
        </Text>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoutButton: {
    marginTop: 18, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8
  },
  logoutButtonText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
  loggedInAs: { textAlign: "center", marginTop: 12, fontSize: 12, fontWeight: "600" },
  devButton: {
    marginTop: 12, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8
  },
  devButtonText: { fontWeight: "700", fontSize: 15 },
  content: { paddingBottom: 80 },
  hero: {
    borderRadius: 22, borderWidth: 1, padding: 20, alignItems: "center", overflow: "hidden"
  },
  heroGlow: {
    position: "absolute", width: 200, height: 200, borderRadius: 999, top: -80, right: -40
  },
  avatarContainer: {
    width: 100, height: 100, borderRadius: 50, borderWidth: 3,
    alignItems: "center", justifyContent: "center", marginBottom: 16
  },
  uploadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center"
  },
  avatarImage: {
    width: "100%", height: "100%", borderRadius: 999
  },
  editAvatarButton: {
    position: "absolute", bottom: -4, right: -4, width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#FFFFFF"
  },
  name: { fontSize: 22, fontWeight: "800", letterSpacing: -0.2, marginTop: 4 },
  subtitle: { marginTop: 6, lineHeight: 19, textAlign: "center" },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 17, fontWeight: "800", marginBottom: 8 },
  sectionCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  itemRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10,
    paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1
  },
  itemRowLast: { borderBottomWidth: 0 },
  itemIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  itemTextWrap: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: "700" },
  itemSubtitle: { marginTop: 3, fontSize: 12.5 },
  badge: { borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  themeToggleCard: {
    borderRadius: 18, borderWidth: 1, flexDirection: "row", padding: 6, gap: 6
  },
  themeOption: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "transparent"
  },
  themeOptionActive: {
    borderWidth: 1
  },
  themeOptionText: { fontWeight: "700", fontSize: 15 },
  footerCard: {
    marginTop: 18, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerTitle: { fontWeight: "600" },
  footerValue: { fontWeight: "700" }
});
