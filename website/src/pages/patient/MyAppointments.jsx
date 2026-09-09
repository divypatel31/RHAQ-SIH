import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { PageHeader, Card, StatusTag, Spinner, EmptyState, Button } from "../../components/common";
import { formatDate } from "../../utils/helpers";

export default function MyAppointments() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api
      .get("/appointments")
      .then((res) => setAppointments(res.data.appointments || []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCancel(appointment_id) {
    if (!confirm(t("myAppointments.cancelConfirm"))) return;
    await api.patch(`/appointments/${appointment_id}/status`, { status: "cancelled" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title={t("myAppointments.title")} subtitle={t("myAppointments.subtitle")} />
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg">
          Official Consultation Passbook
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : appointments.length === 0 ? (
        <EmptyState title={t("myAppointments.emptyTitle")} description={t("myAppointments.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => {
            const isTele = a.is_teleconsult;
            return (
              <Card
                key={a.appointment_id}
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 shadow-sm ${
                  isTele ? "border-l-blue-600 bg-blue-50/10" : "border-l-emerald-600 bg-white"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                      APT-{a.appointment_id}
                    </span>
                    <p className="text-sm font-bold text-slate-900">{a.facility_name}</p>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        isTele
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-emerald-100 text-emerald-800 border-emerald-200"
                      }`}
                    >
                      {isTele ? t("myAppointments.teleconsult") : t("myAppointments.inPerson")}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-600 mt-2">
                    {formatDate(a.appointment_date)}
                    {a.doctor_name ? (
                      <span className="font-semibold text-slate-800"> · Dr. {a.doctor_name}</span>
                    ) : (
                      <span className="text-slate-400"> · Duty Medical Officer</span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                  <StatusTag status={a.status} />
                  {a.status === "scheduled" && (
                    <Button
                      variant="danger"
                      onClick={() => handleCancel(a.appointment_id)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                    >
                      {t("myAppointments.cancel")}
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