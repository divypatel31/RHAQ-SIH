import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { PageHeader, Card, StatusTag, Spinner, EmptyState, Button, Tabs } from "../../components/common";
import { formatDateTime } from "../../utils/helpers";

const STATUS_FLOW = ["open", "acknowledged", "dispatched", "resolved"];

export default function EmergencyEscalations() {
  const { t } = useTranslation();
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");

  const NEXT_LABEL = {
    open: t("emergency.nextOpen"),
    acknowledged: t("emergency.nextAcknowledged"),
    dispatched: t("emergency.nextDispatched"),
  };

  function load() {
    setLoading(true);
    const params = tab ? { status: tab } : {};
    api
      .get("/emergency", { params })
      .then((res) => setEscalations(res.data.escalations || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [tab]);

  async function advance(escalation) {
    const idx = STATUS_FLOW.indexOf(escalation.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    await api.patch(`/emergency/${escalation.escalation_id}/status`, { status: next });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <PageHeader title={t("emergency.title")} subtitle={t("emergency.subtitle")} />
      </div>

      <div className="flex items-center justify-between gap-4 flex-wrap bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <Tabs
          tabs={[
            { value: "", label: t("emergency.tabAll") },
            { value: "open", label: t("emergency.tabOpen") },
            { value: "acknowledged", label: t("emergency.tabAcknowledged") },
            { value: "dispatched", label: t("emergency.tabDispatched") },
            { value: "resolved", label: t("emergency.tabResolved") },
          ]}
          active={tab}
          onChange={setTab}
        />
        <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-lg text-xs font-bold text-red-700">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <span>MoHFW 24x7 Emergency Grid</span>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : escalations.length === 0 ? (
        <EmptyState title={t("emergency.emptyTitle")} description={t("emergency.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {escalations.map((e) => {
            const isOpen = e.status === "open";
            return (
              <Card
                key={e.escalation_id}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 transition-all shadow-sm ${
                  isOpen ? "border-l-red-600 bg-red-50/20" : "border-l-amber-500 bg-white"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                      ESC-{e.escalation_id}
                    </span>
                    <p className="text-sm font-bold text-slate-900">{e.facility_name}</p>
                    {isOpen && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 animate-pulse">
                        Action Required
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-700 mt-2 max-w-2xl font-medium leading-relaxed">{e.description}</p>
                  <p className="text-xs text-slate-400 mt-2.5">
                    {t("emergency.raisedBy")}{" "}
                    <span className="font-semibold text-slate-600">{e.raised_by_name || t("emergency.unknown")}</span> ·{" "}
                    {formatDateTime(e.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <StatusTag status={e.status} />
                  {e.status !== "resolved" && (
                    <Button
                      variant="secondary"
                      onClick={() => advance(e)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-lg border-0 shadow-sm"
                    >
                      {NEXT_LABEL[e.status]} →
                    </Button>
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