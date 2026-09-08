import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, StatusTag, Spinner, EmptyState, Button, Tabs } from "../../components/common";
import { formatDate, titleCase } from "../../utils/helpers";

export default function HighRiskFollowups() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");

  function load() {
    setLoading(true);
    const params = { facility_id: user?.facility_id };
    if (tab) params.status = tab;
    api.get("/high-risk", { params }).then((res) => setFollowups(res.data.followups)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [tab]);

  async function handleLogContact(followup) {
    await api.patch(`/high-risk/${followup.followup_id}/contact`, { notes: "Contacted via facility follow-up" });
    load();
  }

  async function handleClose(followup) {
    if (!confirm(t("highRisk.closeConfirm"))) return;
    await api.patch(`/high-risk/${followup.followup_id}/close`);
    load();
  }

  return (
    <div>
      <PageHeader title={t("highRisk.title")} subtitle={t("highRisk.subtitle")} />

      <Tabs
        tabs={[
          { value: "", label: t("highRisk.tabAll") },
          { value: "due", label: t("highRisk.tabDue") },
          { value: "overdue", label: t("highRisk.tabOverdue") },
          { value: "missed", label: t("highRisk.tabMissed") },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <Spinner />
      ) : followups.length === 0 ? (
        <EmptyState title={t("highRisk.emptyTitle")} description={t("highRisk.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {followups.map((f) => (
            <Card key={f.followup_id} className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{f.patient_name}</p>
                <p className="text-xs text-ink/50 mt-1">{titleCase(f.category)} · {f.condition_label}</p>
                <p className="text-xs text-ink/35 mt-1">{t("highRisk.due")} {formatDate(f.next_due_date)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusTag status={f.status} />
                {f.status !== "closed" && (
                  <>
                    <Button variant="secondary" onClick={() => handleLogContact(f)}>{t("highRisk.logContact")}</Button>
                    <Button variant="ghost" onClick={() => handleClose(f)}>{t("highRisk.close")}</Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
