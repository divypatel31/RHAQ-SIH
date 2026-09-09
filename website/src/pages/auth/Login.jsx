import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import { Button, Input, FormField, Banner } from "../../components/common";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginType, setLoginType] = useState("patient"); // 'patient' | 'staff'

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(phone.trim(), password);
      navigate(user.role === "patient" ? "/patient/book-appointment" : "/staff/referrals");
    } catch (err) {
      setError(err.response?.data?.message || t("login.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800">
      {/* Topmost Official Bar */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="text-xl font-black text-amber-600 tracking-tight leading-none">
                {t("app.name")}
              </span>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-0.5">
                {t("app.portalTagline")}
              </span>
            </div>
            <div className="hidden sm:block h-6 w-[1px] bg-slate-200" />
            <div className="hidden sm:flex flex-col text-[11px] font-semibold text-slate-600 leading-tight">
              <span>{t("gov.ministry")}</span>
              <span className="text-[10px] text-slate-400 font-normal">{t("gov.country")}</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition"
            >
              ← {t("landing.navHome")}
            </Link>
          </div>
        </div>
        {/* Tricolor Accent Stripe */}
        <div className="h-1 w-full bg-[#128807]" />
      </header>

      {/* Login Card Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* ABHA Compliance Advisory */}
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-xs font-bold text-red-600 flex items-center justify-center gap-1.5">
              <span className="bg-red-600 text-white text-[9px] px-1 py-0.5 rounded font-mono font-bold">ABHA</span>
              {t("landing.abhaAlert")}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
            {/* Header / Portal Selector */}
            <div className="p-6 pb-4 border-b border-slate-100 text-center">
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                {t("login.button")}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t("app.tagline")}
              </p>

              {/* Patient vs Provider Toggle */}
              <div className="mt-5 inline-flex rounded-full bg-slate-100 p-1 border border-slate-200 w-full">
                <button
                  type="button"
                  onClick={() => setLoginType("patient")}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    loginType === "patient"
                      ? "bg-amber-500 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t("landing.btnPatient")}
                </button>
                <button
                  type="button"
                  onClick={() => setLoginType("staff")}
                  className={`flex-1 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    loginType === "staff"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t("landing.btnDoctor")}
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && <Banner variant="error">{error}</Banner>}

              <FormField label={t("login.phone")} required>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("login.phonePlaceholder")}
                  autoFocus
                  className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                />
              </FormField>

              <FormField label={t("login.password")} required>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login.passwordPlaceholder")}
                  className="rounded-lg border-slate-300 focus:border-emerald-600 focus:ring-emerald-600"
                />
              </FormField>

              <Button
                type="submit"
                className={`w-full py-2.5 rounded-lg text-sm font-bold text-white transition shadow-sm cursor-pointer ${
                  loginType === "patient"
                    ? "bg-amber-500 hover:bg-amber-600"
                    : "bg-emerald-700 hover:bg-emerald-800"
                }`}
                disabled={loading}
              >
                {loading ? t("login.loggingIn") : `${t("login.button")} (${loginType === "patient" ? t("landing.btnPatient") : t("landing.btnDoctor")})`}
              </Button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400">
                  {t("gov.swasthBharat")} · Ayushman Bharat Digital Mission (ABDM)
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Official Footer Strip */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-4 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <p className="text-[11px]">
            {t("gov.designedBy")}
          </p>
          <p className="text-[11px] text-slate-500">
            {t("gov.allRights")}
          </p>
        </div>
      </footer>
    </div>
  );
}