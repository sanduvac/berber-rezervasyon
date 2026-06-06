import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../theme/ThemeContext";
import { markRequestAsSeen } from "../../services/barberRequestService";
import type { BarberRequest } from "../../types/barberRequest";

type Props = {
  request: BarberRequest;
  onDismiss: () => void;
};

export function BarberRequestStatusScreen({ request, onDismiss }: Props) {
  const { colors, mode } = useTheme();
  const [loading, setLoading] = useState(false);

  const isApproved = request.status === "approved";
  const isRejected = request.status === "rejected";

  async function handleDismiss() {
    setLoading(true);
    try {
      await markRequestAsSeen(request.id);
    } catch {
      // Sessizce devam et
    } finally {
      setLoading(false);
      onDismiss();
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}>
        {/* Glow efekti */}
        <View style={[
          styles.glow,
          { backgroundColor: isApproved ? "rgba(34, 197, 94, 0.08)" : isRejected ? "rgba(239, 68, 68, 0.08)" : "rgba(251, 191, 36, 0.08)" }
        ]} />

        {/* İkon */}
        <View style={[
          styles.iconWrap,
          {
            backgroundColor: isApproved
              ? (mode === "dark" ? "rgba(34, 197, 94, 0.15)" : "#F0FDF4")
              : isRejected
                ? (mode === "dark" ? "rgba(239, 68, 68, 0.15)" : "#FEF2F2")
                : (mode === "dark" ? "rgba(251, 191, 36, 0.15)" : "#FFFBEB"),
            borderColor: isApproved
              ? (mode === "dark" ? "rgba(34, 197, 94, 0.3)" : "#BBF7D0")
              : isRejected
                ? (mode === "dark" ? "rgba(239, 68, 68, 0.3)" : "#FECACA")
                : (mode === "dark" ? "rgba(251, 191, 36, 0.3)" : "#FDE68A")
          }
        ]}>
          <Ionicons
            name={isApproved ? "checkmark-circle" : isRejected ? "close-circle" : "time"}
            size={56}
            color={isApproved ? "#22C55E" : isRejected ? "#EF4444" : "#F59E0B"}
          />
        </View>

        {/* Başlık */}
        <Text style={[styles.title, { color: colors.textPrimary }]}>
          {isApproved
            ? "Berberiniz Onaylandı! 🎉"
            : isRejected
              ? "Başvurunuz Reddedildi"
              : "Başvurunuz İnceleniyor"
          }
        </Text>

        {/* Berber adı */}
        <Text style={[styles.barberName, { color: colors.primary }]}>
          {request.barberName}
        </Text>

        {/* Açıklama */}
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {isApproved
            ? "Tebrikler! Berberiniz platform yöneticisi tarafından onaylandı ve başarıyla oluşturuldu. Artık berber panelinizi kullanabilirsiniz."
            : isRejected
              ? "Üzgünüz, başvurunuz platform yöneticisi tarafından reddedildi."
              : "Başvurunuz platform yöneticisi tarafından inceleniyor. Onaylandığında berberiniz otomatik olarak oluşturulacaktır."
          }
        </Text>

        {/* Ret sebebi */}
        {isRejected && request.rejectionReason ? (
          <View style={[styles.reasonBox, {
            backgroundColor: mode === "dark" ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2",
            borderColor: mode === "dark" ? "rgba(239, 68, 68, 0.25)" : "#FECACA"
          }]}>
            <View style={styles.reasonHeader}>
              <Ionicons name="alert-circle-outline" size={18} color="#EF4444" />
              <Text style={styles.reasonLabel}>Reddetme Sebebi</Text>
            </View>
            <Text style={[styles.reasonText, { color: colors.textPrimary }]}>
              {request.rejectionReason}
            </Text>
          </View>
        ) : null}

        {/* Tarih */}
        {request.reviewedAt ? (
          <Text style={[styles.dateText, { color: colors.textMuted }]}>
            {isApproved ? "Onay" : "Ret"} tarihi:{" "}
            {new Date(request.reviewedAt).toLocaleDateString("tr-TR", {
              day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </Text>
        ) : null}

        {/* Buton */}
        {isApproved || isRejected ? (
          <Pressable
            style={[styles.dismissBtn, {
              backgroundColor: isApproved ? "#22C55E" : colors.primary
            }, loading && styles.disabledButton]}
            onPress={handleDismiss}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons
                  name={isApproved ? "arrow-forward" : "refresh-outline"}
                  size={20}
                  color="#FFFFFF"
                />
                <Text style={styles.dismissBtnText}>
                  {isApproved ? "Panele Geç" : "Anladım"}
                </Text>
              </>
            )}
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  card: {
    width: "100%",
    maxWidth: 480,
    borderRadius: 28,
    borderWidth: 1,
    padding: 36,
    alignItems: "center",
    overflow: "hidden"
  },
  glow: {
    position: "absolute",
    width: 400,
    height: 400,
    borderRadius: 999,
    top: -200
  },
  iconWrap: {
    width: 100,
    height: 100,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.4,
    textAlign: "center",
    marginBottom: 8
  },
  barberName: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16
  },
  description: {
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 24,
    textAlign: "center",
    maxWidth: 380
  },
  reasonBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginTop: 20
  },
  reasonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  reasonLabel: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "900"
  },
  reasonText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 22
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
    marginTop: 16
  },
  dismissBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 24,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 }
  },
  disabledButton: {
    opacity: 0.6
  },
  dismissBtnText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16
  }
});
