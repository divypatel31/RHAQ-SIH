import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { LabeledInput, PrimaryButton, Banner } from "../components/ui";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function LoginScreen({ navigation }) {
  const { t } = useTranslation();
  const { login } = useAuth();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!phone || !password) {
      setError(t("login.errorRequired", { defaultValue: "Please enter both phone number and password." }));
      return;
    }
    setError("");
    setLoading(true);
    try {
      // Role is implicitly ASHA for this application
      await login(phone.trim(), password);
    } catch (err) {
      if (err.message === "Network Error" || !err.response) {
        setError(t("login.errorNetwork", { defaultValue: "Network error. Working in offline mode if previously cached." }));
      } else {
        setError(err.response?.data?.message || t("login.errorGeneric"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "#F8FAFC" }}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F6F05" />

      {/* Institutional MoHFW Header */}
      <View style={{ backgroundColor: "#128807", paddingTop: 48, paddingBottom: 20, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack()}
            style={{
              paddingVertical: 6,
              paddingHorizontal: 10,
              backgroundColor: "rgba(255,255,255,0.15)",
              borderRadius: 8,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "700" }}>
              ← {t("landing.navHome", { defaultValue: "Back" })}
            </Text>
          </TouchableOpacity>
          <LanguageSwitcher light compact />
        </View>

        <View style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 10, fontWeight: "700", color: "#FFD54F", letterSpacing: 0.8, textTransform: "uppercase" }}>
            {t("gov.ministry", { defaultValue: "Ministry of Health & Family Welfare" })}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#FFFFFF", marginTop: 2 }}>
            {t("login.button", { defaultValue: "ASHA Sign In" })}
          </Text>
          <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 2 }}>
            {t("app.portalTagline", { defaultValue: "National Telemedicine & Last-Mile Referral Service" })}
          </Text>
        </View>
      </View>

      {/* ABHA Compliance Strip */}
      <View
        style={{
          backgroundColor: "#E3F2FD",
          paddingVertical: 8,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          borderBottomWidth: 1,
          borderBottomColor: "#BBDEFB",
        }}
      >
        <View style={{ backgroundColor: "#D32F2F", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 }}>
          <Text style={{ color: "#FFF", fontSize: 9, fontWeight: "800" }}>ABHA</Text>
        </View>
        <Text style={{ color: "#D32F2F", fontSize: 11, fontWeight: "700" }}>
          {t("landing.abhaAlert", { defaultValue: "Please provide ABHA ID in all consults" })}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }} showsVerticalScrollIndicator={false}>
        {/* Card Form */}
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: "#E2E8F0",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          {error ? <Banner variant="error">{error}</Banner> : null}

          <LabeledInput
            label={t("login.phone")}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            placeholder={t("login.phonePlaceholder")}
          />

          <LabeledInput
            label={t("login.password")}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder={t("login.passwordPlaceholder")}
          />

          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              title={loading ? t("login.loggingIn", { defaultValue: "Logging in..." }) : t("login.button", { defaultValue: "Sign In" })}
              onPress={handleLogin}
              loading={loading}
              style={{
                backgroundColor: "#E65100", // Fixed ASHA brand color
                borderRadius: 10,
              }}
            />
          </View>

          <Text style={{ marginTop: 18, fontSize: 12, color: "#64748B", textAlign: "center", lineHeight: 16 }}>
            {t("login.offlineHint", { defaultValue: "Credentials are securely cached offline for low-connectivity rural health posts." })}
          </Text>
        </View>

        {/* Bottom Compliance Badge */}
        <View style={{ marginTop: "auto", paddingTop: 24, alignItems: "center" }}>
          <Text style={{ fontSize: 11, color: "#94A3B8", textAlign: "center" }}>
            {t("gov.swasthBharat", { defaultValue: "Swasth Bharat" })} • Ayushman Bharat Digital Mission
          </Text>
          <Text style={{ fontSize: 10, color: "#CBD5E1", marginTop: 2 }}>
            {t("gov.designedBy", { defaultValue: "SIH 2026" })}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}