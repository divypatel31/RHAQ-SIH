import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import "./src/i18n";
import { AuthProvider } from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";
import { registerAutoSync } from "./src/services/offlineQueue";

export default function App() {
  useEffect(() => {
    // Drain the offline queue automatically the moment connectivity
    // returns, for the whole lifetime of the app.
    const unsubscribe = registerAutoSync();
    return unsubscribe;
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppNavigator />
    </AuthProvider>
  );
}
