import React from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { COLORS } from "../config";

export function ScreenContainer({ children, style }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function ScreenTitle({ children, subtitle }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.title}>{children}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function LabeledInput({ label, ...props }) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
    </View>
  );
}

export function PrimaryButton({ title, onPress, loading, disabled, variant = "primary" }) {
  const bg =
    variant === "danger" ? COLORS.red : variant === "secondary" ? COLORS.white : COLORS.primary;
  const textColor = variant === "secondary" ? COLORS.primary : COLORS.white;
  const borderColor = variant === "secondary" ? COLORS.primary : "transparent";

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bg, borderColor, borderWidth: variant === "secondary" ? 2 : 0 }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

/** Shown on any record created while offline, until it's confirmed synced. */
export function PendingSyncBadge() {
  return (
    <View style={styles.pendingBadge}>
      <Text style={styles.pendingBadgeText}>⏳ Pending sync</Text>
    </View>
  );
}

export function SyncedBadge() {
  return (
    <View style={styles.syncedBadge}>
      <Text style={styles.syncedBadgeText}>✓ Synced</Text>
    </View>
  );
}

export function Banner({ children, variant = "info" }) {
  const bg = variant === "warning" ? COLORS.amberBg : variant === "error" ? COLORS.redBg : COLORS.greenBg;
  const color = variant === "warning" ? COLORS.amber : variant === "error" ? COLORS.red : COLORS.green;
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Text style={{ color, fontWeight: "600", fontSize: 14 }}>{children}</Text>
    </View>
  );
}

export function EmptyState({ message }) {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", paddingVertical: 40 }}>
      <Text style={{ color: COLORS.textMuted, fontSize: 15, textAlign: "center" }}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700",
  },
  pendingBadge: {
    backgroundColor: COLORS.amberBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  pendingBadgeText: {
    color: COLORS.amber,
    fontWeight: "700",
    fontSize: 12,
  },
  syncedBadge: {
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  syncedBadgeText: {
    color: COLORS.green,
    fontWeight: "700",
    fontSize: 12,
  },
  banner: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
});
