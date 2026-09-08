import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { PageHeader, Card, Spinner, EmptyState, Button, Select, Modal, FormField, Input, Banner } from "../../components/common";
import { titleCase } from "../../utils/helpers";

const ROLES = ["patient", "asha_worker", "doctor", "receptionist", "admin"];

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
    api.get("/admin/users", { params }).then((res) => setUsers(res.data.users)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [roleFilter]);
  useEffect(() => { api.get("/facilities").then((res) => setFacilities(res.data.facilities)); }, []);

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
    <div>
      <PageHeader title={t("admin.usersTitle")} subtitle={t("admin.usersSubtitle")} />

      <div className="mb-6 max-w-xs">
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">{t("admin.filterAllRoles")}</option>
          {ROLES.map((r) => <option key={r} value={r}>{titleCase(r)}</option>)}
        </Select>
      </div>

      {loading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <EmptyState title={t("admin.emptyUsers")} />
      ) : (
        <div className="space-y-2">
          {users.map((u) => (
            <Card key={u.user_id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{u.name}</p>
                <p className="text-xs text-ink/50 mt-0.5">
                  {u.phone} · {titleCase(u.role)}{u.facility_name ? ` · ${u.facility_name}` : ""}
                </p>
              </div>
              <Button variant="secondary" onClick={() => openEdit(u)}>{t("admin.edit")}</Button>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={t("admin.editUser")}>
        <form onSubmit={handleSave}>
          {error && <Banner variant="error">{error}</Banner>}

          <FormField label={t("admin.name")} required>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>

          <FormField label={t("admin.role")} required>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{titleCase(r)}</option>)}
            </Select>
          </FormField>

          <FormField label={t("admin.facility")}>
            <Select value={form.facility_id} onChange={(e) => setForm({ ...form, facility_id: e.target.value })}>
              <option value="">{t("admin.noFacility")}</option>
              {facilities.map((f) => (
                <option key={f.facility_id} value={f.facility_id}>{f.name} ({titleCase(f.tier)})</option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>{t("admin.cancel")}</Button>
            <Button type="submit" disabled={saving}>{saving ? t("admin.saving") : t("admin.save")}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
