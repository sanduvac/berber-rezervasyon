import { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";
import type { BarberService } from "../../types/barber";

export function BarberServicesScreen() {
  const { colors } = useTheme();
  const { ownedBarber, updateOwnedBarber, showSuccessToast } = useApp();

  const [newName, setNewName] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const services = ownedBarber?.services ?? [];

  async function handleAddService() {
    if (!newName.trim() || !newPrice.trim()) {
      Alert.alert("Uyarı", "Lütfen hizmet adı ve fiyatını girin.");
      return;
    }

    const price = Number.parseInt(newPrice, 10);
    if (Number.isNaN(price) || price <= 0) {
      Alert.alert("Uyarı", "Lütfen geçerli bir fiyat girin.");
      return;
    }

    const newService: BarberService = {
      id: `service-${Date.now()}`,
      name: newName.trim(),
      price
    };

    await updateOwnedBarber({ services: [...services, newService] });
    showSuccessToast("Hizmet eklendi.");
    setNewName("");
    setNewPrice("");
  }

  function handleDeleteService(id: string) {
    Alert.alert("Sil", "Hizmeti silmek istediğinize emin misiniz?", [
      { text: "İptal", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          await updateOwnedBarber({ services: services.filter(s => s.id !== id) });
          showSuccessToast("Hizmet silindi.");
        }
      }
    ]);
  }

  if (!ownedBarber) {
    return (
      <View style={[styles.emptyOwnerCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Ionicons name="storefront-outline" size={42} color={colors.textMuted} />
        <Text style={[styles.emptyOwnerTitle, { color: colors.textPrimary }]}>Berber ataması yok</Text>
        <Text style={[styles.emptyOwnerText, { color: colors.textSecondary }]}>
          Bu yönetici hesabı bir berbere bağlanınca hizmetleri buradan düzenleyebilir.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Hizmetler ve Fiyatlar</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{ownedBarber.name} hizmetlerini ve fiyatlarını yönetin.</Text>
      </View>

      <View style={[styles.addCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Yeni Hizmet Ekle</Text>
        
        <View style={styles.inputRow}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Hizmet Adı</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder, color: colors.textPrimary }]}
              placeholder="Örn: Cilt Bakımı"
              placeholderTextColor={colors.searchPlaceholder}
              value={newName}
              onChangeText={setNewName}
            />
          </View>
          <View style={[styles.inputGroup, { flex: 0.5 }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Fiyat (TL)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder, color: colors.textPrimary }]}
              placeholder="Örn: 250"
              placeholderTextColor={colors.searchPlaceholder}
              keyboardType="numeric"
              value={newPrice}
              onChangeText={setNewPrice}
            />
          </View>
        </View>
        
        <Pressable style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={handleAddService}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Hizmeti Ekle</Text>
        </Pressable>
      </View>

      <View style={styles.listSection}>
        <Text style={[styles.listTitle, { color: colors.textPrimary }]}>Mevcut Hizmetler ({services.length})</Text>
        
        {services.map(service => (
          <View key={service.id} style={[styles.serviceItem, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
            <View style={styles.serviceInfo}>
              <Text style={[styles.serviceName, { color: colors.textPrimary }]}>{service.name}</Text>
              <View style={styles.serviceMeta}>
                <View style={styles.metaBadge}>
                  <Ionicons name="wallet-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.metaText, { color: colors.textSecondary }]}>{service.price} TL</Text>
                </View>
              </View>
            </View>
            <Pressable style={styles.deleteBtn} onPress={() => handleDeleteService(service.id)}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </Pressable>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
  },
  addCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  listSection: {
    paddingBottom: 40,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: "500",
  },
  deleteBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyOwnerCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyOwnerTitle: {
    marginTop: 14,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: "800",
  },
  emptyOwnerText: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  }
});
