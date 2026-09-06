import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import { PageHeader, Card, FormField, Input, Select, Button, Banner, Spinner } from "../../components/common";

export default function BookAppointment() {
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [form, setForm] = useState({ facility_id: "", appointment_date: "", is_teleconsult: false });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/facilities").then((res) => setFacilities(res.data.facilities)).finally(() => setLoadingFacilities(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.facility_id || !form.appointment_date) {
      setError("Please choose a facility and a date.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await api.post("/appointments", {
        facility_id: Number(form.facility_id),
        appointment_date: form.appointment_date,
        is_teleconsult: form.is_teleconsult,
      });
      setSuccess(true);
      setForm({ facility_id: "", appointment_date: "", is_teleconsult: false });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to book appointment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Book an Appointment" subtitle="Choose a facility and a date that works for you." />

      {success && (
        <Banner variant="info">
          Your appointment request has been sent. You can track its status under "My Appointments."
        </Banner>
      )}
      {error && <Banner variant="error">{error}</Banner>}

      <Card className="p-6 max-w-lg">
        {loadingFacilities ? (
          <Spinner />
        ) : (
          <form onSubmit={handleSubmit}>
            <FormField label="Facility" required>
              <Select value={form.facility_id} onChange={(e) => setForm({ ...form, facility_id: e.target.value })}>
                <option value="">Select a facility…</option>
                {facilities.map((f) => (
                  <option key={f.facility_id} value={f.facility_id}>
                    {f.name} ({f.tier.replace(/_/g, " ")})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Preferred Date" required>
              <Input
                type="date"
                value={form.appointment_date}
                onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
              />
            </FormField>

            <label className="flex items-center gap-2 mb-6 text-sm text-ink/70">
              <input
                type="checkbox"
                checked={form.is_teleconsult}
                onChange={(e) => setForm({ ...form, is_teleconsult: e.target.checked })}
                className="rounded border-line"
              />
              This is a teleconsultation (remote), not an in-person visit
            </label>

            <Button type="submit" disabled={submitting}>
              {submitting ? "Booking…" : "Book Appointment"}
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
