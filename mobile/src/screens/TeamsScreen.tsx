import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as teamsApi from "../api/teams";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
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
import { Team } from "../types";

export function TeamsScreen() {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<Team | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      const data = await teamsApi.listTeams();
      setTeams(data);
    } catch (err) {
      setLoadError(getErrorMessage(err, "We couldn't load teams."));
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
      await teamsApi.deleteTeam(pendingDelete.id);
      setPendingDelete(null);
      await load();
      toast.show("success", "Team deleted");
    } catch (err) {
      toast.show("error", getErrorMessage(err, "Could not delete team"));
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <View style={styles.listContent}>
          <ScreenHeader title="Teams" />
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
        data={teams}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenHeader title="Teams" />
            <Button title="+ Add Team" variant="secondary" onPress={() => navigation.navigate("AddTeam")} />
          </View>
        }
        ListEmptyComponent={
          loadError ? (
            <ErrorState message={loadError} onRetry={load} />
          ) : (
            <EmptyState title="No teams yet" subtitle="Add your first team above." />
          )
        }
        renderItem={({ item, index }) => (
          <AnimatedEntrance index={index}>
            <Card style={styles.row}>
              <View style={styles.rowContent}>
                <Text style={styles.rowTitle}>{item.name}</Text>
                <Text style={styles.rowSubtitle}>
                  {item.department?.name ?? "—"} · {item._count?.members ?? 0} members
                  {item.manager ? ` · Manager: ${item.manager.fullName}` : ""}
                </Text>
              </View>
              <PressableScale
                onPress={() => setPendingDelete(item)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${item.name}`}
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
        title={`Delete ${pendingDelete?.name ?? "team"}?`}
        message="This cannot be undone. Members assigned to this team will be affected."
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
