import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";
import { successHaptic } from "../../utils/haptics";

type Props = { onBack: () => void };

export function PersonalInfoView({ onBack }: Props) {
  const { userProfile, updateUserProfile, showSuccessToast } = useApp();
  const { colors, mode } = useTheme();

  const [name, setName] = useState(userProfile?.name || "");
  const [phone, setPhone] = useState(userProfile?.phone || "");
  const [birthday, setBirthday] = useState(userProfile?.birthday || "");
  const [gender, setGender] = useState(userProfile?.gender || "");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    setIsSaving(true);
    try {
      updateUserProfile({ name, phone, birthday, gender });
      successHaptic();
      showSuccessToast("Kişisel bilgiler kaydedildi.");
      setTimeout(() => onBack(), 800);
    } catch (err) {
      Alert.alert("Hata", "Bilgiler kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  }

  function InputGroup({ label, value, onChangeText, placeholder, keyboardType = "default" }: any) {
    return (
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
        <View style={[styles.inputWrap, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder }]}>
          <TextInput
            style={[styles.input, { color: colors.textPrimary }]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.searchPlaceholder}
            keyboardType={keyboardType}
            keyboardAppearance={mode}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
      <Pressable style={[styles.backButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]} onPress={onBack}>
        <Ionicons name="chevron-back" size={18} color={colors.primaryMuted} />
        <Text style={[styles.backButtonText, { color: colors.primaryMuted }]}>Geri</Text>
      </Pressable>

      <View style={[styles.hero, { backgroundColor: colors.surfaceAlt, borderColor: colors.cardBorder }]}>
        <View style={[styles.heroGlow, { backgroundColor: colors.glowPrimary }]} />
        <Ionicons name="person" size={28} color={colors.primary} />
        <Text style={[styles.name, { color: colors.textPrimary }]}>Kişisel Bilgiler</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Ad, telefon ve diğer kişisel bilgilerinizi güncelleyin.</Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <InputGroup label="Ad Soyad" value={name} onChangeText={setName} placeholder="Adınız Soyadınız" />
        <InputGroup label="E-posta (Değiştirilemez)" value={userProfile?.email || ""} placeholder="E-posta adresi" />
        <InputGroup label="Telefon" value={phone} onChangeText={setPhone} placeholder="0555 123 45 67" keyboardType="phone-pad" />
        <InputGroup label="Doğum Tarihi" value={birthday} onChangeText={setBirthday} placeholder="GG.AA.YYYY" />
        <InputGroup label="Cinsiyet" value={gender} onChangeText={setGender} placeholder="Belirtmek istemiyorum" />

        <Pressable
          style={[styles.saveButton, { backgroundColor: colors.primary, opacity: isSaving ? 0.7 : 1 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Kaydet</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 80 },
  backButton: {
    alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 4,
    borderWidth: 1, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, marginBottom: 12
  },
  backButtonText: { fontWeight: "700" },
  hero: { borderRadius: 22, borderWidth: 1, padding: 20, alignItems: "center", overflow: "hidden" },
  heroGlow: { position: "absolute", width: 200, height: 200, borderRadius: 999, top: -80, right: -40 },
  name: { fontSize: 22, fontWeight: "800", letterSpacing: -0.2, marginTop: 4 },
  subtitle: { marginTop: 6, lineHeight: 19, textAlign: "center" },
  formCard: { marginTop: 18, borderRadius: 20, borderWidth: 1, padding: 16 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginLeft: 4 },
  inputWrap: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  input: { fontSize: 15 },
  saveButton: {
    borderRadius: 14, paddingVertical: 14, alignItems: "center", justifyContent: "center", marginTop: 8,
    shadowColor: "#6C5CE7", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6
  },
  saveButtonText: { color: "#fff", fontWeight: "800", fontSize: 15 }
});
