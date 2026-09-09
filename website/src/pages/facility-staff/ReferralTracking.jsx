import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import {
  PageHeader,
  Card,
  StatusTag,
  Spinner,
  EmptyState,
  Button,
  Tabs,
  Modal,
  FormField,
  Select,
  Textarea,
  Banner,
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
    referred: t("referrals.nextReferred", "Mark travelling"),
    travel_in_progress: t("referrals.nextTravelInProgress", "Mark arrived"),
    arrived: t("referrals.nextArrived", "Mark seen"),
    seen: t("referrals.nextSeen", "Mark completed"),
  };

  function load() {
    setLoading(true);
    api
      .get("/referrals", { params: { facility_id: user?.facility_id } })
      .then((res) => setReferrals(res.data.referrals || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    api.get("/facilities").then((res) => setFacilities(res.data.facilities || []));
  }, []);

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
    await api.patch(`/referrals/${referral.referral_id}/status`, {
      status: "missed",
      note: "Marked missed manually",
    });
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
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <PageHeader
          title={t("referrals.title")}
          subtitle={t("referrals.subtitle")}
          action={
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm border-0"
            >
              + {t("referrals.newReferral")}
            </Button>
          }
        />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <Tabs
          tabs={[
            { value: "all", label: t("referrals.tabAll") },
            { value: "incoming", label: t("referrals.tabIncoming") },
            { value: "outgoing", label: t("referrals.tabOutgoing") },
          ]}
          active={tab}
          onChange={setTab}
        />
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700">
          <span className="font-mono">ABDM</span>
          <span>Inter-Facility Care Continuity</span>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title={t("referrals.emptyTitle")} description={t("referrals.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const canAdvance = STATUS_FLOW.includes(r.status) && r.status !== "completed";
            const isEmergency = r.urgency === "emergency";
            return (
              <Card
                key={r.referral_id}
                className={`p-5 border-l-4 transition-all shadow-sm ${isEmergency ? "border-l-red-600 bg-red-50/15" : "border-l-emerald-600 bg-white"
                  }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                        REF-{r.referral_id}
                      </span>
                      <p className="text-sm font-bold text-slate-900">{r.patient_name}</p>
                      {isEmergency && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                          {t("referrals.emergency")}
                        </span>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 mt-2 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
                      <span>{r.from_facility_name}</span>
                      <span className="text-slate-400 font-black">→</span>
                      <span className="text-emerald-700 font-bold">{r.to_facility_name}</span>
                    </div>
                    <p className="text-sm text-slate-700 mt-2.5 max-w-2xl font-medium leading-relaxed">{r.reason}</p>
                    <p className="text-xs text-slate-400 mt-2">{formatDateTime(r.created_at)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusTag status={r.status} />
                    {canAdvance && (
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => advanceStatus(r)}
                          className="bg-[#128807] hover:bg-emerald-800 active:bg-emerald-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg shadow-sm transition-all duration-150 cursor-pointer flex items-center gap-1"
                        >
                          <span>{NEXT_LABEL[r.status] || "Advance Status"}</span>
                          <span>→</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => markMissed(r)}
                          className="border border-red-300 text-red-600 hover:bg-red-50 active:bg-red-100 font-semibold text-xs px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
                        >
                          {t("referrals.missed", "Missed")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ABDM-Compliant Referral Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title={t("referrals.modalTitle")}>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <Banner variant="error">{error}</Banner>}

          <FormField label={t("referrals.patient")} required>
            <PatientSearch selected={patient} onSelect={setPatient} onClear={() => setPatient(null)} />
          </FormField>

          <FormField label={t("referrals.toFacility")} required>
            <Select
              value={form.to_facility_id}
              onChange={(e) => setForm({ ...form, to_facility_id: e.target.value })}
              className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            >
              <option value="">{t("referrals.selectFacility")}</option>
              {facilities
                .filter((f) => f.facility_id !== user?.facility_id)
                .map((f) => (
                  <option key={f.facility_id} value={f.facility_id}>
                    {f.name} ({titleCase(f.tier)})
                  </option>
                ))}
            </Select>
          </FormField>

          <FormField label={t("referrals.reason")} required>
            <Textarea
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder={t("referrals.reasonPlaceholder")}
              className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </FormField>

          <FormField label={t("referrals.urgency")}>
            <Select
              value={form.urgency}
              onChange={(e) => setForm({ ...form, urgency: e.target.value })}
              className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            >
              <option value="routine">{t("referrals.urgencyRoutine")}</option>
              <option value="urgent">{t("referrals.urgencyUrgent")}</option>
              <option value="emergency">{t("referrals.urgencyEmergency")}</option>
            </Select>
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreate(false)}
              className="text-xs font-semibold text-slate-600"
            >
              {t("referrals.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-lg border-0 shadow-sm"
            >
              {saving ? t("referrals.creating") : t("referrals.create")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}