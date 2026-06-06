import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";
import { useAuth } from "../../context/AuthContext";
import { submitBarberRequest } from "../../services/barberRequestService";

const INITIAL_FORM = {
  barberName: "",
  locationLabel: "",
  description: "",
  coverImageUrl: "",
  openingTime: "09:00",
  closingTime: "18:00",
  latitude: "",
  longitude: "",
  serviceName: "",
  servicePrice: ""
};

type FormState = typeof INITIAL_FORM;

export function BarberCreateRequestScreen({ onSubmitted }: { onSubmitted?: () => void }) {
  const { colors } = useTheme();
  const { showSuccessToast, userProfile } = useApp();
  const { user } = useAuth();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (!user || !userProfile) return;

    const requiredFields: (keyof FormState)[] = [
      "barberName", "locationLabel", "description", "coverImageUrl",
      "openingTime", "closingTime", "latitude", "longitude",
      "serviceName", "servicePrice"
    ];

    const hasMissing = requiredFields.some((f) => !form[f].trim());
    if (hasMissing) {
      Alert.alert("Eksik bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }

    const latitude = Number.parseFloat(form.latitude.replace(",", "."));
    const longitude = Number.parseFloat(form.longitude.replace(",", "."));
    const servicePrice = Number.parseInt(form.servicePrice, 10);

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      Alert.alert("Geçersiz konum", "Enlem ve boylam sayısal olmalı.");
      return;
    }

    if (Number.isNaN(servicePrice) || servicePrice <= 0) {
      Alert.alert("Geçersiz fiyat", "İlk hizmet için geçerli bir fiyat girin.");
      return;
    }

    setLoading(true);
    try {
      await submitBarberRequest({
        ownerUid: user.uid,
        ownerName: userProfile.name || user.displayName || "",
        ownerEmail: userProfile.email || user.email || "",
        barberName: form.barberName.trim(),
        locationLabel: form.locationLabel.trim(),
        description: form.description.trim(),
        coverImageUrl: form.coverImageUrl.trim(),
        openingTime: form.openingTime.trim(),
        closingTime: form.closingTime.trim(),
        latitude,
        longitude,
        services: [{
          id: `service-${Date.now()}`,
          name: form.serviceName.trim(),
          price: servicePrice
        }]
      });

      showSuccessToast("Başvurunuz gönderildi! Admin onayı bekleniyor.");
      setForm(INITIAL_FORM);
      onSubmitted?.();
    } catch (error: any) {
      Alert.alert("Hata", "Başvuru gönderilemedi. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
          <Ionicons name="storefront-outline" size={32} color={colors.primary} />
        </View>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Yeni Berber Başvurusu</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Berber bilgilerinizi girin ve onaya gönderin. Platform yöneticisi başvurunuzu inceledikten sonra berberiniz oluşturulacaktır.
        </Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <View style={styles.sectionTitleRow}>
          <Ionicons name="storefront-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Berber Bilgileri</Text>
        </View>

        <Input label="Berber Adı" value={form.barberName} onChangeText={(v) => updateField("barberName", v)} colors={colors} />
        <Input label="Konum Etiketi" value={form.locationLabel} onChangeText={(v) => updateField("locationLabel", v)} colors={colors} placeholder="Örn: Kadıköy / İstanbul" />
        <Input label="Açıklama" value={form.description} onChangeText={(v) => updateField("description", v)} colors={colors} multiline />
        <Input label="Kapak Fotoğraf URL" value={form.coverImageUrl} onChangeText={(v) => updateField("coverImageUrl", v)} colors={colors} placeholder="https://..." />

        <View style={styles.inputRow}>
          <Input label="Açılış" value={form.openingTime} onChangeText={(v) => updateField("openingTime", v)} colors={colors} placeholder="09:00" />
          <Input label="Kapanış" value={form.closingTime} onChangeText={(v) => updateField("closingTime", v)} colors={colors} placeholder="18:00" />
        </View>

        <View style={styles.inputRow}>
          <Input label="Enlem" value={form.latitude} onChangeText={(v) => updateField("latitude", v)} colors={colors} placeholder="41.0082" keyboardType="numeric" />
          <Input label="Boylam" value={form.longitude} onChangeText={(v) => updateField("longitude", v)} colors={colors} placeholder="28.9784" keyboardType="numeric" />
        </View>

        <View style={styles.divider} />

        <View style={styles.sectionTitleRow}>
          <Ionicons name="cut-outline" size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>İlk Hizmet</Text>
        </View>

        <View style={styles.inputRow}>
          <Input label="Hizmet Adı" value={form.serviceName} onChangeText={(v) => updateField("serviceName", v)} colors={colors} placeholder="Saç Kesimi" />
          <Input label="Fiyat (TL)" value={form.servicePrice} onChangeText={(v) => updateField("servicePrice", v)} colors={colors} keyboardType="numeric" />
        </View>

        <Pressable
          style={[styles.submitButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Başvuruyu Gönder</Text>
            </>
          )}
        </Pressable>

        <View style={[styles.infoBox, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.infoBoxText, { color: colors.primary }]}>
            Başvurunuz gönderildikten sonra platform yöneticisi tarafından incelenecektir. Onaylandığında berberiniz otomatik olarak oluşturulacaktır.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function Input({ label, value, onChangeText, colors, placeholder, keyboardType, multiline = false }: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: any;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric";
  multiline?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.textArea,
          { backgroundColor: colors.searchBg, borderColor: colors.searchBorder, color: colors.textPrimary }
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.searchPlaceholder}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 60,
    maxWidth: 720
  },
  header: {
    alignItems: "center",
    marginBottom: 30
  },
  headerIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.4,
    textAlign: "center"
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
    maxWidth: 500
  },
  formCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "900"
  },
  inputRow: {
    flexDirection: "row",
    gap: 14
  },
  inputGroup: {
    flex: 1,
    marginBottom: 15
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    outlineStyle: "none"
  } as any,
  textArea: {
    minHeight: 86,
    lineHeight: 22
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(148, 163, 184, 0.18)",
    marginVertical: 8,
    marginBottom: 20
  },
  submitButton: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 6,
    shadowColor: "#6C5CE7",
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }
  },
  disabledButton: {
    opacity: 0.65
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 16
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 20
  }
});
