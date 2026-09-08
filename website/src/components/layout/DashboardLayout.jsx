import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../common/LanguageSwitcher";

export default function DashboardLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isPatient = user?.role === "patient";
  const isAdmin = user?.role === "admin";

  const PATIENT_NAV = [
    { to: "/patient/book-appointment", label: t("nav.bookAppointment") },
    { to: "/patient/appointments", label: t("nav.myAppointments") },
    { to: "/patient/prescriptions", label: t("nav.prescriptions") },
  ];

  const STAFF_NAV = [
    { to: "/staff/referrals", label: t("nav.referrals") },
    { to: "/staff/high-risk", label: t("nav.highRisk") },
    { to: "/staff/dashboard", label: t("nav.dashboard") },
    { to: "/staff/emergency", label: t("nav.emergency") },
  ];

  const ADMIN_NAV = [
    { to: "/staff/admin/users", label: t("nav.users") },
    { to: "/staff/admin/facilities", label: t("nav.facilities") },
  ];

  const navItems = isPatient ? PATIENT_NAV : [...STAFF_NAV, ...(isAdmin ? ADMIN_NAV : [])];

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-line bg-white flex flex-col">
        <div className="px-6 py-6 border-b border-line">
          <p className="text-lg font-semibold text-ink tracking-tight">{t("app.name")}</p>
          <p className="text-xs text-ink/45 mt-0.5">{t("app.tagline")}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? "bg-teal-50 text-teal-700" : "text-ink/60 hover:bg-ink/[0.03] hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-line">
          <div className="mb-3">
            <LanguageSwitcher />
          </div>
          <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
          <p className="text-xs text-ink/45 capitalize">{user?.role?.replace(/_/g, " ")}</p>
          <button onClick={handleLogout} className="text-xs font-medium text-rose-500 hover:text-rose-600 mt-2">
            {t("nav.logout")}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-8 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
