import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { DailyUpdateScreen } from "../screens/DailyUpdateScreen";
import { ReviewsScreen } from "../screens/ReviewsScreen";
import { TeamScreen } from "../screens/TeamScreen";
import { EmployeesStack } from "./EmployeesStack";
import { DepartmentsStack } from "./DepartmentsStack";
import { TeamsStack } from "./TeamsStack";
import { TasksStack } from "./TasksStack";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { useExitConfirmation } from "../hooks/useExitConfirmation";
import { useReducedMotion } from "../theme/animation";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

const Tab = createBottomTabNavigator();

type IconName = keyof typeof Ionicons.glyphMap;

const ICONS: Record<string, IconName> = {
  Dashboard: "home",
  Employees: "people",
  Departments: "business",
  Teams: "git-network",
  Tasks: "checkbox",
  Update: "document-text",
  Reviews: "shield-checkmark",
  Team: "people-circle",
  Profile: "person-circle",
};

// Pushed "Add" screens hide the tab bar so they read as a focused sub-flow.
const HIDE_TAB_BAR_ON: Record<string, string> = {
  Employees: "AddEmployee",
  Departments: "AddDepartment",
  Teams: "AddTeam",
  Tasks: "AddTask",
};

function AnimatedTabIcon({ name, color, size, focused }: { name: IconName; color: string; size: number; focused: boolean }) {
  const reducedMotion = useReducedMotion();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reducedMotion) return;
    Animated.spring(scale, { toValue: focused ? 1.15 : 1, useNativeDriver: true, speed: 30, bounciness: 8 }).start();
  }, [focused, scale, reducedMotion]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

export function AppTabs() {
  const { user } = useAuth();
  const role = user?.role ?? "EMPLOYEE";
  const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
  const isManager = role === "MANAGER";
  const exit = useExitConfirmation();
  const insets = useSafeAreaInsets();

  const baseTabBarStyle = {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 56 + insets.bottom,
    paddingBottom: insets.bottom + spacing.xs,
    paddingTop: spacing.xs,
  };

  function tabBarStyleFor(tabName: keyof typeof HIDE_TAB_BAR_ON) {
    return ({ route }: { route: RouteProp<any> }) => {
      const focusedRoute = getFocusedRouteNameFromRoute(route);
      return focusedRoute === HIDE_TAB_BAR_ON[tabName] ? { display: "none" as const } : baseTabBarStyle;
    };
  }

  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedTabIcon name={ICONS[route.name] ?? "ellipse"} color={color} size={size} focused={focused} />
          ),
          tabBarStyle: baseTabBarStyle,
          tabBarLabelStyle: {
            fontFamily: fontFamily.semibold,
            fontSize: 11,
          },
          tabBarItemStyle: {
            paddingVertical: spacing.xs,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />

        {isAdmin && <Tab.Screen name="Employees" component={EmployeesStack} options={({ route }) => ({ tabBarStyle: tabBarStyleFor("Employees")({ route }) })} />}
        {isAdmin && <Tab.Screen name="Departments" component={DepartmentsStack} options={({ route }) => ({ tabBarStyle: tabBarStyleFor("Departments")({ route }) })} />}
        {isAdmin && <Tab.Screen name="Teams" component={TeamsStack} options={({ route }) => ({ tabBarStyle: tabBarStyleFor("Teams")({ route }) })} />}

        {isManager && <Tab.Screen name="Team" component={TeamScreen} />}
        {(isManager || role === "EMPLOYEE") && (
          <Tab.Screen
            name="Tasks"
            component={TasksStack}
            options={({ route }) => ({ tabBarStyle: tabBarStyleFor("Tasks")({ route }) })}
          />
        )}
        {role === "EMPLOYEE" && <Tab.Screen name="Update" component={DailyUpdateScreen} options={{ title: "Daily" }} />}
        {isManager && <Tab.Screen name="Reviews" component={ReviewsScreen} />}

        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      <ConfirmationDialog
        visible={exit.visible}
        title="Exit Application?"
        message="Are you sure you want to exit?"
        confirmLabel="Exit"
        cancelLabel="Cancel"
        onConfirm={exit.confirmExit}
        onCancel={exit.cancelExit}
      />
    </>
  );
}
