import React, { useEffect, useRef } from "react";
import { Animated, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute, RouteProp } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { EmployeesStack } from "./EmployeesStack";
import { DepartmentsStack } from "./DepartmentsStack";
import { TeamsStack } from "./TeamsStack";
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
  Profile: "person-circle",
};

// Routes inside each nested stack where the tab bar should hide, so pushed
// "Add" screens feel like a focused sub-flow rather than just another tab.
const HIDE_TAB_BAR_ON: Record<string, string> = {
  Employees: "AddEmployee",
  Departments: "AddDepartment",
  Teams: "AddTeam",
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
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
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
      const hidden = focusedRoute === HIDE_TAB_BAR_ON[tabName];
      return hidden ? { display: "none" as const } : baseTabBarStyle;
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
            <AnimatedTabIcon name={ICONS[route.name]} color={color} size={size} focused={focused} />
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
        {isAdmin && (
          <Tab.Screen name="Employees" component={EmployeesStack} options={({ route }) => ({ tabBarStyle: tabBarStyleFor("Employees")({ route }) })} />
        )}
        {isAdmin && (
          <Tab.Screen
            name="Departments"
            component={DepartmentsStack}
            options={({ route }) => ({ tabBarStyle: tabBarStyleFor("Departments")({ route }) })}
          />
        )}
        {isAdmin && (
          <Tab.Screen name="Teams" component={TeamsStack} options={({ route }) => ({ tabBarStyle: tabBarStyleFor("Teams")({ route }) })} />
        )}
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
