import React, { useCallback, useState } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import NetInfo from "@react-native-community/netinfo";
import { getQueuedActions, flushQueue } from "../services/offlineQueue";
import { ScreenContainer, ScreenTitle, PrimaryButton, Banner, EmptyState } from "../components/ui";
import { COLORS } from "../config";

function QueueItem({ item, t }) {
  const ENTITY_LABELS = {
    patient_registration: t("home.registerTitle"),
    referral: t("home.referralTitle"),
    high_risk_followup: t("home.highRiskTitle"),
  };
  return (
    <View style={{ backgroundColor: COLORS.white, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border }}>
      <Text style={{ fontWeight: "700", color: COLORS.text }}>{ENTITY_LABELS[item.entity_type] || item.entity_type}</Text>
      <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 4 }}>
        {item.payload.name || item.payload.reason || "—"}
      </Text>
      <Text style={{ color: item.status === "failed" ? COLORS.red : COLORS.amber, fontSize: 12, fontWeight: "700", marginTop: 6 }}>
        {item.status === "failed" ? t("sync.failedRetry") : t("sync.pendingSync")}
      </Text>
    </View>
  );
}

export default function SyncStatusScreen() {
  const { t } = useTranslation();
  const [queue, setQueue] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const load = useCallback(async () => {
    setQueue(await getQueuedActions());
    const net = await NetInfo.fetch();
    setIsOffline(!net.isConnected);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleSyncNow() {
    setSyncing(true);
    setLastResult(null);
    const result = await flushQueue();
    setLastResult(result);
    await load();
    setSyncing(false);
  }

  return (
    <ScreenContainer>
      <ScreenTitle subtitle={t("sync.subtitle")}>{t("sync.title")}</ScreenTitle>

      {isOffline && <Banner variant="warning">{t("sync.offlineBanner")}</Banner>}
      {lastResult && !lastResult.error && (
        <Banner variant="success">{t("sync.resultBanner", { synced: lastResult.synced, failed: lastResult.failed })}</Banner>
      )}
      {lastResult?.error && <Banner variant="error">{t("sync.errorBanner")}</Banner>}

      <PrimaryButton title={t("sync.syncNow")} onPress={handleSyncNow} loading={syncing} disabled={isOffline || queue.length === 0} />

      <View style={{ marginTop: 20, flex: 1 }}>
        {queue.length === 0 ? (
          <EmptyState message={t("sync.empty")} />
        ) : (
          <FlatList
            data={queue}
            keyExtractor={(item) => item.local_id}
            renderItem={({ item }) => <QueueItem item={item} t={t} />}
            refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
          />
        )}
      </View>
    </ScreenContainer>
  );
}
