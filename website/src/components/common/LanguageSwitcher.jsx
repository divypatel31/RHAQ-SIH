import React from "react";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../../i18n";

export default function LanguageSwitcher({ className = "" }) {
  const { i18n } = useTranslation();
  const current = i18n.language?.split("-")[0] || "en";

  return (
    <select
      value={current}
      onChange={(e) => i18n.changeLanguage(e.target.value)}
      className={`text-xs font-medium text-ink/60 bg-transparent border border-line rounded-md px-2 py-1.5 focus:outline-none focus:border-teal-500 ${className}`}
    >
      {SUPPORTED_LANGUAGES.map((lang) => (
        <option key={lang.code} value={lang.code}>{lang.label}</option>
      ))}
    </select>
  );
}
