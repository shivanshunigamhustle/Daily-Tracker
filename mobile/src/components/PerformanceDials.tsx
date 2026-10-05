import React from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "./Card";
import { RadialGauge } from "./RadialGauge";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";

interface PerformanceDialsProps {
  team: { totalEmployees: number; present: number; updatesPending: number };
  tasks: { total: number; completed: number; inProgress: number; blocked: number };
}

function pct(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

export function PerformanceDials({ team, tasks }: PerformanceDialsProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.row}>
        <RadialGauge
          value={pct(team.present, team.totalEmployees)}
          label="Attendance"
          caption={`${team.present} of ${team.totalEmployees} in`}
          color={colors.success}
        />
        <RadialGauge
          value={pct(tasks.completed, tasks.total)}
          label="Completion"
          caption={`${tasks.completed} of ${tasks.total} done`}
          color={colors.primary}
        />
        <RadialGauge
          value={pct(tasks.inProgress, tasks.total)}
          label="In progress"
          caption={`${tasks.inProgress} active`}
          color={colors.warning}
        />
      </View>
      <View style={styles.row}>
        <RadialGauge
          value={pct(tasks.blocked, tasks.total)}
          label="Blocked"
          caption={`${tasks.blocked} need help`}
          color={colors.danger}
        />
        <RadialGauge
          value={pct(team.updatesPending, team.totalEmployees)}
          label="Awaiting review"
          caption={`${team.updatesPending} updates`}
          color={colors.info}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});
