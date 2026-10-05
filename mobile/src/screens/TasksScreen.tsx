import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as api from "../api/workTracking";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Chip, StatusChip } from "../components/Chip";
import { PressableScale } from "../components/PressableScale";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { AnimatedEntrance } from "../components/AnimatedEntrance";
import { SkeletonListRow } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../utils/errorMessage";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { Task, TaskPriority, TaskStatus } from "../types";

type Filter = "ALL" | "OPEN" | "IN_PROGRESS" | "BLOCKED" | "DONE";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "BLOCKED", label: "Blocked" },
  { key: "DONE", label: "Done" },
];

const PRIORITY_VARIANT: Record<TaskPriority, "default" | "info" | "warning" | "danger"> = {
  LOW: "default",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "danger",
};

function matches(task: Task, filter: Filter): boolean {
  switch (filter) {
    case "ALL":
      return true;
    case "OPEN":
      return task.status === "NOT_STARTED";
    case "IN_PROGRESS":
      return task.status === "IN_PROGRESS";
    case "BLOCKED":
      return task.status === "BLOCKED";
    case "DONE":
      return task.status === "COMPLETED";
  }
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${Math.min(100, Math.max(0, value))}%` }]} />
    </View>
  );
}

export function TasksScreen() {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const { user } = useAuth();
  const isManager = user?.role !== "EMPLOYEE";

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      setTasks(await api.listTasks());
    } catch (err) {
      setLoadError(getErrorMessage(err, "We couldn't load tasks."));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = useMemo(() => tasks.filter((t) => matches(t, filter)), [tasks, filter]);
  const counts = useMemo(() => {
    const byFilter = {} as Record<Filter, number>;
    FILTERS.forEach((f) => (byFilter[f.key] = tasks.filter((t) => matches(t, f.key)).length));
    return byFilter;
  }, [tasks]);

  async function setStatus(task: Task, status: TaskStatus) {
    setBusyId(task.id);
    try {
      const updated = await api.updateTask(task.id, { status });
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      toast.show("success", status === "COMPLETED" ? "Nice work, task completed" : "Task updated");
    } catch (err) {
      toast.show("error", getErrorMessage(err, "Could not update the task"));
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await api.deleteTask(pendingDelete.id);
      setPendingDelete(null);
      await load();
      toast.show("success", "Task deleted");
    } catch (err) {
      toast.show("error", getErrorMessage(err, "Could not delete the task"));
    } finally {
      setDeleting(false);
    }
  }

  function actionsFor(task: Task) {
    const busy = busyId === task.id;
    switch (task.status) {
      case "NOT_STARTED":
        return (
          <View style={styles.actions}>
            <Button title="Start" variant="secondary" loading={busy} onPress={() => setStatus(task, "IN_PROGRESS")} style={styles.actionBtn} />
          </View>
        );
      case "IN_PROGRESS":
        return (
          <View style={styles.actions}>
            <Button title="Mark done" loading={busy} onPress={() => setStatus(task, "COMPLETED")} style={styles.actionBtn} />
            <Button title="Blocked" variant="outline" disabled={busy} onPress={() => setStatus(task, "BLOCKED")} style={styles.actionBtn} />
          </View>
        );
      case "BLOCKED":
        return (
          <View style={styles.actions}>
            <Button title="Resume" variant="secondary" loading={busy} onPress={() => setStatus(task, "IN_PROGRESS")} style={styles.actionBtn} />
          </View>
        );
      case "COMPLETED":
        return (
          <View style={styles.actions}>
            <Button title="Reopen" variant="outline" loading={busy} onPress={() => setStatus(task, "IN_PROGRESS")} style={styles.actionBtn} />
          </View>
        );
      default:
        return null;
    }
  }

  const header = (
    <View style={styles.header}>
      <ScreenHeader
        title="Tasks"
        subtitle={isManager ? "Track and assign your team's work" : "Your assignments for today"}
        icon="checkbox-outline"
        rightElement={
          isManager ? (
            <Button title="+ Assign" variant="secondary" onPress={() => navigation.navigate("AddTask")} style={styles.assignBtn} />
          ) : undefined
        }
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={`${f.label} · ${counts[f.key]}`}
            selected={filter === f.key}
            onPress={() => setFilter(f.key)}
          />
        ))}
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.list}>
          <ScreenHeader title="Tasks" />
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
        data={visible}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListHeaderComponent={header}
        ListEmptyComponent={
          loadError ? (
            <ErrorState message={loadError} onRetry={load} />
          ) : (
            <EmptyState
              title={tasks.length === 0 ? "No tasks yet" : "Nothing in this view"}
              subtitle={
                tasks.length === 0
                  ? isManager
                    ? "Tap + Assign to give your team something to work on."
                    : "You're all caught up. Your manager hasn't assigned anything yet."
                  : "Try a different filter."
              }
            />
          )
        }
        renderItem={({ item, index }) => (
          <AnimatedEntrance index={index}>
            <Card style={styles.card}>
              <View style={styles.cardTop}>
                <Chip label={item.priority} variant={PRIORITY_VARIANT[item.priority]} selected />
                <View style={{ flex: 1 }} />
                <StatusChip status={item.status} />
                {isManager ? (
                  <PressableScale
                    onPress={() => setPendingDelete(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${item.title}`}
                    hitSlop={8}
                    style={styles.trash}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </PressableScale>
                ) : null}
              </View>
              <Text style={styles.title}>{item.title}</Text>
              {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
              <View style={styles.meta}>
                <Ionicons name="person-outline" size={13} color={colors.textMuted} />
                <Text style={styles.metaText}>
                  {isManager ? item.assignee.fullName : "Assigned to you"}
                  {item.assignedBy ? ` · by ${item.assignedBy.fullName}` : ""}
                </Text>
                <Text style={styles.percent}>{item.completion}%</Text>
              </View>
              <ProgressBar value={item.completion} />
              {actionsFor(item)}
            </Card>
          </AnimatedEntrance>
        )}
      />

      <ConfirmationDialog
        visible={!!pendingDelete}
        title="Delete task?"
        message={`"${pendingDelete?.title ?? ""}" will be removed for everyone. This cannot be undone.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    marginBottom: spacing.sm,
  },
  assignBtn: {
    height: 38,
    paddingHorizontal: spacing.md,
  },
  filterRow: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  trash: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
  },
  percent: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  track: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 40,
  },
});
