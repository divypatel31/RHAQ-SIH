import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";
import { COLORS } from "../config";

export default function LanguageSwitcher({ light = false, compact = false }) {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.split("-")[0] || "en";

  return (
    <View style={compact ? undefined : { marginBottom: 20 }}>
      {!compact && (
        <Text style={{ fontSize: 13, fontWeight: "600", color: light ? "rgba(255,255,255,0.75)" : COLORS.textMuted, marginBottom: 8 }}>
          {t("common.language")}
        </Text>
      )}
      <View style={{ flexDirection: "row", gap: 8 }}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = current === lang.code;
          const activeBg = light ? "rgba(255,255,255,0.95)" : COLORS.primary;
          const activeText = light ? COLORS.primary : COLORS.white;
          const inactiveBg = light ? "rgba(255,255,255,0.12)" : COLORS.white;
          const inactiveText = light ? "rgba(255,255,255,0.9)" : COLORS.text;
          const inactiveBorder = light ? "rgba(255,255,255,0.3)" : COLORS.border;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => i18n.changeLanguage(lang.code)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                backgroundColor: active ? activeBg : inactiveBg,
                borderWidth: 1,
                borderColor: active ? activeBg : inactiveBorder,
              }}
            >
              <Text style={{ color: active ? activeText : inactiveText, fontWeight: "600", fontSize: 12 }}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
