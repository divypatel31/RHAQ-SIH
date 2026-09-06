import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { PageHeader, Card, StatusTag, Spinner, EmptyState, Button, Tabs } from "../../components/common";
import { formatDateTime } from "../../utils/helpers";

const STATUS_FLOW = ["open", "acknowledged", "dispatched", "resolved"];
const NEXT_LABEL = { open: "Acknowledge", acknowledged: "Dispatch", dispatched: "Resolve" };

export default function EmergencyEscalations() {
  const [escalations, setEscalations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("");

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
      <PageHeader title="Emergency Escalations" subtitle="Time-critical cases raised from any facility." />

      <Tabs
        tabs={[
          { value: "", label: "All" },
          { value: "open", label: "Open" },
          { value: "acknowledged", label: "Acknowledged" },
          { value: "dispatched", label: "Dispatched" },
          { value: "resolved", label: "Resolved" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <Spinner />
      ) : escalations.length === 0 ? (
        <EmptyState title="No escalations" description="Nothing matches this filter." />
      ) : (
        <div className="space-y-3">
          {escalations.map((e) => (
            <Card key={e.escalation_id} className="p-5 flex items-center justify-between gap-4" accentClass="border-rose-500">
              <div>
                <p className="text-sm font-medium text-ink">{e.facility_name}</p>
                <p className="text-sm text-ink/70 mt-1 max-w-xl">{e.description}</p>
                <p className="text-xs text-ink/40 mt-2">
                  Raised by {e.raised_by_name || "Unknown"} · {formatDateTime(e.created_at)}
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
