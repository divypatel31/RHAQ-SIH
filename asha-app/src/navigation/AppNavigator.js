import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { COLORS } from "../config";

import WelcomeScreen from "../screens/WelcomeScreen";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import RegisterPatientScreen from "../screens/RegisterPatientScreen";
import CreateReferralScreen from "../screens/CreateReferralScreen";
import HighRiskScreen from "../screens/HighRiskScreen";
import SyncStatusScreen from "../screens/SyncStatusScreen";

const Stack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: COLORS.primary },
  headerTintColor: COLORS.white,
  headerTitleStyle: { fontWeight: "700" },
};

export default function AppNavigator() {
  const { t } = useTranslation();
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={screenOptions}>
        {!user ? (
          <>
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: t("app.name") }} />
            <Stack.Screen name="RegisterPatient" component={RegisterPatientScreen} options={{ title: t("registerPatient.title") }} />
            <Stack.Screen name="CreateReferral" component={CreateReferralScreen} options={{ title: t("referral.title") }} />
            <Stack.Screen name="HighRisk" component={HighRiskScreen} options={{ title: t("highRisk.title") }} />
            <Stack.Screen name="SyncStatus" component={SyncStatusScreen} options={{ title: t("sync.title") }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
