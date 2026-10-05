import React, { useCallback, useMemo, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as api from "../api/workTracking";
import { Avatar } from "../components/Avatar";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { KpiCard } from "../components/KpiCard";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { AnimatedEntrance } from "../components/AnimatedEntrance";
import { SkeletonListRow } from "../components/Skeleton";
import { getErrorMessage } from "../utils/errorMessage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { TeamAttendanceRow } from "../types";

type Filter = "ALL" | "IN" | "OUT";

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export function TeamScreen() {
  const [rows, setRows] = useState<TeamAttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("ALL");

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      setRows(await api.getTeamAttendanceToday());
    } catch (err) {
      setLoadError(getErrorMessage(err, "We couldn't load your team."));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const checkedIn = rows.filter((r) => r.attendance).length;
  const visible = useMemo(() => {
    if (filter === "IN") return rows.filter((r) => r.attendance);
    if (filter === "OUT") return rows.filter((r) => !r.attendance);
    return rows;
  }, [rows, filter]);

  const header = (
    <View style={styles.header}>
      <ScreenHeader title="My team" subtitle="Who's in today" icon="people-outline" />
      <View style={styles.kpiRow}>
        <View style={styles.kpi}>
          <KpiCard icon="people-outline" label="Members" value={rows.length} />
        </View>
        <View style={styles.kpi}>
          <KpiCard icon="checkmark-circle-outline" label="Checked in" value={checkedIn} tone="success" />
        </View>
        <View style={styles.kpi}>
          <KpiCard icon="close-circle-outline" label="Not in" value={rows.length - checkedIn} tone="danger" />
        </View>
      </View>
      <View style={styles.chipRow}>
        <Chip label={`All · ${rows.length}`} selected={filter === "ALL"} onPress={() => setFilter("ALL")} />
        <Chip label={`In · ${checkedIn}`} selected={filter === "IN"} onPress={() => setFilter("IN")} />
        <Chip label={`Not in · ${rows.length - checkedIn}`} selected={filter === "OUT"} onPress={() => setFilter("OUT")} />
      </View>
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.list}>
          <ScreenHeader title="My team" />
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
        keyExtractor={(r) => r.employeeId}
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
            <EmptyState title="No team members" subtitle="Team members appear here once they're assigned to your team." />
          )
        }
        renderItem={({ item, index }) => {
          const present = !!item.attendance;
          return (
            <AnimatedEntrance index={index}>
              <Card style={styles.row}>
                <Avatar name={item.fullName} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.fullName}</Text>
                  <Text style={styles.sub}>
                    {item.designation ?? "Team member"}
                    {item.teamName ? ` · ${item.teamName}` : ""}
                  </Text>
                </View>
                <View style={styles.right}>
                  <Chip label={present ? "Checked in" : "Not in"} variant={present ? "success" : "default"} selected={present} />
                  <Text style={styles.time}>
                    {present
                      ? `In ${timeOf(item.attendance!.checkInAt)}${item.attendance!.checkOutAt ? " · out" : ""}`
                      : "Not checked in"}
                  </Text>
                </View>
              </Card>
            </AnimatedEntrance>
          );
        }}
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
  kpiRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  kpi: {
    flex: 1,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  sub: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  time: {
    fontFamily: fontFamily.medium,
    fontSize: 11,
    color: colors.textMuted,
  },
});
