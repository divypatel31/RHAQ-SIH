import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, Card, StatusTag, Spinner, EmptyState, Button, Tabs } from "../../components/common";
import { formatDate, titleCase } from "../../utils/helpers";

export default function HighRiskFollowups() {
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
    if (!confirm("Close this follow-up?")) return;
    await api.patch(`/high-risk/${followup.followup_id}/close`);
    load();
  }

  return (
    <div>
      <PageHeader title="High-Risk Follow-ups" subtitle="Maternal, child immunization, and chronic-disease patients needing proactive tracking." />

      <Tabs
        tabs={[
          { value: "", label: "All" },
          { value: "due", label: "Due" },
          { value: "overdue", label: "Overdue" },
          { value: "missed", label: "Missed" },
        ]}
        active={tab}
        onChange={setTab}
      />

      {loading ? (
        <Spinner />
      ) : followups.length === 0 ? (
        <EmptyState title="No follow-ups" description="No high-risk patients match this filter." />
      ) : (
        <div className="space-y-3">
          {followups.map((f) => (
            <Card key={f.followup_id} className="p-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">{f.patient_name}</p>
                <p className="text-xs text-ink/50 mt-1">{titleCase(f.category)} · {f.condition_label}</p>
                <p className="text-xs text-ink/35 mt-1">Due {formatDate(f.next_due_date)}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusTag status={f.status} />
                {f.status !== "closed" && (
                  <>
                    <Button variant="secondary" onClick={() => handleLogContact(f)}>Log Contact</Button>
                    <Button variant="ghost" onClick={() => handleClose(f)}>Close</Button>
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
