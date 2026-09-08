import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { PageHeader, Card, Spinner, EmptyState, Button, Select, Modal, FormField, Input, Banner } from "../../components/common";
import { titleCase } from "../../utils/helpers";

const TIERS = ["sub_centre", "phc", "rural_hospital", "district_hospital"];

const emptyForm = { name: "", tier: "phc", district: "", block: "", parent_facility_id: "" };

export default function FacilityManagement() {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = creating new
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    api.get("/facilities").then((res) => setFacilities(res.data.facilities)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

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
    <div>
      <PageHeader
        title={t("admin.facilitiesTitle")}
        subtitle={t("admin.facilitiesSubtitle")}
        action={<Button onClick={openCreate}>{t("admin.newFacility")}</Button>}
      />

      {loading ? (
        <Spinner />
      ) : facilities.length === 0 ? (
        <EmptyState title={t("admin.emptyFacilities")} />
      ) : (
        <div className="space-y-2">
          {facilities.map((f) => (
            <Card key={f.facility_id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{f.name}</p>
                <p className="text-xs text-ink/50 mt-0.5">
                  {titleCase(f.tier)} · {f.district}{f.block ? ` · ${f.block}` : ""}
                </p>
              </div>
              <Button variant="secondary" onClick={() => openEdit(f)}>{t("admin.edit")}</Button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? t("admin.modalEditFacility") : t("admin.modalNewFacility")}>
        <form onSubmit={handleSave}>
          {error && <Banner variant="error">{error}</Banner>}

          <FormField label={t("admin.facilityName")} required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>

          <FormField label={t("admin.tier")} required>
            <Select value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value })}>
              {TIERS.map((tier) => <option key={tier} value={tier}>{titleCase(tier)}</option>)}
            </Select>
          </FormField>

          <FormField label={t("admin.district")} required>
            <Input value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          </FormField>

          <FormField label={t("admin.block")}>
            <Input value={form.block} onChange={(e) => setForm({ ...form, block: e.target.value })} />
          </FormField>

          <FormField label={t("admin.parentFacility")}>
            <Select value={form.parent_facility_id} onChange={(e) => setForm({ ...form, parent_facility_id: e.target.value })}>
              <option value="">{t("admin.none")}</option>
              {facilities.filter((f) => !editing || f.facility_id !== editing.facility_id).map((f) => (
                <option key={f.facility_id} value={f.facility_id}>{f.name} ({titleCase(f.tier)})</option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>{t("admin.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving ? t("admin.creating") : (editing ? t("admin.save") : t("admin.create"))}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
