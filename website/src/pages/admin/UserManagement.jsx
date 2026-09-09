import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { PageHeader, Card, Spinner, EmptyState, Button, Select, Modal, FormField, Input, Banner } from "../../components/common";
import { titleCase } from "../../utils/helpers";

const ROLES = ["patient", "asha_worker", "doctor", "receptionist", "admin"];

const ROLE_BADGES = {
  patient: "bg-blue-50 text-blue-700 border-blue-200",
  asha_worker: "bg-amber-50 text-amber-700 border-amber-200",
  doctor: "bg-emerald-50 text-emerald-800 border-emerald-200",
  receptionist: "bg-purple-50 text-purple-700 border-purple-200",
  admin: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function UserManagement() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", role: "", facility_id: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    const params = roleFilter ? { role: roleFilter } : {};
    api
      .get("/admin/users", { params })
      .then((res) => setUsers(res.data.users || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [roleFilter]);

  useEffect(() => {
    api.get("/facilities").then((res) => setFacilities(res.data.facilities || []));
  }, []);

  function openEdit(user) {
    setEditing(user);
    setForm({ name: user.name, role: user.role, facility_id: user.facility_id || "" });
    setError("");
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.patch(`/admin/users/${editing.user_id}`, {
        name: form.name,
        role: form.role,
        facility_id: form.facility_id ? Number(form.facility_id) : null,
      });
      setEditing(null);
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
        <PageHeader title={t("admin.usersTitle")} subtitle={t("admin.usersSubtitle")} />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700">
          <span className="font-mono bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">HPR</span>
          <span>Healthcare Professional Registry (ABDM)</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full sm:w-72">
          <Select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600 text-xs font-semibold"
          >
            <option value="">{t("admin.filterAllRoles")}</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {titleCase(r)}
              </option>
            ))}
          </Select>
        </div>
        <span className="text-xs font-bold text-slate-500">
          Total Accounts: <span className="text-slate-900 font-black">{users.length}</span>
        </span>
      </div>

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState title={t("admin.emptyUsers")} />
      ) : (
        <div className="space-y-2.5">
          {users.map((u) => (
            <Card
              key={u.user_id}
              className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600 bg-white hover:shadow-sm transition"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                    USR-{u.user_id}
                  </span>
                  <p className="text-sm font-bold text-slate-900">{u.name}</p>
                  <span
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded border ${
                      ROLE_BADGES[u.role] || "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {titleCase(u.role)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1.5">
                  Phone: <span className="font-mono text-slate-700">{u.phone}</span>
                  {u.facility_name ? (
                    <>
                      {" "}· Facility: <span className="text-slate-800 font-semibold">{u.facility_name}</span>
                    </>
                  ) : (
                    <span className="text-slate-400"> · (No Facility Assigned)</span>
                  )}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => openEdit(u)}
                className="text-xs font-bold px-3.5 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                {t("admin.edit")}
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={t("admin.editUser")}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <Banner variant="error">{error}</Banner>}

          <FormField label={t("admin.name")} required>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            />
          </FormField>

          <FormField label={t("admin.role")} required>
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {titleCase(r)}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label={t("admin.facility")}>
            <Select
              value={form.facility_id}
              onChange={(e) => setForm({ ...form, facility_id: e.target.value })}
              className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
            >
              <option value="">{t("admin.noFacility")}</option>
              {facilities.map((f) => (
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
              onClick={() => setEditing(null)}
              className="text-xs font-semibold text-slate-600 cursor-pointer"
            >
              {t("admin.cancel")}
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#128807] hover:bg-emerald-800 text-white font-bold text-xs px-5 py-2 rounded-lg border-0 shadow-sm cursor-pointer"
            >
              {saving ? t("admin.saving") : t("admin.save")}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}