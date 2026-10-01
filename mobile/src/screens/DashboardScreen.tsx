import React, { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../auth/AuthContext";
import { fetchMyDashboard } from "../api/dashboard";
import { KpiCard } from "../components/KpiCard";
import { BarChart } from "../components/BarChart";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { SkeletonBlock } from "../components/Skeleton";
import { ErrorState } from "../components/ErrorState";
import { AnimatedEntrance } from "../components/AnimatedEntrance";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily, typography } from "../theme/typography";
import { getErrorMessage } from "../utils/errorMessage";
import { DashboardPayload } from "../types";

export function DashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const payload = await fetchMyDashboard();
      setData(payload);
    } catch (err) {
      setError(getErrorMessage(err, "We couldn't load your dashboard."));
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const firstName = user?.employee?.fullName?.split(" ")[0] ?? "there";

  if (loading) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title={`Good day, ${firstName}`} />
          <View style={styles.kpiGrid}>
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} width="47%" height={96} radius={16} />
            ))}
          </View>
        </ScrollView>
      </Screen>
    );
  }

  if (error && !data) {
    return (
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <ScreenHeader title={`Good day, ${firstName}`} />
          <ErrorState message={error} onRetry={load} />
        </ScrollView>
      </Screen>
    );
  }

  if (!data) return null;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
      <ScreenHeader
        title={`Good day, ${firstName}`}
        subtitle="Here's where things stand today"
        icon="stats-chart-outline"
      />

      {data.role === "EMPLOYEE" && (
        <>
          <Text style={styles.sectionTitle}>Today</Text>
          <View style={styles.kpiGrid}>
            <AnimatedEntrance index={0} style={styles.kpiItem}>
              <KpiCard icon="log-in-outline" label="Work Status" value={data.today.workStatus.replace(/_/g, " ")} />
            </AnimatedEntrance>
            <AnimatedEntrance index={1} style={styles.kpiItem}>
              <KpiCard
                icon="document-text-outline"
                label="Daily Update"
                value={data.today.dailyUpdateStatus.replace(/_/g, " ")}
                tone={data.today.dailyUpdateStatus === "SUBMITTED" ? "success" : "warning"}
              />
            </AnimatedEntrance>
            <AnimatedEntrance index={2} style={styles.kpiItem}>
              <KpiCard icon="time-outline" label="Login Time" value={data.today.loginTime ?? "—"} />
            </AnimatedEntrance>
            <AnimatedEntrance index={3} style={styles.kpiItem}>
              <KpiCard icon="hourglass-outline" label="Working Time" value={data.today.workingTime ?? "—"} />
            </AnimatedEntrance>
          </View>

          <Text style={styles.sectionTitle}>Tasks</Text>
          <View style={styles.kpiGrid}>
            <AnimatedEntrance index={4} style={styles.kpiItem}>
              <KpiCard icon="list-outline" label="Total" value={data.tasks.total} />
            </AnimatedEntrance>
            <AnimatedEntrance index={5} style={styles.kpiItem}>
              <KpiCard icon="checkmark-done-outline" label="Completed" value={data.tasks.completed} tone="success" />
            </AnimatedEntrance>
            <AnimatedEntrance index={6} style={styles.kpiItem}>
              <KpiCard icon="sync-outline" label="In Progress" value={data.tasks.inProgress} tone="warning" />
            </AnimatedEntrance>
          </View>

          <Text style={styles.sectionTitle}>Analytics</Text>
          <BarChart
            title="Task Breakdown"
            data={[
              { label: "Completed", value: data.tasks.completed, color: colors.success },
              { label: "In Progress", value: data.tasks.inProgress, color: colors.warning },
              { label: "Total", value: data.tasks.total, color: colors.primary },
            ]}
          />
        </>
      )}

      {data.role === "MANAGER" && (
        <>
          <Text style={styles.sectionTitle}>Team Overview</Text>
          <View style={styles.kpiGrid}>
            <AnimatedEntrance index={0} style={styles.kpiItem}>
              <KpiCard icon="people-outline" label="Total Employees" value={data.team.totalEmployees} />
            </AnimatedEntrance>
            <AnimatedEntrance index={1} style={styles.kpiItem}>
              <KpiCard icon="checkmark-circle-outline" label="Present" value={data.team.present} tone="success" />
            </AnimatedEntrance>
            <AnimatedEntrance index={2} style={styles.kpiItem}>
              <KpiCard icon="close-circle-outline" label="Absent" value={data.team.absent} tone="danger" />
            </AnimatedEntrance>
            <AnimatedEntrance index={3} style={styles.kpiItem}>
              <KpiCard icon="airplane-outline" label="On Leave" value={data.team.onLeave} tone="warning" />
            </AnimatedEntrance>
            <AnimatedEntrance index={4} style={styles.kpiItem}>
              <KpiCard icon="alert-circle-outline" label="Updates Pending" value={data.team.updatesPending} tone="warning" />
            </AnimatedEntrance>
          </View>

          <Text style={styles.sectionTitle}>Analytics</Text>
          <BarChart
            title="Attendance Breakdown"
            data={[
              { label: "Present", value: data.team.present, color: colors.success },
              { label: "Absent", value: data.team.absent, color: colors.danger },
              { label: "On Leave", value: data.team.onLeave, color: colors.warning },
            ]}
          />
        </>
      )}

      {(data.role === "ADMIN" || data.role === "SUPER_ADMIN") && (
        <>
          <Text style={styles.sectionTitle}>Organization Overview</Text>
          <View style={styles.kpiGrid}>
            <AnimatedEntrance index={0} style={styles.kpiItem}>
              <KpiCard icon="people-outline" label="Total Employees" value={data.organization.totalEmployees} />
            </AnimatedEntrance>
            <AnimatedEntrance index={1} style={styles.kpiItem}>
              <KpiCard icon="business-outline" label="Departments" value={data.organization.totalDepartments} />
            </AnimatedEntrance>
            <AnimatedEntrance index={2} style={styles.kpiItem}>
              <KpiCard icon="git-network-outline" label="Teams" value={data.organization.totalTeams} />
            </AnimatedEntrance>
          </View>

          <Text style={styles.sectionTitle}>Analytics</Text>
          <BarChart
            title="Organization Composition"
            data={[
              { label: "Employees", value: data.organization.totalEmployees, color: colors.primary },
              { label: "Departments", value: data.organization.totalDepartments, color: colors.info },
              { label: "Teams", value: data.organization.totalTeams, color: colors.secondary },
            ]}
          />
        </>
      )}

      <View style={styles.footnote}>
        <Text style={styles.footnoteText}>
          Attendance, tasks, and daily updates will populate here starting Phase 2.
        </Text>
      </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.overline,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  kpiItem: {
    flexBasis: "47%",
    flexGrow: 1,
  },
  footnote: {
    paddingVertical: spacing.lg,
  },
  footnoteText: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
  },
});
