import React, { useCallback, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import NetInfo from "@react-native-community/netinfo";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { ScreenContainer, ScreenTitle, Banner, EmptyState } from "../components/ui";
import ReadAloudButton from "../components/ReadAloudButton";
import { COLORS } from "../config";

const STATUS_COLORS = {
  on_track: { bg: COLORS.greenBg, text: COLORS.green },
  due: { bg: COLORS.amberBg, text: COLORS.amber },
  overdue: { bg: "#FFEDD5", text: "#C2410C" },
  missed: { bg: COLORS.redBg, text: COLORS.red },
  closed: { bg: "#F3F4F6", text: "#6B7280" },
};

const STATUS_LABEL_KEYS = {
  on_track: "highRisk.statusOnTrack",
  due: "highRisk.statusDue",
  overdue: "highRisk.statusOverdue",
  missed: "highRisk.statusMissed",
  closed: "highRisk.statusClosed",
};

function FollowupCard({ item, t, onLogContact, onClose }) {
  const colors = STATUS_COLORS[item.status] || STATUS_COLORS.on_track;
  return (
    <View style={{ backgroundColor: COLORS.white, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", fontSize: 16, color: COLORS.text }}>{item.patient_name}</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 2 }}>{item.condition_label}</Text>
          <Text style={{ color: COLORS.textMuted, fontSize: 12, marginTop: 4 }}>
            {t("highRisk.dueLabel", { date: item.next_due_date?.slice(0, 10) })}
          </Text>
        </View>
        <View style={{ backgroundColor: colors.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 11 }}>
            {t(STATUS_LABEL_KEYS[item.status] || item.status)}
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 10 }}>
        <ReadAloudButton text={item.condition_label} sourceLang="en" compact />
      </View>

      {item.status !== "closed" && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <TouchableOpacity
            onPress={() => onLogContact(item)}
            style={{ flex: 1, backgroundColor: COLORS.primary, borderRadius: 10, paddingVertical: 10, alignItems: "center" }}
          >
            <Text style={{ color: COLORS.white, fontWeight: "700", fontSize: 13 }}>{t("highRisk.logContact")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onClose(item)}
            style={{ flex: 1, backgroundColor: COLORS.white, borderRadius: 10, paddingVertical: 10, alignItems: "center", borderWidth: 1, borderColor: COLORS.border }}
          >
            <Text style={{ color: COLORS.textMuted, fontWeight: "700", fontSize: 13 }}>{t("highRisk.close")}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function HighRiskScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [followups, setFollowups] = useState([]);
  const [filter, setFilter] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const net = await NetInfo.fetch();
    setIsOffline(!net.isConnected);
    if (!net.isConnected) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const params = { facility_id: user?.facility_id };
      if (filter) params.status = filter;
      const res = await api.get("/high-risk", { params });
      setFollowups(res.data.followups);
    } catch {
      // leave whatever was last loaded on screen
    } finally {
      setLoading(false);
    }
  }, [filter, user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleLogContact(item) {
    try {
      await api.patch(`/high-risk/${item.followup_id}/contact`, { notes: "Visited by ASHA worker" });
      load();
    } catch {
      alert("Failed to log contact. Try again once connected.");
    }
  }

  async function handleClose(item) {
    try {
      await api.patch(`/high-risk/${item.followup_id}/close`);
      load();
    } catch {
      alert("Failed to close follow-up. Try again once connected.");
    }
  }

  const filters = ["", "due", "overdue", "missed"];
  const filterLabels = {
    "": t("highRisk.filterAll"),
    due: t("highRisk.filterDue"),
    overdue: t("highRisk.filterOverdue"),
    missed: t("highRisk.filterMissed"),
  };

  return (
    <ScreenContainer>
      <ScreenTitle subtitle={t("highRisk.subtitle")}>{t("highRisk.title")}</ScreenTitle>

      {isOffline ? (
        <Banner variant="warning">{t("highRisk.offlineBanner")}</Banner>
      ) : (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          {filters.map((f) => {
            const active = filter === f;
            return (
              <TouchableOpacity
                key={f || "all"}
                onPress={() => setFilter(f)}
                style={{
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 16,
                  backgroundColor: active ? COLORS.primary : COLORS.white,
                  borderWidth: 1,
                  borderColor: active ? COLORS.primary : COLORS.border,
                }}
              >
                <Text style={{ color: active ? COLORS.white : COLORS.text, fontWeight: "600", fontSize: 12 }}>
                  {filterLabels[f]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {!isOffline && (
        <FlatList
          data={followups}
          keyExtractor={(item) => String(item.followup_id)}
          renderItem={({ item }) => (
            <FollowupCard item={item} t={t} onLogContact={handleLogContact} onClose={handleClose} />
          )}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
          ListEmptyComponent={!loading ? <EmptyState message={t("highRisk.empty")} /> : null}
        />
      )}
    </ScreenContainer>
  );
}
