import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TeamsScreen } from "../screens/TeamsScreen";
import { AddTeamScreen } from "../screens/AddTeamScreen";

const Stack = createNativeStackNavigator();

export function TeamsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeamsList" component={TeamsScreen} />
      <Stack.Screen name="AddTeam" component={AddTeamScreen} />
    </Stack.Navigator>
  );
}
