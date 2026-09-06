import React, { useState } from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { useTranslation } from "react-i18next";
import { synthesizeSpeech, isBhashiniConfigured } from "../services/bhashiniService";
import { playBase64Audio } from "../services/audioPlayer";
import { COLORS } from "../config";

/**
 * A "🔊 Read aloud" button for any freeform text (a referral reason, a
 * high-risk condition note, etc.). Speaks it in the app's current
 * language via Bhashini, translating first if `sourceLang` differs from
 * the current language. Degrades to a clear, non-crashing message if
 * Bhashini credentials aren't configured yet, rather than failing silently.
 */
export default function ReadAloudButton({ text, sourceLang = "en", compact = false }) {
  const { i18n, t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const targetLang = i18n.language?.split("-")[0] || "en";

  async function handlePress() {
    setError("");
    if (!isBhashiniConfigured()) {
      setError(t("common.readAloudError"));
      return;
    }
    setLoading(true);
    try {
      const audio = await synthesizeSpeech(text, targetLang, sourceLang);
      await playBase64Audio(audio);
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
          <Text style={{ fontSize: compact ? 13 : 14, color: COLORS.primary, fontWeight: "700" }}>{t("common.readAloud")}</Text>
        )}
      </TouchableOpacity>
      {error ? (
        <Text style={{ fontSize: 11, color: COLORS.amber, marginTop: 4, maxWidth: 260 }}>{error}</Text>
      ) : null}
    </View>
  );
}
