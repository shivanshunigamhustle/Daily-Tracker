import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../auth/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AuthStack } from "./AuthStack";
import { AppTabs } from "./AppTabs";

export function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  return <NavigationContainer>{user ? <AppTabs /> : <AuthStack />}</NavigationContainer>;
}
