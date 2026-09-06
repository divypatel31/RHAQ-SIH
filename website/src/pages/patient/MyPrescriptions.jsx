import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { PageHeader, Card, Spinner, EmptyState } from "../../components/common";
import { formatDate } from "../../utils/helpers";

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/prescriptions").then((res) => setPrescriptions(res.data.prescriptions)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Prescriptions" subtitle="Medicines prescribed to you by a doctor." />

      {loading ? (
        <Spinner />
      ) : prescriptions.length === 0 ? (
        <EmptyState title="No prescriptions yet" description="Prescriptions issued during a visit will appear here." />
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <Card key={p.prescription_id} className="p-5" accentClass="border-teal-500">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-ink">{p.medicines}</p>
                  {p.notes && <p className="text-xs text-ink/55 mt-1.5">{p.notes}</p>}
                  <p className="text-xs text-ink/40 mt-2">
                    {p.issued_by_name ? `Dr. ${p.issued_by_name}` : "Facility staff"}
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
