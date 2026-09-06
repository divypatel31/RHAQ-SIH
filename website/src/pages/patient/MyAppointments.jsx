import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { PageHeader, Card, StatusTag, Spinner, EmptyState, Button } from "../../components/common";
import { formatDate } from "../../utils/helpers";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api.get("/appointments").then((res) => setAppointments(res.data.appointments)).finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleCancel(appointment_id) {
    if (!confirm("Cancel this appointment?")) return;
    await api.patch(`/appointments/${appointment_id}/status`, { status: "cancelled" });
    load();
  }

  return (
    <div>
      <PageHeader title="My Appointments" subtitle="Everything you've booked, past and upcoming." />

      {loading ? (
        <Spinner />
      ) : appointments.length === 0 ? (
        <EmptyState title="No appointments yet" description="Book one from the Book Appointment page." />
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <Card key={a.appointment_id} className="p-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ink">{a.facility_name}</p>
                <p className="text-xs text-ink/50 mt-1">
                  {formatDate(a.appointment_date)} {a.is_teleconsult ? "· Teleconsultation" : "· In-person"}
                  {a.doctor_name ? ` · Dr. ${a.doctor_name}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusTag status={a.status} />
                {a.status === "scheduled" && (
                  <Button variant="danger" onClick={() => handleCancel(a.appointment_id)}>
                    Cancel
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
