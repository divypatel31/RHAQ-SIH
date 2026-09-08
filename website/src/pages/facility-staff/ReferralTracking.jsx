import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import {
  PageHeader, Card, StatusTag, Spinner, EmptyState, Button, Tabs,
  Modal, FormField, Select, Textarea, Banner,
} from "../../components/common";
import PatientSearch from "../../components/common/PatientSearch";
import { formatDateTime, titleCase } from "../../utils/helpers";

const STATUS_FLOW = ["referred", "travel_in_progress", "arrived", "seen", "completed"];

export default function ReferralTracking() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [patient, setPatient] = useState(null);
  const [form, setForm] = useState({ to_facility_id: "", reason: "", urgency: "routine" });

  const NEXT_LABEL = {
    referred: t("referrals.nextReferred"),
    travel_in_progress: t("referrals.nextTravelInProgress"),
    arrived: t("referrals.nextArrived"),
    seen: t("referrals.nextSeen"),
  };

  function load() {
    setLoading(true);
    api.get("/referrals", { params: { facility_id: user?.facility_id } })
      .then((res) => setReferrals(res.data.referrals))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { api.get("/facilities").then((res) => setFacilities(res.data.facilities)); }, []);

  const filtered = referrals.filter((r) => {
    if (tab === "incoming") return r.to_facility_id === user?.facility_id;
    if (tab === "outgoing") return r.from_facility_id === user?.facility_id;
    return true;
  });

  async function advanceStatus(referral) {
    const idx = STATUS_FLOW.indexOf(referral.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    await api.patch(`/referrals/${referral.referral_id}/status`, { status: next });
    load();
  }

  async function markMissed(referral) {
    if (!confirm(t("referrals.missedConfirm"))) return;
    await api.patch(`/referrals/${referral.referral_id}/status`, { status: "missed", note: "Marked missed manually" });
    load();
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!patient || !form.to_facility_id || !form.reason.trim()) {
      setError(t("referrals.errorRequired"));
      return;
    }
    setError("");
    setSaving(true);
    try {
      await api.post("/referrals", {
        patient_id: patient.user_id,
        from_facility_id: user?.facility_id,
        to_facility_id: Number(form.to_facility_id),
        reason: form.reason.trim(),
        urgency: form.urgency,
      });
      setShowCreate(false);
      setPatient(null);
      setForm({ to_facility_id: "", reason: "", urgency: "routine" });
      load();
    } catch (err) {
      setError(err.response?.data?.message || t("referrals.errorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title={t("referrals.title")}
        subtitle={t("referrals.subtitle")}
        action={<Button onClick={() => setShowCreate(true)}>{t("referrals.newReferral")}</Button>}
      />

      <Tabs
        tabs={[
          { value: "all", label: t("referrals.tabAll") },
          { value: "incoming", label: t("referrals.tabIncoming") },
          { value: "outgoing", label: t("referrals.tabOutgoing") },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title={t("referrals.emptyTitle")} description={t("referrals.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const canAdvance = STATUS_FLOW.includes(r.status) && r.status !== "completed";
            return (
              <Card key={r.referral_id} className="p-5" accentClass={r.urgency === "emergency" ? "border-rose-500" : "border-teal-500"}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink">{r.patient_name}</p>
                    <p className="text-xs text-ink/50 mt-1">
                      {r.from_facility_name} <span className="text-ink/30">→</span> {r.to_facility_name}
                    </p>
                    <p className="text-sm text-ink/70 mt-2 max-w-xl">{r.reason}</p>
                    <p className="text-xs text-ink/35 mt-2">{formatDateTime(r.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {r.urgency === "emergency" && (
                      <span className="text-xs font-semibold text-rose-500 uppercase tracking-wide">{t("referrals.emergency")}</span>
                    )}
                    <StatusTag status={r.status} />
                    {canAdvance && (
                      <div className="flex gap-2 mt-1">
                        <Button variant="secondary" onClick={() => advanceStatus(r)}>{NEXT_LABEL[r.status]}</Button>
                        <Button variant="danger" onClick={() => markMissed(r)}>{t("referrals.missed")}</Button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t("referrals.modalTitle")}>
        <form onSubmit={handleCreate}>
          {error && <Banner variant="error">{error}</Banner>}

          <FormField label={t("referrals.patient")} required>
            <PatientSearch selected={patient} onSelect={setPatient} onClear={() => setPatient(null)} />
          </FormField>

          <FormField label={t("referrals.toFacility")} required>
            <Select value={form.to_facility_id} onChange={(e) => setForm({ ...form, to_facility_id: e.target.value })}>
              <option value="">{t("referrals.selectFacility")}</option>
              {facilities.filter((f) => f.facility_id !== user?.facility_id).map((f) => (
                <option key={f.facility_id} value={f.facility_id}>{f.name} ({titleCase(f.tier)})</option>
              ))}
            </Select>
          </FormField>

          <FormField label={t("referrals.reason")} required>
            <Textarea rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder={t("referrals.reasonPlaceholder")} />
          </FormField>

          <FormField label={t("referrals.urgency")}>
            <Select value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
              <option value="routine">{t("referrals.urgencyRoutine")}</option>
              <option value="urgent">{t("referrals.urgencyUrgent")}</option>
              <option value="emergency">{t("referrals.urgencyEmergency")}</option>
            </Select>
          </FormField>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>{t("referrals.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving ? t("referrals.creating") : t("referrals.create")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
