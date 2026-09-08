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
    api.get("/prescriptions").then((res) => setPrescriptions(res.data.prescriptions)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={t("myPrescriptions.title")} subtitle={t("myPrescriptions.subtitle")} />

      {loading ? (
        <Spinner />
      ) : prescriptions.length === 0 ? (
        <EmptyState title={t("myPrescriptions.emptyTitle")} description={t("myPrescriptions.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <Card key={p.prescription_id} className="p-5" accentClass="border-teal-500">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{p.medicines}</p>
                  {p.notes && <p className="text-xs text-ink/55 mt-1.5">{p.notes}</p>}
                  <p className="text-xs text-ink/40 mt-2">
                    {p.issued_by_name ? `Dr. ${p.issued_by_name}` : t("myPrescriptions.facilityStaffFallback")}
                    {p.facility_name ? ` · ${p.facility_name}` : ""}
                  </p>
                </div>
                <p className="text-xs text-ink/40 whitespace-nowrap">{formatDate(p.created_at)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
