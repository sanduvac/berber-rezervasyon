import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { useApp } from "../../context/AppContext";
import {
  subscribeToAllBarberRequests,
  approveBarberRequest,
  rejectBarberRequest
} from "../../services/barberRequestService";
import type { BarberRequest } from "../../types/barberRequest";

export function AdminBarberApprovalScreen() {
  const { colors, mode } = useTheme();
  const { showSuccessToast } = useApp();
  const [requests, setRequests] = useState<BarberRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BarberRequest | null>(null);
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAllBarberRequests(setRequests);
    return unsubscribe;
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const processedRequests = requests.filter((r) => r.status !== "pending");

  async function handleApprove() {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      await approveBarberRequest(selectedRequest);
      showSuccessToast(`${selectedRequest.barberName} onaylandı ve oluşturuldu.`);
      setSelectedRequest(null);
    } catch {
      // Alert yapılabilir ama basit tutalım
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!selectedRequest || !rejectionReason.trim()) return;
    setLoading(true);
    try {
      await rejectBarberRequest(selectedRequest.id, rejectionReason.trim());
      showSuccessToast(`${selectedRequest.barberName} başvurusu reddedildi.`);
      setSelectedRequest(null);
      setRejectionReason("");
      setShowRejectForm(false);
    } catch {
      // hata
    } finally {
      setLoading(false);
    }
  }

  function selectRequest(request: BarberRequest) {
    setSelectedRequest(request);
    setShowRejectForm(false);
    setRejectionReason("");
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "pending":
        return { label: "Bekliyor", bg: mode === "dark" ? "rgba(251, 191, 36, 0.15)" : "#FFFBEB", border: mode === "dark" ? "rgba(251, 191, 36, 0.3)" : "#FDE68A", text: "#F59E0B" };
      case "approved":
        return { label: "Onaylandı", bg: mode === "dark" ? "rgba(34, 197, 94, 0.15)" : "#F0FDF4", border: mode === "dark" ? "rgba(34, 197, 94, 0.3)" : "#BBF7D0", text: "#22C55E" };
      case "rejected":
        return { label: "Reddedildi", bg: mode === "dark" ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2", border: mode === "dark" ? "rgba(239, 68, 68, 0.3)" : "#FECACA", text: "#EF4444" };
      default:
        return { label: status, bg: colors.surface, border: colors.cardBorder, text: colors.textSecondary };
    }
  }

  function formatDate(timestamp: number) {
    const d = new Date(timestamp);
    return d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Berber Onay Yönetimi</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Berber sahiplerinden gelen başvuruları inceleyin, onaylayın veya reddedin.
        </Text>
      </View>

      <View style={styles.grid}>
        {/* Sol: Talep Listesi */}
        <View style={[styles.listCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {/* Bekleyen */}
          <View style={styles.sectionTitleRow}>
            <Ionicons name="time-outline" size={20} color="#F59E0B" />
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              Bekleyen Başvurular ({pendingRequests.length})
            </Text>
          </View>

          {pendingRequests.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
              <Ionicons name="checkmark-done-circle-outline" size={32} color={colors.textMuted} />
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>Bekleyen başvuru yok</Text>
            </View>
          ) : (
            pendingRequests.map((request) => {
              const isSelected = selectedRequest?.id === request.id;
              const badge = getStatusBadge(request.status);
              return (
                <Pressable
                  key={request.id}
                  style={[styles.requestItem, { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.cardBorder }]}
                  onPress={() => selectRequest(request)}
                >
                  <View style={styles.requestItemHeader}>
                    <Text style={[styles.requestName, { color: colors.textPrimary }]}>{request.barberName}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.requestMeta, { color: colors.textSecondary }]}>
                    Sahip: {request.ownerName}
                  </Text>
                  <Text style={[styles.requestMeta, { color: colors.textSecondary }]}>
                    Konum: {request.locationLabel}
                  </Text>
                  <Text style={[styles.requestMeta, { color: colors.textMuted }]}>
                    {formatDate(request.createdAt)}
                  </Text>
                </Pressable>
              );
            })
          )}

          {/* İşlenenler */}
          {processedRequests.length > 0 ? (
            <>
              <View style={[styles.sectionTitleRow, { marginTop: 24 }]}>
                <Ionicons name="archive-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Geçmiş ({processedRequests.length})
                </Text>
              </View>
              {processedRequests.map((request) => {
                const isSelected = selectedRequest?.id === request.id;
                const badge = getStatusBadge(request.status);
                return (
                  <Pressable
                    key={request.id}
                    style={[styles.requestItem, { backgroundColor: colors.surface, borderColor: isSelected ? colors.primary : colors.cardBorder, opacity: 0.7 }]}
                    onPress={() => selectRequest(request)}
                  >
                    <View style={styles.requestItemHeader}>
                      <Text style={[styles.requestName, { color: colors.textPrimary }]}>{request.barberName}</Text>
                      <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                        <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
                      </View>
                    </View>
                    <Text style={[styles.requestMeta, { color: colors.textSecondary }]}>
                      Sahip: {request.ownerName}
                    </Text>
                    {request.status === "rejected" && request.rejectionReason ? (
                      <Text style={[styles.requestMeta, { color: "#EF4444" }]} numberOfLines={1}>
                        Sebep: {request.rejectionReason}
                      </Text>
                    ) : null}
                  </Pressable>
                );
              })}
            </>
          ) : null}
        </View>

        {/* Sağ: Seçili Detay */}
        <View style={[styles.detailCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
          {selectedRequest ? (
            <>
              <View style={styles.detailHeader}>
                <View>
                  <Text style={[styles.detailTitle, { color: colors.textPrimary }]}>{selectedRequest.barberName}</Text>
                  <Text style={[styles.detailSubtitle, { color: colors.textSecondary }]}>
                    Başvuru Detayları
                  </Text>
                </View>
                <Pressable
                  style={[styles.closeBtn, { borderColor: colors.cardBorder }]}
                  onPress={() => { setSelectedRequest(null); setShowRejectForm(false); }}
                >
                  <Ionicons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              </View>

              {/* Bilgi Kartları */}
              <View style={styles.infoGrid}>
                <InfoRow icon="person-outline" label="Sahip Adı" value={selectedRequest.ownerName} colors={colors} />
                <InfoRow icon="mail-outline" label="Sahip E-posta" value={selectedRequest.ownerEmail} colors={colors} />
                <InfoRow icon="location-outline" label="Konum" value={selectedRequest.locationLabel} colors={colors} />
                <InfoRow icon="time-outline" label="Çalışma Saatleri" value={`${selectedRequest.openingTime} – ${selectedRequest.closingTime}`} colors={colors} />
                <InfoRow icon="navigate-outline" label="Koordinatlar" value={`${selectedRequest.latitude}, ${selectedRequest.longitude}`} colors={colors} />
              </View>

              <View style={[styles.descBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                <Text style={[styles.descLabel, { color: colors.textSecondary }]}>Açıklama</Text>
                <Text style={[styles.descText, { color: colors.textPrimary }]}>{selectedRequest.description}</Text>
              </View>

              {selectedRequest.coverImageUrl ? (
                <View style={[styles.descBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.descLabel, { color: colors.textSecondary }]}>Kapak Fotoğraf URL</Text>
                  <Text style={[styles.descText, { color: colors.primary }]} numberOfLines={2}>{selectedRequest.coverImageUrl}</Text>
                </View>
              ) : null}

              {selectedRequest.services.length > 0 ? (
                <View style={[styles.descBox, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
                  <Text style={[styles.descLabel, { color: colors.textSecondary }]}>Hizmetler</Text>
                  {selectedRequest.services.map((service) => (
                    <Text key={service.id} style={[styles.descText, { color: colors.textPrimary }]}>
                      • {service.name} — {service.price} TL
                    </Text>
                  ))}
                </View>
              ) : null}

              <Text style={[styles.requestMeta, { color: colors.textMuted, marginTop: 12 }]}>
                Başvuru tarihi: {formatDate(selectedRequest.createdAt)}
              </Text>
              {selectedRequest.reviewedAt ? (
                <Text style={[styles.requestMeta, { color: colors.textMuted }]}>
                  İşlem tarihi: {formatDate(selectedRequest.reviewedAt)}
                </Text>
              ) : null}

              {/* Reddet formu */}
              {showRejectForm ? (
                <View style={[styles.rejectZone, { borderColor: colors.errorBorder, backgroundColor: colors.errorBg }]}>
                  <Text style={[styles.rejectTitle, { color: colors.error }]}>Reddetme Sebebi</Text>
                  <Text style={[styles.rejectHint, { color: colors.error }]}>
                    Berber sahibine gösterilecek sebebi yazın.
                  </Text>
                  <TextInput
                    style={[styles.rejectInput, { backgroundColor: colors.searchBg, borderColor: colors.searchBorder, color: colors.textPrimary }]}
                    placeholder="Reddetme sebebini girin..."
                    placeholderTextColor={colors.searchPlaceholder}
                    value={rejectionReason}
                    onChangeText={setRejectionReason}
                    multiline
                    textAlignVertical="top"
                  />
                  <View style={styles.rejectActions}>
                    <Pressable
                      style={[styles.cancelRejectBtn, { borderColor: colors.cardBorder }]}
                      onPress={() => { setShowRejectForm(false); setRejectionReason(""); }}
                    >
                      <Text style={[styles.cancelRejectText, { color: colors.textSecondary }]}>Vazgeç</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.confirmRejectBtn, !rejectionReason.trim() && styles.disabledButton, loading && styles.disabledButton]}
                      onPress={handleReject}
                      disabled={!rejectionReason.trim() || loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" />
                          <Text style={styles.confirmRejectText}>Reddet</Text>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              ) : null}

              {/* Aksiyon Butonları — sadece pending ise */}
              {selectedRequest.status === "pending" && !showRejectForm ? (
                <View style={styles.actionRow}>
                  <Pressable
                    style={[styles.rejectBtn, loading && styles.disabledButton]}
                    onPress={() => setShowRejectForm(true)}
                    disabled={loading}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.rejectBtnText}>Reddet</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.approveBtn, loading && styles.disabledButton]}
                    onPress={handleApprove}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                        <Text style={styles.approveBtnText}>Onayla</Text>
                      </>
                    )}
                  </Pressable>
                </View>
              ) : null}

              {/* Sonuç göstergesi (zaten işlenmiş) */}
              {selectedRequest.status === "approved" ? (
                <View style={[styles.resultBanner, { backgroundColor: mode === "dark" ? "rgba(34, 197, 94, 0.12)" : "#F0FDF4", borderColor: mode === "dark" ? "rgba(34, 197, 94, 0.3)" : "#BBF7D0" }]}>
                  <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
                  <Text style={[styles.resultText, { color: "#22C55E" }]}>Bu başvuru onaylanmış ve berber oluşturulmuş.</Text>
                </View>
              ) : null}
              {selectedRequest.status === "rejected" ? (
                <View style={[styles.resultBanner, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.resultText, { color: "#EF4444" }]}>Bu başvuru reddedilmiş.</Text>
                    {selectedRequest.rejectionReason ? (
                      <Text style={[styles.resultReason, { color: "#EF4444" }]}>
                        Sebep: {selectedRequest.rejectionReason}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.emptyDetail}>
              <View style={[styles.emptyDetailIcon, { backgroundColor: colors.primaryBg }]}>
                <Ionicons name="document-text-outline" size={40} color={colors.primary} />
              </View>
              <Text style={[styles.emptyDetailTitle, { color: colors.textPrimary }]}>Başvuru Seçin</Text>
              <Text style={[styles.emptyDetailDesc, { color: colors.textSecondary }]}>
                Sol listeden bir başvuru seçerek detaylarını görüntüleyebilir ve işlem yapabilirsiniz.
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={[infoStyles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[infoStyles.value, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(148, 163, 184, 0.15)"
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    width: 120
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1
  }
});

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
  listCard: {
    width: 380,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20
  },
  detailCard: {
    flex: 1,
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
  emptyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "700"
  },
  requestItem: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10
  },
  requestItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6
  },
  requestName: {
    fontSize: 16,
    fontWeight: "900",
    flex: 1
  },
  badge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800"
  },
  requestMeta: {
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.4
  },
  detailSubtitle: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700"
  },
  closeBtn: {
    borderWidth: 1,
    borderRadius: 999,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center"
  },
  infoGrid: {
    marginBottom: 16
  },
  descBox: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10
  },
  descLabel: {
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6
  },
  descText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20
  },
  approveBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#22C55E",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }
  },
  approveBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15
  },
  rejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EF4444",
    borderRadius: 16,
    paddingVertical: 16
  },
  rejectBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15
  },
  disabledButton: {
    opacity: 0.55
  },
  rejectZone: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 18
  },
  rejectTitle: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4
  },
  rejectHint: {
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginBottom: 12
  },
  rejectInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 80,
    lineHeight: 22,
    outlineStyle: "none"
  } as any,
  rejectActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14
  },
  cancelRejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  cancelRejectText: {
    fontWeight: "800",
    fontSize: 14
  },
  confirmRejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#EF4444",
    borderRadius: 14,
    paddingVertical: 13
  },
  confirmRejectText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14
  },
  resultBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 18
  },
  resultText: {
    fontWeight: "800",
    fontSize: 14
  },
  resultReason: {
    fontWeight: "700",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 19
  },
  emptyDetail: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80
  },
  emptyDetailIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20
  },
  emptyDetailTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8
  },
  emptyDetailDesc: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    maxWidth: 320,
    lineHeight: 22
  }
});
