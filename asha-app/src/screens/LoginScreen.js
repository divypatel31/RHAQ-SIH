import React, { useState } from "react";
import { Text, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { ScreenContainer, ScreenTitle, LabeledInput, PrimaryButton, Banner } from "../components/ui";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    if (!phone || !password) {
      setError(t("login.errorRequired"));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(phone.trim(), password);
    } catch (err) {
      if (err.message === "Network Error" || !err.response) {
        setError(t("login.errorNetwork"));
      } else {
        setError(err.response?.data?.message || t("login.errorGeneric"));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <ScreenContainer style={{ justifyContent: "center" }}>
          <LanguageSwitcher />

          <ScreenTitle subtitle={t("login.subtitle")}>{t("login.title")}</ScreenTitle>

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

          <PrimaryButton title={t("login.button")} onPress={handleLogin} loading={loading} />

          <Text style={{ marginTop: 20, fontSize: 13, color: "#6B7280", textAlign: "center" }}>
            {t("login.offlineHint")}
          </Text>
        </ScreenContainer>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
