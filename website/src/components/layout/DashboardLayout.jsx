import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PATIENT_NAV = [
  { to: "/patient/book-appointment", label: "Book Appointment" },
  { to: "/patient/appointments", label: "My Appointments" },
  { to: "/patient/prescriptions", label: "Prescriptions" },
];

const STAFF_NAV = [
  { to: "/staff/referrals", label: "Referrals" },
  { to: "/staff/high-risk", label: "High-Risk Follow-ups" },
  { to: "/staff/dashboard", label: "Facility Dashboard" },
  { to: "/staff/emergency", label: "Emergencies" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isPatient = user?.role === "patient";
  const navItems = isPatient ? PATIENT_NAV : STAFF_NAV;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 shrink-0 border-r border-line bg-white flex flex-col">
        <div className="px-6 py-6 border-b border-line">
          <p className="text-lg font-semibold text-ink tracking-tight">RHAQ</p>
          <p className="text-xs text-ink/45 mt-0.5">Rural Health Access</p>
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
          <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
          <p className="text-xs text-ink/45 capitalize">{user?.role?.replace(/_/g, " ")}</p>
          <button onClick={handleLogout} className="text-xs font-medium text-rose-500 hover:text-rose-600 mt-2">
            Log out
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
