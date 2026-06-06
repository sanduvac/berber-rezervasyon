import React from "react";
import { View, Text, Pressable, Image, StyleSheet } from "react-native";
import { useCopilot } from "react-native-copilot";

export function CustomTooltip() {
  const { currentStep, isFirstStep, isLastStep, goToNext, goToPrev, stop } = useCopilot();

  if (!currentStep) return <View />;

  return (
    <View style={styles.container}>
      {/* Avatar Kısmı */}
      <View style={styles.avatarContainer}>
        <Image 
          source={require("../../assets/images/barber_guide.png")} 
          style={styles.avatar} 
          resizeMode="cover"
        />
      </View>
      
      {/* Konuşma Balonu */}
      <View style={styles.bubble}>
        {/* Balonun küçük üçgen çıkıntısı */}
        <View style={styles.bubbleTriangle} />
        
        <Text style={styles.text}>{currentStep.text}</Text>
        
        <View style={styles.buttonRow}>
          {!isFirstStep && (
            <Pressable onPress={goToPrev} style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Geri</Text>
            </Pressable>
          )}
          
          <View style={{ flex: 1 }} />
          
          <Pressable onPress={stop} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>{isLastStep ? "Kapat" : "Atla"}</Text>
          </Pressable>
          
          {!isLastStep && (
            <Pressable onPress={goToNext} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>İleri</Text>
            </Pressable>
          )}
          
          {isLastStep && (
            <Pressable onPress={stop} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Başla</Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 10,
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#00D2FF",
    overflow: "hidden",
    marginRight: 16,
    marginTop: 10,
    backgroundColor: "#111633",
    shadowColor: "#00D2FF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  bubble: {
    flexShrink: 1,
    backgroundColor: "#1F2335",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bubbleTriangle: {
    position: "absolute",
    left: -8,
    top: 24,
    width: 0,
    height: 0,
    borderTopWidth: 8,
    borderTopColor: "transparent",
    borderBottomWidth: 8,
    borderBottomColor: "transparent",
    borderRightWidth: 10,
    borderRightColor: "#1F2335",
  },
  text: {
    color: "#E0F7FF",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
    marginBottom: 16,
    fontFamily: "System", // Şık sistem fontu
    letterSpacing: 0.2,
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 12,
  },
  primaryButton: {
    backgroundColor: "#6C5CE7",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  secondaryButtonText: {
    color: "#8896AE",
    fontWeight: "600",
    fontSize: 14,
  }
});
