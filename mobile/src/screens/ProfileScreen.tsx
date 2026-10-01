import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../components/Card";
import { StatRow } from "../components/StatRow";
import { Button } from "../components/Button";
import { StatusChip } from "../components/Chip";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const [confirmingLogout, setConfirmingLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleConfirmLogout() {
    setLoggingOut(true);
    try {
      await logout();
    } finally {
      setLoggingOut(false);
      setConfirmingLogout(false);
    }
  }

  return (
    <Screen>
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader title="Profile" />

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{(user?.employee?.fullName ?? user?.email ?? "?").charAt(0).toUpperCase()}</Text>
      </View>
      <Text style={styles.name}>{user?.employee?.fullName ?? user?.email}</Text>
      {user?.role ? (
        <View style={styles.roleChip}>
          <StatusChip status={user.role} />
        </View>
      ) : null}

      <Card style={styles.card}>
        <StatRow label="Email" value={user?.email ?? "—"} />
        <StatRow label="Employee Code" value={user?.employee?.employeeCode ?? "—"} />
        <StatRow label="Designation" value={user?.employee?.designation ?? "—"} />
        <StatRow label="Work Mode" value={user?.employee?.workMode ?? "—"} />
      </Card>

      <Button title="Log Out" variant="secondary" onPress={() => setConfirmingLogout(true)} style={styles.logoutButton} />

      <ConfirmationDialog
        visible={confirmingLogout}
        title="Log Out?"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        destructive
        loading={loggingOut}
        onConfirm={handleConfirmLogout}
        onCancel={() => setConfirmingLogout(false)}
      />
    </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.lg,
  },
  avatarText: {
    fontFamily: fontFamily.bold,
    fontSize: 28,
    color: colors.primary,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  roleChip: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  card: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  logoutButton: {
    width: "100%",
  },
});
