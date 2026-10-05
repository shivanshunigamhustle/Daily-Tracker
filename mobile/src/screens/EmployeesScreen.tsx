import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as employeesApi from "../api/employees";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Avatar } from "../components/Avatar";
import { StatusChip } from "../components/Chip";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { AnimatedEntrance } from "../components/AnimatedEntrance";
import { SkeletonListRow } from "../components/Skeleton";
import { PressableScale } from "../components/PressableScale";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../utils/errorMessage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { Employee } from "../types";

export function EmployeesScreen() {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await employeesApi.listEmployees();
      setEmployees(data);
    } catch (err) {
      setLoadError(getErrorMessage(err, "We couldn't load employees."));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await employeesApi.deleteEmployee(pendingDelete.id);
      setPendingDelete(null);
      await load();
      toast.show("success", "Employee deleted");
    } catch (err) {
      toast.show("error", getErrorMessage(err, "Could not delete employee"));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.listContent}>
          <ScreenHeader title="Employees" />
          <SkeletonListRow />
          <SkeletonListRow />
          <SkeletonListRow />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <FlatList
        data={employees}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Employees" />
            <Button title="+ Add Employee" variant="secondary" onPress={() => navigation.navigate("AddEmployee")} />
          </View>
        }
        ListEmptyComponent={
          loadError ? (
            <ErrorState message={loadError} onRetry={load} />
          ) : (
            <EmptyState title="No employees yet" subtitle="Add your first employee above." />
          )
        }
        renderItem={({ item, index }) => (
          <AnimatedEntrance index={index}>
            <Card style={styles.row}>
              <Avatar name={item.fullName} />
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{item.fullName}</Text>
                <Text style={styles.rowSubtitle}>
                  {item.employeeCode}
                  {item.department ? ` · ${item.department.name}` : ""}
                  {item.team ? ` / ${item.team.name}` : ""}
                </Text>
                <View style={styles.chipLine}>
                  <StatusChip status={item.user.role.name} />
                  <StatusChip status={item.employmentStatus} />
                </View>
              </View>
              <PressableScale
                onPress={() => setPendingDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.fullName}`}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={18} color={colors.danger} />
              </PressableScale>
            </Card>
          </AnimatedEntrance>
        )}
      />

      <ConfirmationDialog
        visible={!!pendingDelete}
        title={`Delete ${pendingDelete?.fullName ?? "employee"}?`}
        message="This cannot be undone. The employee will lose access immediately."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.md,
  },
  row: {
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  chipLine: {
    flexDirection: "row",
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  rowSubtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  deleteButton: {
    padding: spacing.sm,
  },
});
