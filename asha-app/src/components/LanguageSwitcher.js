import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { SUPPORTED_LANGUAGES } from "../i18n";
import { COLORS } from "../config";

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current = i18n.language?.split("-")[0] || "en";

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 13, fontWeight: "600", color: COLORS.textMuted, marginBottom: 8 }}>
        {t("common.language")}
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {SUPPORTED_LANGUAGES.map((lang) => {
          const active = current === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => i18n.changeLanguage(lang.code)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 20,
                backgroundColor: active ? COLORS.primary : COLORS.white,
                borderWidth: 1,
                borderColor: active ? COLORS.primary : COLORS.border,
              }}
            >
              <Text style={{ color: active ? COLORS.white : COLORS.text, fontWeight: "600", fontSize: 13 }}>
                {lang.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
