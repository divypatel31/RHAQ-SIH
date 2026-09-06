import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { getPendingCount } from "../services/offlineQueue";
import { ScreenContainer, ScreenTitle } from "../components/ui";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { COLORS } from "../config";

function MenuCard({ title, description, onPress, badge }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [pending, setPending] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getPendingCount().then(setPending);
    }, [])
  );

  return (
    <ScreenContainer>
      <LanguageSwitcher />

      <ScreenTitle subtitle={t("home.loggedInAs", { name: user?.name || "Worker" })}>{t("app.name")}</ScreenTitle>

      <MenuCard
        title={t("home.registerTitle")}
        description={t("home.registerDescription")}
        onPress={() => navigation.navigate("RegisterPatient")}
      />
      <MenuCard
        title={t("home.referralTitle")}
        description={t("home.referralDescription")}
        onPress={() => navigation.navigate("CreateReferral")}
      />
      <MenuCard
        title={t("home.highRiskTitle")}
        description={t("home.highRiskDescription")}
        onPress={() => navigation.navigate("HighRisk")}
      />
      <MenuCard
        title={t("home.syncTitle")}
        description={t("home.syncDescription")}
        onPress={() => navigation.navigate("SyncStatus")}
        badge={pending > 0 ? String(pending) : null}
      />

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>{t("home.logout")}</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.text,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  badge: {
    backgroundColor: COLORS.amber,
    borderRadius: 999,
    minWidth: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 13,
  },
  logout: {
    marginTop: 24,
    alignItems: "center",
    padding: 12,
  },
  logoutText: {
    color: COLORS.red,
    fontWeight: "600",
    fontSize: 15,
  },
});
