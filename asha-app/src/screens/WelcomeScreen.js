import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StatusBar } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS } from "../config";
import LanguageSwitcher from "../components/LanguageSwitcher";

const HIGHLIGHTS = [
  {
    icon: "📶",
    titleKey: "welcome.feature1Title",
    descKey: "welcome.feature1Desc",
    defaultTitle: "Offline-First Sync",
    defaultDesc: "Register patients and log referrals without cellular network.",
  },
  {
    icon: "🪪",
    titleKey: "welcome.feature2Title",
    descKey: "welcome.feature2Desc",
    defaultTitle: "ABHA & ABDM Compliant",
    defaultDesc: "Direct linking to 14-digit ABHA IDs and FHIR health records.",
  },
  {
    icon: "🏥",
    titleKey: "welcome.feature3Title",
    descKey: "welcome.feature3Desc",
    defaultTitle: "Sub-Centre → PHC Loop",
    defaultDesc: "Track high-risk cases and triage to specialist doctors seamlessly.",
  },
];

export default function WelcomeScreen({ navigation }) {
  const { t } = useTranslation();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.white }}
      contentContainerStyle={{ flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F6F05" />

      {/* Topmost Institutional Header */}
      <View style={{ backgroundColor: "#128807", paddingTop: 52, paddingBottom: 28, paddingHorizontal: 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 8,
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: COLORS.white, fontSize: 20, fontWeight: "800" }}>R</Text>
            </View>
            <View>
              <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: "800", letterSpacing: 0.5 }}>
                {t("app.name", "RHAQ")}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 10, fontWeight: "600" }}>
                {t("app.portalTagline", "National Telemedicine Bridge")}
              </Text>
            </View>
          </View>
          <LanguageSwitcher light compact />
        </View>

        <Text style={{ fontSize: 11, fontWeight: "700", color: "#FFD54F", letterSpacing: 0.8, textTransform: "uppercase" }}>
          {t("gov.ministry", "Ministry of Health & Family Welfare")}
        </Text>
        <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.white, marginTop: 4, lineHeight: 28 }}>
          {t("landing.headline", "Bridging the Digital Health Divide")}
        </Text>
        <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", marginTop: 6, lineHeight: 18 }}>
          {t("landing.subheadline", "Offline-first referral tracking and telemedicine support for rural health workers.")}
        </Text>
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
          {t("landing.abhaAlert", "Please provide ABHA ID in all consults")}
        </Text>
      </View>

      {/* Feature Highlights */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#1E293B", marginBottom: 12 }}>
          {t("landing.featuresTitle", "Key Operational Features")}
        </Text>

        {HIGHLIGHTS.map((f, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 12,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontSize: 24 }}>{f.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#0F172A" }}>
                {t(f.titleKey, f.defaultTitle)}
              </Text>
              <Text style={{ fontSize: 12, color: "#64748B", marginTop: 2, lineHeight: 16 }}>
                {t(f.descKey, f.defaultDesc)}
              </Text>
            </View>
          </View>
        ))}

        <View style={{ flex: 1, minHeight: 16 }} />

        {/* Action Buttons */}
        <View style={{ gap: 10, marginTop: 12 }}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Login", { initialRole: "asha" })}
            style={{
              backgroundColor: "#E65100",
              borderRadius: 12,
              paddingVertical: 14,
              alignItems: "center",
              elevation: 2,
              shadowColor: "#E65100",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: "800" }}>
              {t("landing.ctaStaff", "ASHA Worker Login")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Login", { initialRole: "doctor" })}
            style={{
              backgroundColor: COLORS.white,
              borderWidth: 1.5,
              borderColor: "#128807",
              borderRadius: 12,
              paddingVertical: 13,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#128807", fontSize: 15, fontWeight: "700" }}>
              {t("landing.btnDoctor", "Medical Officer / Doctor Login")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Compliance Footer Note */}
        <Text style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginVertical: 16, lineHeight: 16 }}>
          {t("gov.designedBy", "Smart India Hackathon 2026")} • {t("gov.swasthBharat", "Swasth Bharat")}
        </Text>
      </View>
    </ScrollView>
  );
}