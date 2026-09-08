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
    api.get("/emergency", { params }).then((res) => setEscalations(res.data.escalations)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [tab]);

  async function advance(escalation) {
    const idx = STATUS_FLOW.indexOf(escalation.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    await api.patch(`/emergency/${escalation.escalation_id}/status`, { status: next });
    load();
  }

  return (
    <div>
      <PageHeader title={t("emergency.title")} subtitle={t("emergency.subtitle")} />

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

      {loading ? (
        <Spinner />
      ) : escalations.length === 0 ? (
        <EmptyState title={t("emergency.emptyTitle")} description={t("emergency.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {escalations.map((e) => (
            <Card key={e.escalation_id} className="p-5 flex items-center justify-between gap-4" accentClass="border-rose-500">
              <div>
                <p className="text-sm font-medium text-ink">{e.facility_name}</p>
                <p className="text-sm text-ink/70 mt-1 max-w-xl">{e.description}</p>
                <p className="text-xs text-ink/40 mt-2">
                  {t("emergency.raisedBy")} {e.raised_by_name || t("emergency.unknown")} · {formatDateTime(e.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusTag status={e.status} />
                {e.status !== "resolved" && (
                  <Button variant="secondary" onClick={() => advance(e)}>{NEXT_LABEL[e.status]}</Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
