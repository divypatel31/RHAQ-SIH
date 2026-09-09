import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { PageHeader, Card, Spinner, EmptyState } from "../../components/common";
import { formatDate } from "../../utils/helpers";

export default function MyPrescriptions() {
  const { t } = useTranslation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/prescriptions")
      .then((res) => setPrescriptions(res.data.prescriptions || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title={t("myPrescriptions.title")} subtitle={t("myPrescriptions.subtitle")} />
        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800">
          <span>ABDM Verified e-Prescriptions (FHIR)</span>
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : prescriptions.length === 0 ? (
        <EmptyState title={t("myPrescriptions.emptyTitle")} description={t("myPrescriptions.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <Card
              key={p.prescription_id}
              className="p-5 border-l-4 border-l-emerald-600 bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 text-white font-mono">
                      RX-{p.prescription_id}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Digitally Certified
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900 mt-2 whitespace-pre-line font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {p.medicines}
                  </p>

                  {p.notes && (
                    <p className="text-xs text-slate-600 mt-2 bg-amber-50/60 p-2 rounded border border-amber-100 leading-relaxed">
                      <span className="font-bold text-amber-900">Dosage / Instructions:</span> {p.notes}
                    </p>
                  )}

                  <p className="text-xs text-slate-500 mt-3 font-medium">
                    Issued by:{" "}
                    <span className="text-slate-800 font-semibold">
                      {p.issued_by_name ? `Dr. ${p.issued_by_name}` : t("myPrescriptions.facilityStaffFallback")}
                    </span>
                    {p.facility_name ? <span className="text-slate-400"> · {p.facility_name}</span> : ""}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                    {formatDate(p.created_at)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}