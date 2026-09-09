import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";

export default function Landing() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("patient");
  const [activeModal, setActiveModal] = useState(null);

  const currentSteps =
    activeTab === "patient"
      ? [
          {
            step: "1",
            title: t("landing.step1Title"),
            desc: t("landing.step1Desc"),
            color: "border-purple-600 text-purple-600 bg-purple-50",
          },
          {
            step: "2",
            title: t("landing.step2Title"),
            desc: t("landing.step2Desc"),
            color: "border-amber-500 text-amber-600 bg-amber-50",
          },
          {
            step: "3",
            title: t("landing.step3Title"),
            desc: t("landing.step3Desc"),
            color: "border-blue-600 text-blue-600 bg-blue-50",
          },
          {
            step: "4",
            title: t("landing.step4Title"),
            desc: t("landing.step4Desc"),
            color: "border-emerald-600 text-emerald-600 bg-emerald-50",
          },
        ]
      : [
          {
            step: "1",
            title: t("landing.assistedStep1Title"),
            desc: t("landing.assistedStep1Desc"),
            color: "border-emerald-700 text-emerald-700 bg-emerald-50",
          },
          {
            step: "2",
            title: t("landing.assistedStep2Title"),
            desc: t("landing.assistedStep2Desc"),
            color: "border-amber-500 text-amber-600 bg-amber-50",
          },
          {
            step: "3",
            title: t("landing.assistedStep3Title"),
            desc: t("landing.assistedStep3Desc"),
            color: "border-blue-600 text-blue-600 bg-blue-50",
          },
          {
            step: "4",
            title: t("landing.assistedStep4Title"),
            desc: t("landing.assistedStep4Desc"),
            color: "border-purple-600 text-purple-600 bg-purple-50",
          },
        ];

  const metrics = [
    { val: t("landing.stat1Value"), label: t("landing.stat1Label") },
    { val: t("landing.stat2Value"), label: t("landing.stat2Label") },
    { val: t("landing.stat3Value"), label: t("landing.stat3Label") },
    { val: t("landing.stat4Value"), label: t("landing.stat4Label") },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 relative">
      {/* Topmost Gov Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-600 tracking-tight">{t("app.name")}</span>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block leading-none">
                {t("app.portalTagline")}
              </span>
            </div>
            <div className="hidden md:block h-7 w-[1px] bg-slate-300" />
            <div className="hidden md:flex flex-col text-[11px] font-semibold text-slate-600 leading-tight">
              <span>{t("gov.ministry")}</span>
              <span className="text-[10px] text-slate-400 font-normal">{t("gov.country")}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-600 border border-slate-200 rounded px-2 py-1">
              <button type="button" className="hover:text-blue-600">A-</button>
              <span>|</span>
              <button type="button" className="hover:text-blue-600">A</button>
              <span>|</span>
              <button type="button" className="hover:text-blue-600">A+</button>
            </div>
            <LanguageSwitcher />
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full text-xs font-semibold border border-slate-300 text-slate-700 hover:bg-slate-100 transition shadow-sm"
            >
              {t("landing.btnPatient")}
            </Link>
            <Link
              to="/login"
              className="px-4 py-1.5 rounded-full text-xs font-semibold border border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-sm"
            >
              {t("landing.btnDoctor")}
            </Link>
          </div>
        </div>
      </div>

      {/* Official Green Nav Bar */}
      <nav className="bg-[#128807] text-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs font-medium tracking-wide">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="hover:text-amber-200 transition font-semibold cursor-pointer"
            >
              {t("landing.navHome")}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("about")}
              className="hover:text-amber-200 transition font-semibold cursor-pointer"
            >
              {t("landing.navAbout")}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("opd")}
              className="hover:text-amber-200 transition font-semibold cursor-pointer"
            >
              {t("landing.navOpd")}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("gallery")}
              className="hover:text-amber-200 transition font-semibold cursor-pointer"
            >
              {t("landing.navGallery")}
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("support")}
              className="hover:text-amber-200 transition font-semibold cursor-pointer"
            >
              {t("landing.navSupport")}
            </button>
          </div>
          <span className="text-[11px] opacity-90 hidden md:inline">
            {t("gov.swasthBharat")}
          </span>
        </div>
      </nav>

      {/* ABHA Compliance Strip */}
      <div className="bg-blue-100 border-b border-blue-200 py-1.5 px-4 text-center">
        <p className="text-xs font-bold text-red-600 flex items-center justify-center gap-2">
          <span className="bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-mono">ABHA</span>
          {t("landing.abhaAlert")}
        </p>
      </div>

      {/* Dynamic Translated Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>

            {activeModal === "about" && (
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">{t("landing.modalAboutTag")}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{t("landing.modalAboutTitle")}</h3>
                <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                  {t("landing.modalAboutDesc")}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800">{t("landing.modalAboutCard1Title")}</p>
                    <p className="text-slate-500 mt-0.5">{t("landing.modalAboutCard1Desc")}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="font-bold text-slate-800">{t("landing.modalAboutCard2Title")}</p>
                    <p className="text-slate-500 mt-0.5">{t("landing.modalAboutCard2Desc")}</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "opd" && (
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">{t("landing.modalOpdTag")}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{t("landing.modalOpdTitle")}</h3>
                <div className="mt-4 overflow-hidden border border-slate-200 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5">{t("landing.modalOpdColTier")}</th>
                        <th className="p-2.5">{t("landing.modalOpdColDays")}</th>
                        <th className="p-2.5">{t("landing.modalOpdColTimings")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-600">
                      <tr>
                        <td className="p-2.5 font-medium text-slate-800">{t("landing.modalOpdRow1Tier")}</td>
                        <td className="p-2.5">{t("landing.modalOpdRow1Days")}</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">{t("landing.modalOpdRow1Time")}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-800">{t("landing.modalOpdRow2Tier")}</td>
                        <td className="p-2.5">{t("landing.modalOpdRow2Days")}</td>
                        <td className="p-2.5 text-emerald-700 font-semibold">{t("landing.modalOpdRow2Time")}</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-medium text-slate-800">{t("landing.modalOpdRow3Tier")}</td>
                        <td className="p-2.5">{t("landing.modalOpdRow3Days")}</td>
                        <td className="p-2.5 text-red-600 font-bold">{t("landing.modalOpdRow3Time")}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeModal === "gallery" && (
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase tracking-wide">{t("landing.modalGalleryTag")}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{t("landing.modalGalleryTitle")}</h3>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <p className="text-3xl">📱</p>
                    <p className="text-xs font-bold text-slate-800 mt-2">{t("landing.modalGalleryItem1Title")}</p>
                    <p className="text-[10px] text-slate-500">{t("landing.modalGalleryItem1Desc")}</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <p className="text-3xl">🩺</p>
                    <p className="text-xs font-bold text-slate-800 mt-2">{t("landing.modalGalleryItem2Title")}</p>
                    <p className="text-[10px] text-slate-500">{t("landing.modalGalleryItem2Desc")}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <p className="text-3xl">🏥</p>
                    <p className="text-xs font-bold text-slate-800 mt-2">{t("landing.modalGalleryItem3Title")}</p>
                    <p className="text-[10px] text-slate-500">{t("landing.modalGalleryItem3Desc")}</p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "support" && (
              <div>
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wide">{t("landing.modalSupportTag")}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{t("landing.modalSupportTitle")}</h3>
                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{t("landing.modalSupportCard1Title")}</p>
                      <p className="text-slate-500">{t("landing.modalSupportCard1Desc")}</p>
                    </div>
                    <span className="font-mono text-sm font-bold text-emerald-700">104 / 1075</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{t("landing.modalSupportCard2Title")}</p>
                      <p className="text-slate-500">{t("landing.modalSupportCard2Desc")}</p>
                    </div>
                    <span className="font-mono text-xs font-semibold text-slate-700">support.abdm@gov.in</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-[#128807] hover:bg-emerald-800 rounded-md transition cursor-pointer"
              >
                {t("landing.modalClose")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-emerald-50 py-12 md:py-16 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-4">
              ● {t("landing.eyebrow")}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {t("landing.headline")}
            </h1>
            <p className="mt-4 text-sm md:text-base text-slate-600 max-w-xl leading-relaxed">
              {t("landing.subheadline")}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-md text-sm font-semibold bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
              >
                {t("landing.ctaConsult")}
              </Link>
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-md text-sm font-semibold bg-white text-slate-700 border border-slate-300 hover:border-emerald-600 hover:text-emerald-700 shadow-sm transition"
              >
                {t("landing.ctaStaff")}
              </Link>
            </div>
          </div>

          {/* Hero Feature Cards */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-lg font-bold shrink-0">
                💬
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{t("landing.cloudTitle")}</h4>
                <p className="text-xs text-slate-500">{t("landing.cloudDesc")}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 text-lg font-bold shrink-0">
                🏥
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{t("landing.assistedTitle")}</h4>
                <p className="text-xs text-slate-500">{t("landing.assistedDesc")}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 text-lg font-bold shrink-0">
                🆔
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{t("landing.abdmTitle")}</h4>
                <p className="text-xs text-slate-500">{t("landing.abdmDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Metrics Strip */}
      <section className="bg-white py-8 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {metrics.map((m) => (
            <div key={m.label} className="p-3">
              <p className="text-2xl md:text-3xl font-black text-blue-900 tracking-tight">{m.val}</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4-Step Flow Section with Reactive Switcher */}
      <section className="max-w-7xl mx-auto px-6 py-14">
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-slate-200 p-1 border border-slate-300">
            <button
              type="button"
              onClick={() => setActiveTab("patient")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "patient"
                  ? "bg-amber-500 text-white shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("landing.tabPatientToDoctor")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("assisted")}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activeTab === "assisted"
                  ? "bg-emerald-700 text-white shadow-md scale-105"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {t("landing.tabAssisted")}
            </button>
          </div>
        </div>

        {/* Dynamic Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {currentSteps.map((s) => (
            <div
              key={`${activeTab}-${s.step}`}
              className="bg-white border border-slate-200 rounded-xl p-5 relative shadow-sm hover:shadow-md transition-all duration-200"
            >
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-bold text-sm mb-3 ${s.color}`}>
                {s.step}
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white font-semibold">
              {t("app.name")} — {t("app.tagline")}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {t("landing.footerNote")}
            </p>
          </div>
          <p className="text-[11px]">
            {t("gov.designedBy")}
          </p>
        </div>
      </footer>
    </div>
  );
}