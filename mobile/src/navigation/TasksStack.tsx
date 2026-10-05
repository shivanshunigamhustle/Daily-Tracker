import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { TasksScreen } from "../screens/TasksScreen";
import { AddTaskScreen } from "../screens/AddTaskScreen";

const Stack = createNativeStackNavigator();

export function TasksStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TasksList" component={TasksScreen} />
      <Stack.Screen name="AddTask" component={AddTaskScreen} />
    </Stack.Navigator>
  );
}
