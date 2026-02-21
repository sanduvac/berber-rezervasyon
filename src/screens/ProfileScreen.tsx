import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../theme/ThemeContext";

export type NotificationSettings = {
  allNotifications: boolean;
  appointmentReminders: boolean;
  systemNotifications: boolean;
};

const ACCOUNT_ITEMS = [
  { id: "personal", title: "Kişisel Bilgiler", subtitle: "Ad, telefon ve e-posta bilgileri", icon: "person-outline" as const },
  { id: "payments", title: "Ödeme Yöntemleri", subtitle: "Kart ve ödeme seçenekleri", icon: "card-outline" as const }
];

const APP_ITEMS = [
  { id: "notifications", title: "Bildirim Ayarları", subtitle: "Hatırlatma ve sistem tercihleri", icon: "notifications-outline" as const },
  { id: "support", title: "Yardım Merkezi", subtitle: "Sık sorulan sorular ve destek", icon: "help-circle-outline" as const },
  { id: "privacy", title: "Gizlilik ve Güvenlik", subtitle: "Güvenlik ayarları ve izinler", icon: "shield-outline" as const }
];

const FAQ_LIST = [
  {
    question: "Randevumu nasıl iptal edebilirim?",
    answer: "Randevularım sekmesinde ilgili randevuya tıklayarak detay sayfasına gidin. Bu sayfada bulunan 'Randevuyu İptal Et' butonunu kullanarak işleminizi gerçekleştirebilirsiniz."
  },
  {
    question: "Uygulama ücretli mi?",
    answer: "Hayır, uygulamayı indirmek ve kullanmak tamamen ücretsizdir. Sadece hizmet aldığınız berbere kendi ücretini ödersiniz."
  },
  {
    question: "Berberlerin konumunu nasıl görebilirim?",
    answer: "Harita sekmesinden çevrenizdeki tüm berberleri görebilir, üzerlerine tıklayarak çalışma saatleri ve detaylar hakkında bilgi alabilirsiniz."
  },
  {
    question: "Randevum yaklaşınca bildirim alır mıyım?",
    answer: "Evet, Bildirim Ayarları menüsünden 'Randevu Hatırlatmaları' seçeneğini aktif ederseniz randevunuzdan önce bildirim gönderilir."
  },
  {
    question: "Görünüm ayarlarını (karanlık mod) değiştirebilir miyim?",
    answer: "Evet! Profil sayfasında Görünüm başlığı altında yer alan 'Koyu' ve 'Açık' seçeneklerine tıklayarak arayüz rengi temasını değiştirebilirsiniz."
  },
  {
    question: "Favori berberlerimi nereden bulurum?",
    answer: "Berberlerin kartında veya detay sayfasında bulunan kalp ikonuna basarak onları favorilere ekleyebilir, ardından ana sayfada bulunan 'Favorilerim' sekmesi üzerinden kolayca bu berberlere ulaşabilirsiniz."
  }
];

type SettingItem = {
  id: string;
  title: string;
  subtitle: string;
  icon?: string;
};

type ProfileView = "main" | "notifications" | "support" | "privacy" | "personal";

type ProfileScreenProps = {
  notificationSettings: NotificationSettings;
  onNotificationSettingsChange: (settings: NotificationSettings) => void;
  profilePhotoUri: string | null;
  onProfilePhotoChange: (uri: string | null) => void;
};

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const { colors, mode } = useTheme();
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={[styles.faqCard, { backgroundColor: colors.cardBg, borderColor: expanded ? colors.primaryBorder : colors.cardBorder }]}>
      <Pressable style={styles.faqHeader} onPress={() => setExpanded(!expanded)}>
        <Text style={[styles.faqQuestion, { color: colors.textPrimary }]}>{question}</Text>
        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={16} color={expanded ? colors.primary : colors.textMuted} />
      </Pressable>
      {expanded ? (
        <View style={[styles.faqAnswerWrap, { borderTopColor: colors.divider }]}>
          <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{answer}</Text>
        </View>
      ) : null}
    </View>
  );
}

export function ProfileScreen({ notificationSettings, onNotificationSettingsChange, profilePhotoUri, onProfilePhotoChange }: ProfileScreenProps) {
  const { colors, mode, toggleTheme } = useTheme();
  const [view, setView] = useState<ProfileView>("main");
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [locationSharing, setLocationSharing] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(true);
  const [personalName, setPersonalName] = useState("Oğuzhan Yılmaz");
  const [personalPhone, setPersonalPhone] = useState("+90 555 123 45 67");
  const [personalEmail, setPersonalEmail] = useState("oguzhan@example.com");
  const [personalBirthday, setPersonalBirthday] = useState("15 Mart 1995");
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const { allNotifications, appointmentReminders, systemNotifications } = notificationSettings;

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
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onProfilePhotoChange(result.assets[0].uri);
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
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      onProfilePhotoChange(result.assets[0].uri);
    }
  }

  function showPhotoOptions() {
    const buttons: any[] = [
      { text: "Kamera", onPress: pickImageFromCamera },
      { text: "Galeri", onPress: pickImageFromGallery },
    ];
    if (profilePhotoUri) {
      buttons.push({ text: "Fotoğrafı Kaldır", style: "destructive" as const, onPress: () => onProfilePhotoChange(null) });
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
                onPress={() => isClickable && onItemPress?.(item)}
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

  function ToggleRow({ title, subtitle, value, onValueChange, disabled }: { title: string; subtitle: string; value: boolean; onValueChange: (v: boolean) => void; disabled?: boolean }) {
    return (
      <View style={[styles.toggleRow, { borderBottomColor: colors.divider }, disabled && { backgroundColor: mode === "dark" ? "rgba(11, 15, 26, 0.5)" : "#F8FAFC" }]}>
        <View style={styles.toggleTextWrap}>
          <Text style={[styles.toggleTitle, { color: disabled ? colors.textMuted : colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.toggleSubtitle, { color: disabled ? (mode === "dark" ? "#3A4563" : "#CBD5E1") : colors.textMuted }]}>{subtitle}</Text>
        </View>
        <Switch value={value} onValueChange={onValueChange} disabled={disabled}
          trackColor={{ false: mode === "dark" ? "#2A3250" : "#E2E8F0", true: "rgba(108, 92, 231, 0.4)" }}
          thumbColor={value ? "#6C5CE7" : (mode === "dark" ? "#52617A" : "#CBD5E1")}
        />
      </View>
    );
  }

  if (view === "notifications") {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={() => setView("main")}>
          <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
          <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
        </Pressable>

        <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
          <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
          <Ionicons name="notifications" size={28} color={colors.primary} />
          <Text style={[styles.name, { color: colors.textPrimary }]}>Bildirim Ayarları</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Randevu ve uygulama bildirim tercihlerini yönet.</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Tercihler</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <ToggleRow title="Tüm Bildirimler" subtitle="Uygulama bildirimlerini tamamen aç / kapat"
              value={allNotifications} onValueChange={(value) => {
                const next: NotificationSettings = { ...notificationSettings, allNotifications: value };
                if (!value) { next.appointmentReminders = false; next.systemNotifications = false; }
                onNotificationSettingsChange(next);
              }}
            />
            <ToggleRow title="Randevu Hatırlatmaları" subtitle="Randevu saatinden önce hatırlatma al"
              value={appointmentReminders} disabled={!allNotifications}
              onValueChange={(value) => onNotificationSettingsChange({ ...notificationSettings, appointmentReminders: value })}
            />
            <ToggleRow title="Sistem Bildirimleri" subtitle="Uygulama güncelleme ve önemli bilgilendirmeler"
              value={systemNotifications} disabled={!allNotifications}
              onValueChange={(value) => onNotificationSettingsChange({ ...notificationSettings, systemNotifications: value })}
            />
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.infoIconRow}>
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.primaryMuted }]}>Not</Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Cihaz düzeyindeki izinler kapalıysa bu ayarlar tek başına bildirim göndermeyi başlatmaz. İzinleri telefon ayarlarından yönetebilirsin.
          </Text>
        </View>
      </ScrollView>
    );
  }

  if (view === "support") {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={() => setView("main")}>
          <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
          <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
        </Pressable>

        <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
          <View style={[styles.heroGlow, { backgroundColor: colors.glowSecondary }]} />
          <Ionicons name="help-buoy" size={28} color={colors.secondary} />
          <Text style={[styles.name, { color: colors.textPrimary }]}>Yardım Merkezi</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sıkça sorulan sorulara ve uygulama rehberine eriş.</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Sıkça Sorulan Sorular</Text>
          <View style={styles.faqList}>
            {FAQ_LIST.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </View>
        </View>
      </ScrollView>
    );
  }

  if (view === "privacy") {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={() => setView("main")}>
          <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
          <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
        </Pressable>

        <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
          <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
          <Ionicons name="shield-checkmark" size={28} color={colors.primary} />
          <Text style={[styles.name, { color: colors.textPrimary }]}>Gizlilik ve Güvenlik</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Hesap güvenliğini ve veri gizliliğini yönet.</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Hesap Güvenliği</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <ToggleRow title="Biyometrik Giriş" subtitle="Parmak izi veya yüz tanıma ile giriş"
              value={biometricLogin} onValueChange={setBiometricLogin}
            />
            <ToggleRow title="İki Faktörlü Doğrulama" subtitle="Giriş sırasında ek güvenlik kodu iste"
              value={twoFactorAuth} onValueChange={setTwoFactorAuth}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Veri Gizliliği</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <ToggleRow title="Konum Paylaşımı" subtitle="Yakınındaki berberleri bulmak için konum izni"
              value={locationSharing} onValueChange={setLocationSharing}
            />
            <ToggleRow title="Analitik Verileri" subtitle="Uygulamayı geliştirmek için anonim kullanım verileri"
              value={analyticsData} onValueChange={setAnalyticsData}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Uygulama İzinleri</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={[styles.itemRow, { borderBottomColor: colors.divider }]}>
              <View style={[styles.itemIconWrap, { backgroundColor: colors.primaryBg }]}>
                <Ionicons name="camera-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.itemTextWrap}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>Kamera</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>Profil fotoğrafı çekmek için</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
                <Text style={[styles.badgeText, { color: colors.primaryMuted }]}>İzinli</Text>
              </View>
            </View>
            <View style={[styles.itemRow, { borderBottomColor: colors.divider }]}>
              <View style={[styles.itemIconWrap, { backgroundColor: colors.primaryBg }]}>
                <Ionicons name="location-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.itemTextWrap}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>Konum</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>Yakındaki berberleri göstermek için</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
                <Text style={[styles.badgeText, { color: colors.primaryMuted }]}>İzinli</Text>
              </View>
            </View>
            <View style={[styles.itemRow, styles.itemRowLast, { borderBottomColor: colors.divider }]}>
              <View style={[styles.itemIconWrap, { backgroundColor: colors.primaryBg }]}>
                <Ionicons name="notifications-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.itemTextWrap}>
                <Text style={[styles.itemTitle, { color: colors.textPrimary }]}>Bildirimler</Text>
                <Text style={[styles.itemSubtitle, { color: colors.textMuted }]}>Randevu hatırlatmaları için</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
                <Text style={[styles.badgeText, { color: colors.primaryMuted }]}>İzinli</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.infoIconRow}>
            <Ionicons name="lock-closed" size={18} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.primaryMuted }]}>Gizlilik Politikası</Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Verileriniz güvenli bir şekilde saklanır ve üçüncü taraflarla paylaşılmaz. Detaylı bilgi için gizlilik politikamızı inceleyebilirsiniz.
          </Text>
        </View>

        <Pressable style={[styles.dangerButton, { backgroundColor: mode === "dark" ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2", borderColor: mode === "dark" ? "rgba(239, 68, 68, 0.2)" : "#FECACA" }]}>
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
          <Text style={styles.dangerButtonText}>Hesabı Sil</Text>
        </Pressable>
      </ScrollView>
    );
  }

  if (view === "personal") {
    const personalFields = [
      { key: "name", label: "Ad Soyad", value: personalName, icon: "person-outline" as const, onSave: setPersonalName, keyboard: "default" as const },
      { key: "phone", label: "Telefon", value: personalPhone, icon: "call-outline" as const, onSave: setPersonalPhone, keyboard: "phone-pad" as const },
      { key: "email", label: "E-posta", value: personalEmail, icon: "mail-outline" as const, onSave: setPersonalEmail, keyboard: "email-address" as const },
      { key: "birthday", label: "Doğum Tarihi", value: personalBirthday, icon: "calendar-outline" as const, onSave: setPersonalBirthday, keyboard: "default" as const },
    ];

    function startEditing(key: string, currentValue: string) {
      setEditingField(key);
      setEditingValue(currentValue);
    }

    function saveEditing(onSave: (v: string) => void) {
      if (editingValue.trim()) {
        onSave(editingValue.trim());
      }
      setEditingField(null);
      setEditingValue("");
    }

    function cancelEditing() {
      setEditingField(null);
      setEditingValue("");
    }

    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={() => { cancelEditing(); setView("main"); }}>
          <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
          <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
        </Pressable>

        <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
          <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
          <Pressable onPress={showPhotoOptions} style={styles.avatarContainer}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
              {profilePhotoUri ? (
                <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={28} color={colors.primaryMuted} />
              )}
            </View>
            <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={12} color="#FFFFFF" />
            </View>
          </Pressable>
          <Text style={[styles.name, { color: colors.textPrimary }]}>Kişisel Bilgiler</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Bilgilerini düzenlemek için üzerine dokun.</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Bilgilerim</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            {personalFields.map((field, index) => {
              const isEditing = editingField === field.key;
              return (
                <Pressable key={field.key}
                  style={[
                    styles.personalFieldRow,
                    { borderBottomColor: colors.divider },
                    index === personalFields.length - 1 && styles.itemRowLast,
                    isEditing && [styles.personalFieldRowEditing, { borderColor: colors.primaryBorder, backgroundColor: colors.primaryBg }]
                  ]}
                  onPress={() => { if (!isEditing) startEditing(field.key, field.value); }}
                >
                  <View style={[styles.itemIconWrap, { backgroundColor: isEditing ? colors.primary : colors.primaryBg }]}>
                    <Ionicons name={field.icon} size={18} color={isEditing ? "#FFFFFF" : colors.primary} />
                  </View>
                  <View style={styles.personalFieldTextWrap}>
                    <Text style={[styles.personalFieldLabel, { color: isEditing ? colors.primary : colors.textMuted }]}>{field.label}</Text>
                    {isEditing ? (
                      <TextInput
                        style={[styles.personalFieldInput, { color: colors.textPrimary, borderColor: colors.primaryBorder }]}
                        value={editingValue}
                        onChangeText={setEditingValue}
                        autoFocus
                        keyboardType={field.keyboard}
                        returnKeyType="done"
                        keyboardAppearance={mode}
                        onSubmitEditing={() => saveEditing(field.onSave)}
                        selectionColor={colors.primary}
                        placeholderTextColor={colors.textMuted}
                        placeholder={field.label}
                      />
                    ) : (
                      <Text style={[styles.personalFieldValue, { color: colors.textPrimary }]}>{field.value}</Text>
                    )}
                  </View>
                  {isEditing ? (
                    <View style={styles.editActions}>
                      <Pressable onPress={cancelEditing} style={[styles.editActionBtn, { backgroundColor: mode === "dark" ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2" }]}>
                        <Ionicons name="close" size={16} color="#EF4444" />
                      </Pressable>
                      <Pressable onPress={() => saveEditing(field.onSave)} style={[styles.editActionBtn, { backgroundColor: mode === "dark" ? "rgba(34, 197, 94, 0.15)" : "#F0FDF4" }]}>
                        <Ionicons name="checkmark" size={16} color="#22C55E" />
                      </Pressable>
                    </View>
                  ) : (
                    <Ionicons name="create-outline" size={16} color={colors.primary} />
                  )}
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={[styles.infoCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.infoIconRow}>
            <Ionicons name="information-circle" size={18} color={colors.primary} />
            <Text style={[styles.infoTitle, { color: colors.primaryMuted }]}>Bilgilendirme</Text>
          </View>
          <Text style={[styles.infoText, { color: colors.textMuted }]}>
            Bu bilgiler şu anda temsilî verilerdir. İlerleyen süreçte gerçek hesap bilgilerinizle eşleştirilecektir.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
        <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
        <Pressable onPress={showPhotoOptions} style={styles.avatarContainer}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
            {profilePhotoUri ? (
              <Image source={{ uri: profilePhotoUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={28} color={colors.primaryMuted} />
            )}
          </View>
          <View style={[styles.avatarEditBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="camera" size={12} color="#FFFFFF" />
          </View>
        </Pressable>
        <Text style={[styles.name, { color: colors.textPrimary }]}>Profil Bilgileri</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Fotoğrafını değiştirmek için üzerine dokun.</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Görünüm</Text>
        <View style={[styles.themeToggleCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <Pressable
            style={[styles.themeOption, mode === "dark" && [styles.themeOptionActive, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]]}
            onPress={() => { if (mode !== "dark") toggleTheme(); }}
          >
            <Ionicons name="moon" size={20} color={mode === "dark" ? colors.primaryMuted : colors.textMuted} />
            <Text style={[styles.themeOptionText, { color: mode === "dark" ? colors.primaryMuted : colors.textMuted }]}>Koyu</Text>
          </Pressable>
          <Pressable
            style={[styles.themeOption, mode === "light" && [styles.themeOptionActive, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]]}
            onPress={() => { if (mode !== "light") toggleTheme(); }}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  dangerButton: {
    marginTop: 18, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 16,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8
  },
  dangerButtonText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
  content: { paddingBottom: 80 },
  backButton: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 12
  },
  backButtonText: { fontWeight: "700" },
  hero: {
    borderRadius: 22, borderWidth: 1, padding: 20, alignItems: "center", overflow: "hidden"
  },
  heroGlow: {
    position: "absolute", width: 200, height: 200, borderRadius: 999, top: -80, right: -40
  },
  avatarContainer: {
    position: "relative", marginBottom: 8
  },
  avatarCircle: {
    width: 72, height: 72, borderRadius: 999, borderWidth: 2,
    alignItems: "center", justifyContent: "center", overflow: "hidden"
  },
  avatarImage: {
    width: "100%", height: "100%", borderRadius: 999
  },
  avatarEditBadge: {
    position: "absolute", bottom: 0, right: -2, width: 26, height: 26, borderRadius: 999,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#FFFFFF"
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
  toggleRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10,
    paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1
  },
  toggleTextWrap: { flex: 1 },
  toggleTitle: { fontSize: 15, fontWeight: "700" },
  toggleSubtitle: { marginTop: 3, fontSize: 12.5 },
  infoCard: { marginTop: 16, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14 },
  infoIconRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  infoTitle: { fontWeight: "700" },
  infoText: { lineHeight: 20 },
  footerCard: {
    marginTop: 18, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between"
  },
  footerRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  footerTitle: { fontWeight: "600" },
  footerValue: { fontWeight: "700" },
  faqList: { gap: 12 },
  faqCard: {
    borderRadius: 16, borderWidth: 1, overflow: "hidden"
  },
  faqHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 16, gap: 10
  },
  faqQuestion: {
    fontSize: 15, fontWeight: "700", flex: 1, lineHeight: 20
  },
  faqAnswerWrap: {
    paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4, borderTopWidth: 1
  },
  faqAnswer: {
    fontSize: 14, lineHeight: 21
  },
  personalFieldRow: {
    flexDirection: "row", alignItems: "center", gap: 10,
    paddingHorizontal: 14, paddingVertical: 16, borderBottomWidth: 1
  },
  personalFieldTextWrap: { flex: 1 },
  personalFieldLabel: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  personalFieldValue: { fontSize: 15, fontWeight: "700" },
  personalFieldRowEditing: {
    borderWidth: 1, borderRadius: 14, marginHorizontal: -2, paddingHorizontal: 16
  },
  personalFieldInput: {
    fontSize: 15, fontWeight: "700", paddingVertical: 6, paddingHorizontal: 0,
    borderBottomWidth: 1.5, marginTop: 2
  },
  editActions: { flexDirection: "row", gap: 8 },
  editActionBtn: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: "center", justifyContent: "center"
  }
});
