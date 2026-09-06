import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { PageHeader, StatCard, Card, Spinner, EmptyState } from "../../components/common";
import { titleCase } from "../../utils/helpers";

export default function FacilityDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/district").then((res) => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <EmptyState title="Couldn't load the dashboard" />;

  const { referralStats, highRiskStats, emergencyStats, lowStock, facilityActivity } = data;

  return (
    <div>
      <PageHeader title="Facility Dashboard" subtitle="Referral completion, high-risk backlog, and facility activity at a glance." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Referral Completion" value={`${referralStats?.completion_rate_pct ?? 0}%`} sub={`${referralStats?.completed ?? 0} of ${referralStats?.total_referrals ?? 0}`} />
        <StatCard label="Referrals In Progress" value={referralStats?.in_progress ?? 0} />
        <StatCard label="High-Risk Backlog" value={(highRiskStats?.overdue ?? 0) + (highRiskStats?.missed ?? 0)} sub={`${highRiskStats?.due_soon ?? 0} due soon`} />
        <StatCard label="Open Emergencies" value={emergencyStats?.open_escalations ?? 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-sm font-semibold text-ink mb-3">Facility Activity (30 days)</h3>
          {facilityActivity?.length ? (
            <div className="space-y-2">
              {facilityActivity.map((f) => (
                <Card key={f.facility_id} className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink">{f.name}</p>
                    <p className="text-xs text-ink/45">{titleCase(f.tier)}</p>
                  </div>
                  <p className="text-sm font-semibold text-teal-600 tabular-nums">{f.appointments_last_30d}</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="No activity data" />
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink mb-3">Low Medicine Stock</h3>
          {lowStock?.length ? (
            <div className="space-y-2">
              {lowStock.map((s, i) => (
                <Card key={i} className="p-4 flex items-center justify-between" accentClass="border-rose-500">
                  <div>
                    <p className="text-sm font-medium text-ink">{s.medicine_name}</p>
                    <p className="text-xs text-ink/45">{s.facility_name}</p>
                  </div>
                  <p className="text-sm font-semibold text-rose-500 tabular-nums">{s.quantity_available} left</p>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title="No shortages" description="All tracked facilities are above threshold." />
          )}
        </div>
      </div>
    </div>
  );
}
