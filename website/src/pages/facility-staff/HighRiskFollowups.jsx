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
    api
      .get("/high-risk", { params })
      .then((res) => setFollowups(res.data.followups || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function handleLogContact(followup) {
    await api.patch(`/high-risk/${followup.followup_id}/contact`, {
      notes: "Contacted via facility follow-up protocol",
    });
    load();
  }

  async function handleClose(followup) {
    if (!confirm(t("highRisk.closeConfirm"))) return;
    await api.patch(`/high-risk/${followup.followup_id}/close`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <PageHeader title={t("highRisk.title")} subtitle={t("highRisk.subtitle")} />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
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
        <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
          Maternal & Child Health Tracking (RCH)
        </span>
      </div>

      {loading ? (
        <Spinner />
      ) : followups.length === 0 ? (
        <EmptyState title={t("highRisk.emptyTitle")} description={t("highRisk.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {followups.map((f) => {
            const isOverdue = f.status === "overdue" || f.status === "missed";
            return (
              <Card
                key={f.followup_id}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 transition-all shadow-sm ${
                  isOverdue ? "border-l-red-600 bg-red-50/15" : "border-l-amber-500 bg-white"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900">{f.patient_name}</p>
                    <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {titleCase(f.category)}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200">
                      {f.condition_label}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-2">
                    {t("highRisk.due")}:{" "}
                    <span className={isOverdue ? "text-red-700 font-bold" : "text-slate-700 font-bold"}>
                      {formatDate(f.next_due_date)}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <StatusTag status={f.status} />
                  {f.status !== "closed" && (
                    <>
                      <Button
                        variant="secondary"
                        onClick={() => handleLogContact(f)}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg border-0 shadow-sm"
                      >
                        {t("highRisk.logContact")}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => handleClose(f)}
                        className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5"
                      >
                        {t("highRisk.close")}
                      </Button>
                    </>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}