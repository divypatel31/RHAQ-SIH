import React, { useEffect, useRef, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { searchPatients } from "../services/patients";
import { LabeledInput } from "./ui";
import { COLORS } from "../config";

/**
 * Search-and-select field for finding an existing patient by name or
 * phone number, instead of requiring a worker to know/type a raw
 * database ID. Falls back to a locally cached "recently seen" list when
 * offline (see services/patients.js).
 *
 * onSelect receives { user_id, name, phone } — user_id may be a numeric
 * server id, OR a "local_..." string if the patient was registered
 * offline and hasn't synced yet (see API_CONTRACT.md's note on chained
 * offline actions). The parent screen is responsible for handling both.
 */
export default function PatientSearchField({ onSelect, selectedPatient, onClear }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offlineNotice, setOfflineNotice] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const { patients, offline } = await searchPatients(query.trim());
      setResults(patients);
      setOfflineNotice(offline);
      setLoading(false);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  if (selectedPatient) {
    return (
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: "600", marginBottom: 6, color: COLORS.text }}>{t("referral.patient")}</Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: COLORS.white,
            borderWidth: 1,
            borderColor: COLORS.primary,
            borderRadius: 12,
            padding: 14,
          }}
        >
          <View>
            <Text style={{ fontWeight: "700", color: COLORS.text }}>
              {selectedPatient.name}
              {selectedPatient.is_local_only ? `  ${t("referral.patientNotSynced")}` : ""}
            </Text>
            <Text style={{ color: COLORS.textMuted, fontSize: 13, marginTop: 2 }}>{selectedPatient.phone}</Text>
          </View>
          <TouchableOpacity onPress={onClear}>
            <Text style={{ color: COLORS.red, fontWeight: "600" }}>{t("referral.patientChange")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <LabeledInput
        label={t("referral.patient")}
        placeholder={t("referral.patientSearchPlaceholder")}
        value={query}
        onChangeText={setQuery}
      />

      {loading && <ActivityIndicator style={{ marginTop: 4 }} color={COLORS.primary} />}

      {offlineNotice && query.trim().length >= 2 && (
        <Text style={{ color: COLORS.amber, fontSize: 12, marginBottom: 6, fontStyle: "italic" }}>
          Offline — showing only patients seen recently on this device.
        </Text>
      )}

      {results.length > 0 && (
        <View style={{ marginTop: 4 }}>
          {results.map((p) => (
            <TouchableOpacity
              key={String(p.user_id)}
              onPress={() => {
                onSelect(p);
                setQuery("");
                setResults([]);
              }}
              style={{
                padding: 12,
                borderRadius: 10,
                borderWidth: 1,
                borderColor: COLORS.border,
                backgroundColor: COLORS.white,
                marginBottom: 6,
              }}
            >
              <Text style={{ fontWeight: "600", color: COLORS.text }}>{p.name}</Text>
              <Text style={{ color: COLORS.textMuted, fontSize: 13 }}>
                {p.phone} {p.facility_name ? `· ${p.facility_name}` : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <Text style={{ color: COLORS.textMuted, fontSize: 13, fontStyle: "italic", marginTop: 4 }}>
          {t("referral.noMatch")}
        </Text>
      )}
    </View>
  );
}
