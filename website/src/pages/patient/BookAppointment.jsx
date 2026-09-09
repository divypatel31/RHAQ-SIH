import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import api from "../../utils/api";
import { PageHeader, Card, FormField, Input, Select, Button, Banner, Spinner } from "../../components/common";

export default function BookAppointment() {
  const { t } = useTranslation();
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(true);
  const [form, setForm] = useState({ facility_id: "", appointment_date: "", is_teleconsult: false });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/facilities")
      .then((res) => setFacilities(res.data.facilities || []))
      .finally(() => setLoadingFacilities(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.facility_id || !form.appointment_date) {
      setError(t("bookAppointment.errorRequired"));
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
      setError(err.response?.data?.message || t("bookAppointment.errorGeneric"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4 flex flex-wrap items-center justify-between gap-4">
        <PageHeader title={t("bookAppointment.title")} subtitle={t("bookAppointment.subtitle")} />
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs font-bold text-blue-700">
          <span className="font-mono bg-blue-600 text-white px-1.5 py-0.5 rounded text-[10px]">ABDM</span>
          <span>Ayushman Arogya Mandir Network</span>
        </div>
      </div>

      {success && <Banner variant="info">{t("bookAppointment.successBanner")}</Banner>}
      {error && <Banner variant="error">{error}</Banner>}

      <div className="grid md:grid-cols-12 gap-6">
        <Card className="p-6 md:col-span-7 border-t-4 border-t-emerald-600 shadow-sm">
          {loadingFacilities ? (
            <Spinner />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField label={t("bookAppointment.facility")} required>
                <Select
                  value={form.facility_id}
                  onChange={(e) => setForm({ ...form, facility_id: e.target.value })}
                  className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                >
                  <option value="">{t("bookAppointment.selectFacility")}</option>
                  {facilities.map((f) => (
                    <option key={f.facility_id} value={f.facility_id}>
                      {f.name} ({f.tier.replace(/_/g, " ").toUpperCase()})
                    </option>
                  ))}
                </Select>
              </FormField>

              <FormField label={t("bookAppointment.date")} required>
                <Input
                  type="date"
                  value={form.appointment_date}
                  onChange={(e) => setForm({ ...form, appointment_date: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                />
              </FormField>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={form.is_teleconsult}
                    onChange={(e) => setForm({ ...form, is_teleconsult: e.target.checked })}
                    className="w-4 h-4 rounded text-emerald-700 border-slate-300 focus:ring-emerald-600"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">{t("bookAppointment.teleconsult")}</p>
                    <p className="text-[11px] text-slate-500">Video/audio consultation via eSanjeevani portal</p>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-[#128807] hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-lg border-0 shadow-sm"
                >
                  {submitting ? t("bookAppointment.submitting") : t("bookAppointment.submit")}
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Patient Advisory Panel */}
        <div className="md:col-span-5 space-y-4">
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-2">
            <p className="font-bold text-amber-900 flex items-center gap-1.5">
              <span>⚠️</span> Tele-consultation Protocol
            </p>
            <p className="text-amber-800 leading-relaxed">
              Please have your 14-digit ABHA number and any prior prescriptions ready before the consultation time.
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs space-y-2.5 shadow-sm">
            <p className="font-bold text-slate-800 uppercase tracking-wide text-[11px]">Free Public Health Service</p>
            <p className="text-slate-500 leading-relaxed">
              All appointments booked under the Rural Health Infrastructure are covered under the National Health Mission and delivered free of cost.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}