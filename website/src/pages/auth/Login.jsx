import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-end mb-3">
          <LanguageSwitcher />
        </div>

        <div className="mb-10 text-center">
          <p className="text-2xl font-semibold text-ink tracking-tight">{t("app.name")}</p>
          <p className="text-sm text-ink/50 mt-1.5">{t("app.tagline")}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-line rounded-lg p-8">
          {error && <Banner variant="error">{error}</Banner>}

          <FormField label={t("login.phone")} required>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("login.phonePlaceholder")}
              autoFocus
            />
          </FormField>
          <FormField label={t("login.password")} required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("login.passwordPlaceholder")}
            />
          </FormField>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? t("login.loggingIn") : t("login.button")}
          </Button>
        </form>
      </div>
    </div>
  );
}
