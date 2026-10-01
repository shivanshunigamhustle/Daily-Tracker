import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from "@expo-google-fonts/inter";
import { ToastProvider } from "./src/components/Toast";
import { AuthProvider } from "./src/auth/AuthContext";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { LoadingSpinner } from "./src/components/LoadingSpinner";

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <SafeAreaProvider>
        <LoadingSpinner />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ToastProvider>
        <AuthProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </AuthProvider>
      </ToastProvider>
    </SafeAreaProvider>
  );
}
