import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./components/layout/DashboardLayout";
import { Spinner } from "./components/common";

import Login from "./pages/auth/Login";
import Landing from "./pages/public/Landing";
import BookAppointment from "./pages/patient/BookAppointment";
import MyAppointments from "./pages/patient/MyAppointments";
import MyPrescriptions from "./pages/patient/MyPrescriptions";
import ReferralTracking from "./pages/facility-staff/ReferralTracking";
import HighRiskFollowups from "./pages/facility-staff/HighRiskFollowups";
import FacilityDashboard from "./pages/facility-staff/FacilityDashboard";
import EmergencyEscalations from "./pages/facility-staff/EmergencyEscalations";
import UserManagement from "./pages/admin/UserManagement";
import FacilityManagement from "./pages/admin/FacilityManagement";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "patient" ? "/patient/book-appointment" : "/staff/referrals"} replace />;
  }
  return children;
}

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  if (!user) return <Landing />;
  return <Navigate to={user.role === "patient" ? "/patient/book-appointment" : "/staff/referrals"} replace />;
}

const STAFF_ROLES = ["doctor", "receptionist", "admin"];

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<HomeRedirect />} />

          <Route
            path="/patient"
            element={
              <ProtectedRoute allowedRoles={["patient"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="prescriptions" element={<MyPrescriptions />} />
          </Route>

          <Route
            path="/staff"
            element={
              <ProtectedRoute allowedRoles={STAFF_ROLES}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="referrals" element={<ReferralTracking />} />
            <Route path="high-risk" element={<HighRiskFollowups />} />
            <Route path="dashboard" element={<FacilityDashboard />} />
            <Route path="emergency" element={<EmergencyEscalations />} />
            <Route
              path="admin/users"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/facilities"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <FacilityManagement />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
