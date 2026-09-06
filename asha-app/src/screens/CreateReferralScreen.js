import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import NetInfo from "@react-native-community/netinfo";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { queueAction, getCachedFacilities, cacheFacilities } from "../services/offlineQueue";
import PatientSearchField from "../components/PatientSearchField";
import { ScreenContainer, ScreenTitle, PrimaryButton, Banner, PendingSyncBadge, SyncedBadge } from "../components/ui";
import ReadAloudButton from "../components/ReadAloudButton";
import { COLORS } from "../config";

const URGENCY_LEVELS = ["routine", "urgent", "emergency"];

export default function CreateReferralScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [form, setForm] = useState({
    from_facility_id: user?.facility_id ? String(user.facility_id) : "",
    to_facility_id: "",
    reason: "",
    urgency: "routine",
  });
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const URGENCY_LABELS = {
    routine: t("referral.urgencyRoutine"),
    urgent: t("referral.urgencyUrgent"),
    emergency: t("referral.urgencyEmergency"),
  };

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => setIsOffline(!state.isConnected));

    (async () => {
      const net = await NetInfo.fetch();
      if (net.isConnected) {
        try {
          const res = await api.get("/facilities");
          setFacilities(res.data.facilities);
          cacheFacilities(res.data.facilities);
        } catch {
          setFacilities(await getCachedFacilities());
        }
      } else {
        setFacilities(await getCachedFacilities());
      }
    })();

    return unsubscribe;
  }, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    if (!selectedPatient || !form.from_facility_id || !form.to_facility_id || !form.reason.trim()) {
      alert("Patient, both facilities, and a reason are all required.");
      return;
    }
    if (form.from_facility_id === form.to_facility_id) {
      alert("The origin and destination facility can't be the same.");
      return;
    }

    setSubmitting(true);
    const payload = {
      patient_id: selectedPatient.user_id,
      referred_by_user_id: user?.user_id,
      from_facility_id: Number(form.from_facility_id),
      to_facility_id: Number(form.to_facility_id),
      reason: form.reason.trim(),
      urgency: form.urgency,
    };

    try {
      const net = await NetInfo.fetch();
      const mustQueue = !net.isConnected || typeof payload.patient_id === "string";

      if (!mustQueue) {
        await api.post("/referrals", payload);
        setResult({ offline: false });
      } else {
        await queueAction("referral", payload);
        setResult({ offline: true });
      }
      setSelectedPatient(null);
      setForm((f) => ({ ...f, to_facility_id: "", reason: "", urgency: "routine" }));
    } catch (err) {
      if (!err.response) {
        await queueAction("referral", payload);
        setResult({ offline: true });
        setSelectedPatient(null);
        setForm((f) => ({ ...f, to_facility_id: "", reason: "", urgency: "routine" }));
      } else {
        alert(err.response?.data?.message || "Failed to create referral.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <ScreenContainer style={{ justifyContent: "center", alignItems: "center" }}>
        {result.offline ? <PendingSyncBadge /> : <SyncedBadge />}
        <Text style={{ fontSize: 20, fontWeight: "700", marginTop: 16, textAlign: "center" }}>
          {result.offline ? t("referral.successOfflineTitle") : t("referral.successOnlineTitle")}
        </Text>
        <Text style={{ marginTop: 8, color: COLORS.textMuted, textAlign: "center" }}>
          {result.offline
            ? "This referral is saved on this device and will sync automatically when you're back online."
            : "The receiving facility can now see and act on this referral."}
        </Text>
        <View style={{ flexDirection: "row", marginTop: 24 }}>
          <PrimaryButton title={t("referral.createAnother")} onPress={() => setResult(null)} />
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>{t("referral.backHome")}</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScrollView>
      <ScreenContainer>
        <ScreenTitle subtitle={t("referral.subtitle")}>{t("referral.title")}</ScreenTitle>

        {isOffline && <Banner variant="warning">{t("referral.offlineBanner")}</Banner>}

        <PatientSearchField
          selectedPatient={selectedPatient}
          onSelect={setSelectedPatient}
          onClear={() => setSelectedPatient(null)}
        />

        <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 8 }}>{t("referral.fromFacility")}</Text>
        <FacilityPicker facilities={facilities} selected={form.from_facility_id} onSelect={(id) => update("from_facility_id", id)} />

        <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 8, marginTop: 8 }}>{t("referral.toFacility")}</Text>
        <FacilityPicker facilities={facilities} selected={form.to_facility_id} onSelect={(id) => update("to_facility_id", id)} />

        <View style={{ marginTop: 16, marginBottom: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 15, fontWeight: "600" }}>{t("referral.reason")}</Text>
            {form.reason.trim().length > 0 && <ReadAloudButton text={form.reason} compact />}
          </View>
          <TextInput
            style={{
              backgroundColor: COLORS.white,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 14,
              fontSize: 16,
              color: COLORS.text,
              minHeight: 90,
              textAlignVertical: "top",
            }}
            multiline
            value={form.reason}
            onChangeText={(v) => update("reason", v)}
            placeholder={t("referral.reasonPlaceholder")}
          />
        </View>

        <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 8 }}>{t("referral.urgency")}</Text>
        <View style={{ flexDirection: "row", marginBottom: 20, gap: 8 }}>
          {URGENCY_LEVELS.map((level) => {
            const active = form.urgency === level;
            const isEmergency = level === "emergency";
            return (
              <TouchableOpacity
                key={level}
                onPress={() => update("urgency", level)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: active ? (isEmergency ? COLORS.red : COLORS.primary) : COLORS.white,
                  borderWidth: 1,
                  borderColor: active ? (isEmergency ? COLORS.red : COLORS.primary) : COLORS.border,
                }}
              >
                <Text style={{ color: active ? COLORS.white : COLORS.text, fontWeight: "600" }}>
                  {URGENCY_LABELS[level]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <PrimaryButton
          title={isOffline ? t("referral.submitOffline") : t("referral.submitOnline")}
          onPress={handleSubmit}
          loading={submitting}
        />
      </ScreenContainer>
    </ScrollView>
  );
}

function FacilityPicker({ facilities, selected, onSelect }) {
  if (facilities.length === 0) {
    return (
      <Text style={{ color: COLORS.textMuted, fontStyle: "italic", marginBottom: 12 }}>
        No facilities cached yet — connect once to load the list.
      </Text>
    );
  }
  return (
    <View style={{ marginBottom: 8 }}>
      {facilities.map((f) => {
        const id = String(f.facility_id);
        const active = selected === id;
        return (
          <TouchableOpacity
            key={f.facility_id}
            onPress={() => onSelect(id)}
            style={{
              padding: 14,
              borderRadius: 10,
              marginBottom: 8,
              backgroundColor: active ? COLORS.primary : COLORS.white,
              borderWidth: 1,
              borderColor: active ? COLORS.primary : COLORS.border,
            }}
          >
            <Text style={{ color: active ? COLORS.white : COLORS.text, fontWeight: "600" }}>
              {f.name} ({f.tier.replace(/_/g, " ")})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
