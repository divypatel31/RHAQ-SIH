import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import NetInfo from "@react-native-community/netinfo";
import api from "../services/api";
import { queueAction, getCachedFacilities, cacheFacilities } from "../services/offlineQueue";
import { cacheOneLocalPatient, cacheRecentPatients } from "../services/patients";
import { ScreenContainer, ScreenTitle, LabeledInput, PrimaryButton, Banner, PendingSyncBadge, SyncedBadge } from "../components/ui";
import { COLORS } from "../config";

const GENDERS = ["female", "male", "other"];

export default function RegisterPatientScreen({ navigation }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", phone: "", dob: "", gender: "", facility_id: "" });
  const [facilities, setFacilities] = useState([]);
  const [isOffline, setIsOffline] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { name, offline: bool }

  const GENDER_LABELS = {
    female: t("registerPatient.genderFemale"),
    male: t("registerPatient.genderMale"),
    other: t("registerPatient.genderOther"),
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
    if (!form.name.trim() || !form.phone.trim() || !form.facility_id) {
      alert("Name, phone number, and facility are required.");
      return;
    }
    if (!/^\d{10}$/.test(form.phone.trim())) {
      alert("Enter a valid 10-digit phone number.");
      return;
    }

    setSubmitting(true);
    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      password: form.phone.trim(),
      dob: form.dob.trim() || null,
      gender: form.gender || null,
      facility_id: Number(form.facility_id),
      role: "patient",
    };

    try {
      const net = await NetInfo.fetch();
      if (net.isConnected) {
        const res = await api.post("/auth/register", payload);
        await cacheRecentPatients([{ user_id: res.data.user_id, name: payload.name, phone: payload.phone, facility_id: payload.facility_id }]);
        setResult({ name: payload.name, offline: false });
      } else {
        const local_id = await queueAction("patient_registration", payload);
        await cacheOneLocalPatient({ local_id, name: payload.name, phone: payload.phone, facility_id: payload.facility_id });
        setResult({ name: payload.name, offline: true });
      }
      setForm({ name: "", phone: "", dob: "", gender: "", facility_id: "" });
    } catch (err) {
      if (!err.response) {
        const local_id = await queueAction("patient_registration", payload);
        await cacheOneLocalPatient({ local_id, name: payload.name, phone: payload.phone, facility_id: payload.facility_id });
        setResult({ name: payload.name, offline: true });
        setForm({ name: "", phone: "", dob: "", gender: "", facility_id: "" });
      } else {
        alert(err.response?.data?.message || "Registration failed.");
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
          {result.offline ? t("registerPatient.successOfflineTitle") : t("registerPatient.successOnlineTitle")}
        </Text>
        <Text style={{ marginTop: 8, color: COLORS.textMuted, textAlign: "center" }}>
          {result.offline
            ? `${result.name}'s record is saved on this device and will sync automatically when you're back online.`
            : `${result.name} has been registered successfully.`}
        </Text>
        <View style={{ flexDirection: "row", marginTop: 24, gap: 12 }}>
          <PrimaryButton title={t("registerPatient.registerAnother")} onPress={() => setResult(null)} />
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: COLORS.primary, fontWeight: "600" }}>{t("registerPatient.backHome")}</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScrollView>
      <ScreenContainer>
        <ScreenTitle subtitle={t("registerPatient.subtitle")}>{t("registerPatient.title")}</ScreenTitle>

        {isOffline && <Banner variant="warning">{t("registerPatient.offlineBanner")}</Banner>}

        <LabeledInput label={t("registerPatient.name")} value={form.name} onChangeText={(v) => update("name", v)} placeholder={t("registerPatient.namePlaceholder")} />
        <LabeledInput
          label={t("registerPatient.phone")}
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => update("phone", v)}
          placeholder={t("registerPatient.phonePlaceholder")}
        />
        <LabeledInput
          label={t("registerPatient.dob")}
          value={form.dob}
          onChangeText={(v) => update("dob", v)}
          placeholder={t("registerPatient.dobPlaceholder")}
        />

        <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 8 }}>{t("registerPatient.gender")}</Text>
        <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
          {GENDERS.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => update("gender", g)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: form.gender === g ? COLORS.primary : COLORS.white,
                borderWidth: 1,
                borderColor: form.gender === g ? COLORS.primary : COLORS.border,
              }}
            >
              <Text style={{ color: form.gender === g ? COLORS.white : COLORS.text, fontWeight: "600" }}>
                {GENDER_LABELS[g]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 8 }}>{t("registerPatient.facility")}</Text>
        <View style={{ marginBottom: 16 }}>
          {facilities.length === 0 ? (
            <Text style={{ color: COLORS.textMuted, fontStyle: "italic" }}>{t("registerPatient.noFacilities")}</Text>
          ) : (
            facilities.map((f) => (
              <TouchableOpacity
                key={f.facility_id}
                onPress={() => update("facility_id", String(f.facility_id))}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  marginBottom: 8,
                  backgroundColor: form.facility_id === String(f.facility_id) ? COLORS.primary : COLORS.white,
                  borderWidth: 1,
                  borderColor: form.facility_id === String(f.facility_id) ? COLORS.primary : COLORS.border,
                }}
              >
                <Text style={{ color: form.facility_id === String(f.facility_id) ? COLORS.white : COLORS.text, fontWeight: "600" }}>
                  {f.name}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>

        <PrimaryButton
          title={isOffline ? t("registerPatient.submitOffline") : t("registerPatient.submitOnline")}
          onPress={handleSubmit}
          loading={submitting}
        />
      </ScreenContainer>
    </ScrollView>
  );
}
