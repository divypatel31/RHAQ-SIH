import React, { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as Speech from "expo-speech";
import { synthesizeSpeech, isBhashiniConfigured } from "../services/bhashiniService";
import { playBase64Audio } from "../services/audioPlayer";
import { COLORS } from "../config";

export default function ReadAloudButton({ text, sourceLang = "en", compact = false }) {
  const { i18n, t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const targetLang = i18n.language?.split("-")[0] || "en";

  async function handlePress() {
    setError("");
    setLoading(true);

    try {
      // If Bhashini API keys are configured, use Bhashini's professional AI pipeline
      if (isBhashiniConfigured()) {
        const audio = await synthesizeSpeech(text, targetLang, sourceLang);
        await playBase64Audio(audio);
      } else {
        // Fallback: Use built-in offline device speech (No API key needed!)
        const options = {
          language: targetLang === "hi" ? "hi-IN" : targetLang === "mr" ? "mr-IN" : "en-US",
          pitch: 1.0,
          rate: 0.9,
        };
        
        Speech.speak(text, options);
      }
    } catch (err) {
      setError(err.message || "Couldn't read this aloud right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        disabled={loading}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingVertical: compact ? 4 : 10,
          paddingHorizontal: compact ? 8 : 14,
          borderRadius: 8,
          backgroundColor: compact ? "transparent" : COLORS.background,
          borderWidth: compact ? 0 : 1,
          borderColor: COLORS.border,
          alignSelf: "flex-start",
        }}
      >
        {loading ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Text style={{ fontSize: compact ? 13 : 14, color: COLORS.primary, fontWeight: "700" }}>
            {t("common.readAloud")}
          </Text>
        )}
      </TouchableOpacity>
      {error ? (
        <Text style={{ fontSize: 11, color: COLORS.amber, marginTop: 4, maxWidth: 260 }}>{error}</Text>
      ) : null}
    </View>
  );
}