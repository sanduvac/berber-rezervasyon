import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";
import { createBarberWithOwner, deleteBarberAndOwner } from "../../services/adminService";
import { getUserDocument } from "../../services/firestoreService";
import { deleteBarberDocument, updateBarberDocument } from "../../services/barberService";
import type { Barber } from "../../types/barber";

const INITIAL_FORM = {
  ownerName: "",
  ownerEmail: "",
  ownerPassword: "",
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

const INITIAL_EDIT_FORM = {
  name: "",
  locationLabel: "",
  description: "",
  coverImageUrl: "",
  openingTime: "",
  closingTime: "",
  latitude: "",
  longitude: ""
};

type FormState = typeof INITIAL_FORM;
type EditFormState = typeof INITIAL_EDIT_FORM;
type OwnerProfile = {
  name: string;
  email: string;
};

export function AdminCreateBarberScreen() {
  const { colors } = useTheme();
  const { barbers, showSuccessToast } = useApp();
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [editForm, setEditForm] = useState<EditFormState>(INITIAL_EDIT_FORM);
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [ownerProfiles, setOwnerProfiles] = useState<Record<string, OwnerProfile>>({});
  const scrollViewRef = useRef<ScrollView>(null);

  const sortedBarbers = useMemo(() => {
    return [...barbers].sort((first, second) => first.name.localeCompare(second.name, "tr"));
  }, [barbers]);

  const selectedBarber = useMemo(() => {
    return selectedBarberId ? barbers.find((barber) => barber.id === selectedBarberId) ?? null : null;
  }, [barbers, selectedBarberId]);

  useEffect(() => {
    const ownerUids = Array.from(new Set(barbers.map((barber) => barber.ownerUid).filter((ownerUid): ownerUid is string => Boolean(ownerUid))));
    if (!ownerUids.length) {
      setOwnerProfiles({});
      return;
    }

    let cancelled = false;

    (async () => {
      const entries = await Promise.all(
        ownerUids.map(async (ownerUid) => {
          try {
            const ownerDoc = await getUserDocument(ownerUid);
            return ownerDoc ? [ownerUid, { name: ownerDoc.name, email: ownerDoc.email }] as const : null;
          } catch {
            return null;
          }
        })
      );

      if (cancelled) return;

      setOwnerProfiles(Object.fromEntries(entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null)));
    })();

    return () => {
      cancelled = true;
    };
  }, [barbers]);

  function updateField(field: keyof FormState, value: string) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function updateEditField(field: keyof EditFormState, value: string) {
    setEditForm((previous) => ({ ...previous, [field]: value }));
  }

  function handleSelectBarberForEdit(barber: Barber) {
    setSelectedBarberId(barber.id);
    setEditForm({
      name: barber.name,
      locationLabel: barber.locationLabel,
      description: barber.description,
      coverImageUrl: barber.coverImageUrl,
      openingTime: barber.openingTime,
      closingTime: barber.closingTime,
      latitude: String(barber.coordinates.latitude),
      longitude: String(barber.coordinates.longitude)
    });
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 80);
  }

  function clearEditSelection() {
    setSelectedBarberId(null);
    setEditForm(INITIAL_EDIT_FORM);
  }

  function getFirebaseErrorMessage(error: any) {
    switch (error?.code) {
      case "auth/email-already-in-use":
        return "Bu sahip e-postası zaten kullanılıyor.";
      case "auth/invalid-email":
        return "Sahip e-posta adresi geçersiz.";
      case "auth/weak-password":
        return "Sahip şifresi en az 6 karakter olmalı.";
      case "permission-denied":
        return "Firebase yazma izni reddedildi. Firestore kurallarını kontrol edin.";
      default:
        return "Berber oluşturulamadı. Bilgileri kontrol edip tekrar deneyin.";
    }
  }

  async function handleCreateBarber() {
    const requiredFields: (keyof FormState)[] = [
      "ownerName",
      "ownerEmail",
      "ownerPassword",
      "barberName",
      "locationLabel",
      "description",
      "coverImageUrl",
      "openingTime",
      "closingTime",
      "latitude",
      "longitude",
      "serviceName",
      "servicePrice"
    ];

    const hasMissingField = requiredFields.some((field) => !form[field].trim());
    if (hasMissingField) {
      Alert.alert("Eksik bilgi", "Lütfen sahip, berber, konum ve ilk hizmet bilgilerini doldurun.");
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
      const result = await createBarberWithOwner({
        ownerName: form.ownerName.trim(),
        ownerEmail: form.ownerEmail.trim().toLowerCase(),
        ownerPassword: form.ownerPassword,
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

      showSuccessToast(`Berber oluşturuldu. Sahip UID: ${result.ownerUid}`);
      setForm(INITIAL_FORM);
    } catch (error: any) {
      Alert.alert("Hata", getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateBarber() {
    if (!selectedBarber) {
      Alert.alert("Berber seçilmedi", "Lütfen düzenlemek istediğiniz berberi seçin.");
      return;
    }

    if (!editForm.name.trim() || !editForm.locationLabel.trim() || !editForm.description.trim() || !editForm.coverImageUrl.trim()) {
      Alert.alert("Eksik bilgi", "Berber adı, konum, açıklama ve fotoğraf alanları boş olamaz.");
      return;
    }

    const latitude = Number.parseFloat(editForm.latitude.replace(",", "."));
    const longitude = Number.parseFloat(editForm.longitude.replace(",", "."));

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      Alert.alert("Geçersiz konum", "Enlem ve boylam sayısal olmalı.");
      return;
    }

    setEditLoading(true);
    try {
      await updateBarberDocument(selectedBarber.id, {
        name: editForm.name.trim(),
        locationLabel: editForm.locationLabel.trim(),
        description: editForm.description.trim(),
        coverImageUrl: editForm.coverImageUrl.trim(),
        openingTime: editForm.openingTime.trim(),
        closingTime: editForm.closingTime.trim(),
        coordinates: {
          latitude,
          longitude
        }
      });

      showSuccessToast("Berber bilgileri güncellendi.");
    } catch {
      Alert.alert("Hata", "Berber bilgileri güncellenemedi.");
    } finally {
      setEditLoading(false);
    }
  }

  function handleDeleteBarber() {
    if (!selectedBarber) {
      Alert.alert("Berber seçilmedi", "Lütfen silmek istediğiniz berberi seçin.");
      return;
    }

    Alert.alert(
      "Berberi Sil",
      `${selectedBarber.name} kalıcı olarak silinsin mi? Bu işlem berberi listeden kaldırır.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Berberi Sil",
          style: "destructive",
          onPress: async () => {
            setEditLoading(true);
            try {
              await deleteBarberDocument(selectedBarber.id);
              clearEditSelection();
              showSuccessToast("Berber silindi.");
            } catch {
              Alert.alert("Hata", "Berber silinemedi.");
            } finally {
              setEditLoading(false);
            }
          }
        }
      ]
    );
  }

  function handleDeleteBarberAndOwner() {
    if (!selectedBarber) {
      Alert.alert("Berber seçilmedi", "Lütfen silmek istediğiniz berberi seçin.");
      return;
    }

    if (!selectedBarber.ownerUid) {
      Alert.alert("Sahip bulunamadı", "Bu berberin bağlı bir sahip UID'si yok. Sadece berberi silebilirsiniz.");
      return;
    }

    Alert.alert(
      "Berberi ve Sahibini Sil",
      `${selectedBarber.name} ve sahibi kalıcı olarak silinsin mi? Bu işlem hem berberi hem de sahip hesabını veritabanından kaldırır.`,
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Her İkisini de Sil",
          style: "destructive",
          onPress: async () => {
            setEditLoading(true);
            try {
              await deleteBarberAndOwner(selectedBarber.id, selectedBarber.ownerUid!);
              clearEditSelection();
              showSuccessToast("Berber ve sahibi silindi.");
            } catch {
              Alert.alert("Hata", "Berber ve sahibi silinemedi.");
            } finally {
              setEditLoading(false);
            }
          }
        }
      ]
    );
  }

  return (
    <ScrollView ref={scrollViewRef} style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Yeni Berber ve Sahip Oluştur</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Her yeni berber için önce sahip hesabı açılır, sonra berber Firestore’a bu sahip UID’si ile bağlanır.
        </Text>
      </View>

      <View style={styles.grid}>
        <View style={[styles.formCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <SectionTitle icon="person-add-outline" title="Sahip Hesabı" colors={colors} />
          <View style={styles.inputRow}>
            <Input label="Sahip Ad Soyad" value={form.ownerName} onChangeText={(value) => updateField("ownerName", value)} colors={colors} />
            <Input label="Sahip E-posta" value={form.ownerEmail} onChangeText={(value) => updateField("ownerEmail", value)} colors={colors} keyboardType="email-address" />
          </View>
          <Input label="Geçici Şifre" value={form.ownerPassword} onChangeText={(value) => updateField("ownerPassword", value)} colors={colors} secureTextEntry />

          <View style={styles.divider} />

          <SectionTitle icon="storefront-outline" title="Berber Bilgileri" colors={colors} />
          <Input label="Berber Adı" value={form.barberName} onChangeText={(value) => updateField("barberName", value)} colors={colors} />
          <Input label="Konum Etiketi" value={form.locationLabel} onChangeText={(value) => updateField("locationLabel", value)} colors={colors} placeholder="Örn: Kadıköy / İstanbul" />
          <Input label="Açıklama" value={form.description} onChangeText={(value) => updateField("description", value)} colors={colors} multiline />
          <Input label="Kapak Fotoğraf URL" value={form.coverImageUrl} onChangeText={(value) => updateField("coverImageUrl", value)} colors={colors} placeholder="https://..." />

          <View style={styles.inputRow}>
            <Input label="Açılış" value={form.openingTime} onChangeText={(value) => updateField("openingTime", value)} colors={colors} placeholder="09:00" />
            <Input label="Kapanış" value={form.closingTime} onChangeText={(value) => updateField("closingTime", value)} colors={colors} placeholder="18:00" />
          </View>

          <View style={styles.inputRow}>
            <Input label="Enlem" value={form.latitude} onChangeText={(value) => updateField("latitude", value)} colors={colors} placeholder="41.0082" keyboardType="numeric" />
            <Input label="Boylam" value={form.longitude} onChangeText={(value) => updateField("longitude", value)} colors={colors} placeholder="28.9784" keyboardType="numeric" />
          </View>

          <View style={styles.divider} />

          <SectionTitle icon="cut-outline" title="İlk Hizmet" colors={colors} />
          <View style={styles.inputRow}>
            <Input label="Hizmet Adı" value={form.serviceName} onChangeText={(value) => updateField("serviceName", value)} colors={colors} placeholder="Saç Kesimi" />
            <Input label="Fiyat (TL)" value={form.servicePrice} onChangeText={(value) => updateField("servicePrice", value)} colors={colors} keyboardType="numeric" />
          </View>

          <Pressable style={[styles.createButton, { backgroundColor: colors.primary }, loading && styles.disabledButton]} onPress={handleCreateBarber} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                <Text style={styles.createButtonText}>Berberi ve Sahibini Oluştur</Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={[styles.listCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <SectionTitle icon="business-outline" title={`Mevcut Berberler (${sortedBarbers.length})`} colors={colors} />
          {sortedBarbers.map((barber) => {
            const ownerProfile = barber.ownerUid ? ownerProfiles[barber.ownerUid] : undefined;
            const ownerName = barber.ownerName || ownerProfile?.name || "İsim bilgisi yok";
            const ownerEmail = barber.ownerEmail || ownerProfile?.email;
            const isSelected = selectedBarberId === barber.id;

            return (
              <View key={barber.id} style={[styles.barberItem, { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.cardBorder }]}>
                <Text style={[styles.barberName, { color: colors.textPrimary }]}>{barber.name}</Text>
                <Text style={[styles.barberMeta, { color: colors.textSecondary }]}>
                  Sahip: {ownerName}
                </Text>
                {ownerEmail ? (
                  <Text style={[styles.barberMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                    E-posta: {ownerEmail}
                  </Text>
                ) : null}
                <Text style={[styles.barberMeta, { color: colors.textMuted }]} numberOfLines={1}>
                  ownerUid: {barber.ownerUid || "-"}
                </Text>
                <Pressable
                  style={[styles.editBarberButton, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}
                  onPress={() => handleSelectBarberForEdit(barber)}
                >
                  <Ionicons name={isSelected ? "checkmark-circle-outline" : "create-outline"} size={16} color={colors.primary} />
                  <Text style={[styles.editBarberButtonText, { color: colors.primary }]}>{isSelected ? "Düzenleniyor" : "Berberi Düzenle"}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </View>

      {selectedBarber ? (
        <View style={[styles.editCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          <View style={styles.editHeader}>
            <View>
              <Text style={[styles.editTitle, { color: colors.textPrimary }]}>Berberi Düzenle</Text>
              <Text style={[styles.editSubtitle, { color: colors.textSecondary }]}>
                {selectedBarber.name} bilgilerini güncelleyin.
              </Text>
            </View>
            <Pressable style={[styles.closeEditButton, { borderColor: colors.cardBorder }]} onPress={clearEditSelection}>
              <Ionicons name="close" size={18} color={colors.textSecondary} />
              <Text style={[styles.closeEditText, { color: colors.textSecondary }]}>Kapat</Text>
            </Pressable>
          </View>

          <View style={styles.inputRow}>
            <Input label="Berber Adı" value={editForm.name} onChangeText={(value) => updateEditField("name", value)} colors={colors} />
            <Input label="Konum Etiketi" value={editForm.locationLabel} onChangeText={(value) => updateEditField("locationLabel", value)} colors={colors} />
          </View>
          <Input label="Açıklama" value={editForm.description} onChangeText={(value) => updateEditField("description", value)} colors={colors} multiline />
          <Input label="Kapak Fotoğraf URL" value={editForm.coverImageUrl} onChangeText={(value) => updateEditField("coverImageUrl", value)} colors={colors} />

          <View style={styles.inputRow}>
            <Input label="Açılış" value={editForm.openingTime} onChangeText={(value) => updateEditField("openingTime", value)} colors={colors} />
            <Input label="Kapanış" value={editForm.closingTime} onChangeText={(value) => updateEditField("closingTime", value)} colors={colors} />
          </View>

          <View style={styles.inputRow}>
            <Input label="Enlem" value={editForm.latitude} onChangeText={(value) => updateEditField("latitude", value)} colors={colors} keyboardType="numeric" />
            <Input label="Boylam" value={editForm.longitude} onChangeText={(value) => updateEditField("longitude", value)} colors={colors} keyboardType="numeric" />
          </View>

          <Pressable
            style={[styles.updateButton, { backgroundColor: colors.primary }, editLoading && styles.disabledButton]}
            onPress={handleUpdateBarber}
            disabled={editLoading}
          >
            {editLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.updateButtonText}>Değişiklikleri Kaydet</Text>
              </>
            )}
          </Pressable>

          <View style={[styles.deleteZone, { borderColor: colors.errorBorder, backgroundColor: colors.errorBg }]}>
            <View style={styles.deleteZoneText}>
              <Text style={[styles.deleteZoneTitle, { color: colors.error }]}>Berberi Sil</Text>
              <Text style={[styles.deleteZoneDesc, { color: colors.error }]}>
                Bu işlem berberi Firestore listesinden kaldırır. Sahip hesabı silinmez.
              </Text>
            </View>
            <Pressable style={[styles.deleteBarberButton, editLoading && styles.disabledButton]} onPress={handleDeleteBarber} disabled={editLoading}>
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text style={styles.deleteBarberButtonText}>Berberi Sil</Text>
            </Pressable>
          </View>

          <View style={[styles.deleteZone, { borderColor: colors.errorBorder, backgroundColor: colors.errorBg, marginTop: 10 }]}>
            <View style={styles.deleteZoneText}>
              <Text style={[styles.deleteZoneTitle, { color: colors.error }]}>Berberi ve Sahibini Sil</Text>
              <Text style={[styles.deleteZoneDesc, { color: colors.error }]}>
                Bu işlem berber ve berber sahibini veritabanından siler.
              </Text>
            </View>
            <Pressable style={[styles.deleteBarberButton, { backgroundColor: "#B91C1C" }, editLoading && styles.disabledButton]} onPress={handleDeleteBarberAndOwner} disabled={editLoading}>
              <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
              <Text style={styles.deleteBarberButtonText}>Her İkisini Sil</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function SectionTitle({ icon, title, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.sectionTitleRow}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
    </View>
  );
}

function Input({ label, value, onChangeText, colors, placeholder, keyboardType, secureTextEntry = false, multiline = false }: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  colors: ReturnType<typeof useTheme>["colors"];
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "numeric";
  secureTextEntry?: boolean;
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
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 60
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.5
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
    maxWidth: 760
  },
  grid: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 18
  },
  formCard: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22
  },
  listCard: {
    width: 360,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20
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
  createButton: {
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
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15
  },
  editCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 22,
    marginTop: 18
  },
  editHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18
  },
  editTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4
  },
  editSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700"
  },
  closeEditButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  closeEditText: {
    fontSize: 13,
    fontWeight: "800"
  },
  updateButton: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    marginBottom: 18
  },
  updateButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15
  },
  deleteZone: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14
  },
  deleteZoneText: {
    flex: 1
  },
  deleteZoneTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4
  },
  deleteZoneDesc: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19
  },
  deleteBarberButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: "#EF4444"
  },
  deleteBarberButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14
  },
  barberItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10
  },
  barberName: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 6
  },
  barberMeta: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18
  },
  editBarberButton: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  editBarberButtonText: {
    fontSize: 13,
    fontWeight: "900"
  }
});
