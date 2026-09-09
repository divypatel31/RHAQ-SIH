import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { PageHeader, Card, Spinner, EmptyState, Button, Select, Modal, FormField, Input, Banner } from "../../components/common";
import { titleCase } from "../../utils/helpers";

const TIERS = ["sub_centre", "phc", "rural_hospital", "district_hospital"];

const emptyForm = { name: "", tier: "phc", district: "", block: "", parent_facility_id: "" };

const TIER_BADGES = {
  sub_centre: "bg-purple-50 text-purple-700 border-purple-200",
  phc: "bg-blue-50 text-blue-700 border-blue-200",
  rural_hospital: "bg-amber-50 text-amber-700 border-amber-200",
  district_hospital: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export default function FacilityManagement() {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api
      .get("/facilities")
      .then((res) => setFacilities(res.data.facilities || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowModal(true);
  }

  function openEdit(facility) {
    setEditing(facility);
    setForm({
      name: facility.name,
      tier: facility.tier,
      district: facility.district,
      block: facility.block || "",
      parent_facility_id: facility.parent_facility_id || "",
    });
    setError("");
    setShowModal(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.district.trim()) {
      setError(t("admin.errorGeneric"));
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      tier: form.tier,
      district: form.district.trim(),
      block: form.block.trim() || null,
      parent_facility_id: form.parent_facility_id ? Number(form.parent_facility_id) : null,
    };
    try {
      if (editing) {
        await api.patch(`/facilities/${editing.facility_id}`, payload);
      } else {
        await api.post("/facilities", payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || t("admin.errorGeneric"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-4">
        <PageHeader
          title={t("admin.facilitiesTitle")}
          subtitle={t("admin.facilitiesSubtitle")}
          action={
            <Button
              onClick={openCreate}
              className="bg-[#128807] hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm border-0 cursor-pointer"
            >
              + {t("admin.newFacility")}
            </Button>
          }
        />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800">
          <span className="font-mono bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[10px]">HFR</span>
          <span>Health Facility Registry (ABDM)</span>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : facilities.length === 0 ? (
        <EmptyState title={t("admin.emptyFacilities")} />
      ) : (
        <div className="space-y-2.5">
          {facilities.map((f) => (
            <Card
              key={f.facility_id}
              className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600 bg-white hover:shadow-sm transition"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                    FAC-{f.facility_id}
                  </span>
                  <p className="text-sm font-bold text-slate-900">{f.name}</p>
                  <span
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${
                      TIER_BADGES[f.tier] || "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {titleCase(f.tier)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1.5">
                  District: <span className="text-slate-800 font-semibold">{f.district}</span>
                  {f.block ? (
                    <>
                      {" "}· Block: <span className="text-slate-800 font-semibold">{f.block}</span>
                    </>
                  ) : (
                    ""
                  )}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => openEdit(f)}
                className="text-xs font-bold px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                {t("admin.edit")}
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? t("admin.modalEditFacility") : t("admin.modalNewFacility")}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <Banner variant="error">{error}</Banner>}

          <FormField label={t("admin.facilityName")} required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </FormField>

          <FormField label={t("admin.tier")} required>
            <Select
              value={form.tier}
              onChange={(e) => setForm({ ...form, tier: e.target.value })}
              className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            >
              {TIERS.map((tier) => (
                <option key={tier} value={tier}>
                  {titleCase(tier)}
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label={t("admin.district")} required>
              <Input
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </FormField>

            <FormField label={t("admin.block")}>
              <Input
                value={form.block}
                onChange={(e) => setForm({ ...form, block: e.target.value })}
                className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
              />
            </FormField>
          </div>

          <FormField label={t("admin.parentFacility")}>
            <Select
              value={form.parent_facility_id}
              onChange={(e) => setForm({ ...form, parent_facility_id: e.target.value })}
              className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            >
              <option value="">{t("admin.none")}</option>
              {facilities
                .filter((f) => !editing || f.facility_id !== editing.facility_id)
                .map((f) => (
                  <option key={f.facility_id} value={f.facility_id}>
                    {f.name} ({titleCase(f.tier)})
                  </option>
                ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowModal(false)}
              className="text-xs font-semibold text-slate-600 cursor-pointer"
            >
              {t("admin.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#128807] hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-lg border-0 shadow-sm cursor-pointer"
            >
              {saving ? t("admin.creating") : editing ? t("admin.save") : t("admin.create")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}