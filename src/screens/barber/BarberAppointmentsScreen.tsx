import { View, Text, StyleSheet, FlatList, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";
import { formatDateLabel } from "../../utils/dateUtils";

export function BarberAppointmentsScreen() {
  const { colors } = useTheme();
  const { appointments, barbers, ownedBarber } = useApp();

  // Şimdilik test amaçlı müşteri olarak aldığımız randevuları "Berberin Gelen Randevuları" gibi gösteriyoruz.
  // Normalde Firestore'da: where("barberId", "==", user.uid) sorgusu yapılır.
  
  function handleCancel() {
    Alert.alert("Emin Misiniz?", "Bu randevuyu iptal etmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      { text: "İptal Et", style: "destructive", onPress: () => { /* İptal mantığı */ } }
    ]);
  }

  function handleComplete() {
    Alert.alert("Randevuyu Tamamla", "Müşteri hizmeti aldı mı?", [
      { text: "Hayır", style: "cancel" },
      { text: "Evet, Tamamlandı", onPress: () => { /* Tamamlandı mantığı */ } }
    ]);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Gelen Randevular</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {ownedBarber ? `${ownedBarber.name} için alınan randevuları yönetin.` : "Bu yönetici hesabına atanmış bir berber yok."}
        </Text>
      </View>

      <FlatList
        data={appointments}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="calendar-clear-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.emptyText, { color: colors.textMuted }]}>Henüz alınmış bir randevu yok.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const barber = barbers.find(b => b.id === item.barberId);
          const service = barber?.services.find(s => s.id === item.serviceId);
          
          return (
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={[styles.customerName, { color: colors.textPrimary }]}>{item.customerName || `Müşteri ${item.id.slice(0, 4)}`}</Text>
                  <Text style={[styles.serviceName, { color: colors.primary }]}>{service?.name || "Hizmet"}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.primaryBg, borderColor: colors.primaryBorder }]}>
                  <Text style={[styles.statusText, { color: colors.primary }]}>{item.status || "upcoming"}</Text>
                </View>
              </View>

              <View style={[styles.detailsRow, { borderTopColor: colors.divider }]}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{formatDateLabel(item.date)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.time}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="wallet-outline" size={16} color={colors.textSecondary} />
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{service?.price} TL</Text>
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable style={[styles.actionBtn, styles.cancelBtn]} onPress={handleCancel}>
                  <Ionicons name="close" size={16} color="#EF4444" />
                  <Text style={styles.cancelText}>İptal Et</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, { backgroundColor: colors.primary }]} onPress={handleComplete}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.completeText}>Tamamlandı</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
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
  listContent: {
    paddingBottom: 40,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  detailsRow: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
  },
  cancelBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  cancelText: {
    color: "#EF4444",
    fontWeight: "700",
    fontSize: 14,
  },
  completeText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 14,
  }
});
