import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { PageHeader, StatCard, Card, Spinner, EmptyState } from "../../components/common";
import { titleCase } from "../../utils/helpers";

export default function FacilityDashboard() {
  const { t } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/district")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <EmptyState title={t("dashboard.loadError")} />;

  const { referralStats, highRiskStats, emergencyStats, lowStock, facilityActivity } = data;

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-600" />
          <span>National Health Mission Telemetry</span>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border-t-4 border-t-emerald-600 border border-slate-200 rounded-xl p-4 shadow-sm">
          <StatCard
            label={t("dashboard.referralCompletion")}
            value={`${referralStats?.completion_rate_pct ?? 0}%`}
            sub={`${referralStats?.completed ?? 0} of ${referralStats?.total_referrals ?? 0}`}
          />
        </div>
        <div className="bg-white border-t-4 border-t-blue-600 border border-slate-200 rounded-xl p-4 shadow-sm">
          <StatCard label={t("dashboard.referralsInProgress")} value={referralStats?.in_progress ?? 0} />
        </div>
        <div className="bg-white border-t-4 border-t-amber-500 border border-slate-200 rounded-xl p-4 shadow-sm">
          <StatCard
            label={t("dashboard.highRiskBacklog")}
            value={(highRiskStats?.overdue ?? 0) + (highRiskStats?.missed ?? 0)}
            sub={`${highRiskStats?.due_soon ?? 0} ${t("dashboard.dueSoon")}`}
          />
        </div>
        <div className="bg-white border-t-4 border-t-red-600 border border-slate-200 rounded-xl p-4 shadow-sm">
          <StatCard label={t("dashboard.openEmergencies")} value={emergencyStats?.open_escalations ?? 0} />
        </div>
      </div>

      {/* Grid: Facility Activity & Critical Supply Shortages */}
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
              {t("dashboard.facilityActivity")}
            </h3>
            <span className="text-[11px] font-semibold text-slate-500">Last 30 Days</span>
          </div>

          {facilityActivity?.length ? (
            <div className="space-y-2.5">
              {facilityActivity.map((f) => (
                <Card
                  key={f.facility_id}
                  className="p-4 flex items-center justify-between border-l-4 border-l-emerald-600 hover:shadow-md transition"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{f.name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{titleCase(f.tier)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-extrabold text-emerald-700 tabular-nums">
                      {f.appointments_last_30d}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">consults</p>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title={t("dashboard.noActivity")} />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight uppercase">
              {t("dashboard.lowStock")}
            </h3>
            <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded">
              Buffer Alert
            </span>
          </div>

          {lowStock?.length ? (
            <div className="space-y-2.5">
              {lowStock.map((s, i) => (
                <Card
                  key={i}
                  className="p-4 flex items-center justify-between border-l-4 border-l-red-600 hover:shadow-md transition"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900">{s.medicine_name}</p>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{s.facility_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block text-xs font-black text-red-700 bg-red-100 border border-red-200 px-2.5 py-1 rounded-md tabular-nums">
                      {s.quantity_available} left
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState title={t("dashboard.noShortages")} description={t("dashboard.noShortagesDescription")} />
          )}
        </div>
      </div>
    </div>
  );
}