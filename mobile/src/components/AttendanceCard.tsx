import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { Button } from "./Button";
import { StatusChip } from "./Chip";
import { useToast } from "./Toast";
import * as api from "../api/workTracking";
import { getErrorMessage } from "../utils/errorMessage";
import { AttendanceRecord } from "../types";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function elapsed(from: string, to: Date): string {
  const minutes = Math.max(0, Math.floor((to.getTime() - new Date(from).getTime()) / 60000));
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m`;
}

export function AttendanceCard({ onChanged, refreshKey = 0 }: { onChanged?: () => void; refreshKey?: number }) {
  const toast = useToast();
  const [record, setRecord] = useState<AttendanceRecord | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    api.getTodayAttendance().then(setRecord).catch(() => setRecord(null));
  }, [refreshKey]);

  useEffect(() => {
    if (!record || record.checkOutAt) return;
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, [record]);

  async function run(action: () => Promise<AttendanceRecord>, success: string) {
    setBusy(true);
    try {
      setRecord(await action());
      toast.show("success", success);
      onChanged?.();
    } catch (err) {
      toast.show("error", getErrorMessage(err, "Could not update attendance"));
    } finally {
      setBusy(false);
    }
  }

  const status = record === undefined ? "LOADING" : !record ? "NOT_STARTED" : record.checkOutAt ? "ENDED" : "WORKING";
  const statusLabel = {
    LOADING: "Checking today's status…",
    NOT_STARTED: "Not checked in",
    WORKING: "Working",
    ENDED: "Day ended",
  }[status];
  const statusTone =
    status === "WORKING" ? colors.success : status === "ENDED" || status === "LOADING" ? colors.textMuted : colors.warning;

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={[styles.dot, { backgroundColor: statusTone }]} />
        <Text style={styles.statusText}>{statusLabel}</Text>
        {record ? <StatusChip status={record.workMode} /> : null}
      </View>

      <View style={styles.timeRow}>
        <View style={styles.timeCell}>
          <Text style={styles.timeLabel}>Check in</Text>
          <Text style={styles.timeValue}>{record ? formatTime(record.checkInAt) : "—"}</Text>
        </View>
        <View style={styles.timeCell}>
          <Text style={styles.timeLabel}>Check out</Text>
          <Text style={styles.timeValue}>{record?.checkOutAt ? formatTime(record.checkOutAt) : "—"}</Text>
        </View>
        <View style={styles.timeCell}>
          <Text style={styles.timeLabel}>Duration</Text>
          <Text style={styles.timeValue}>
            {record ? elapsed(record.checkInAt, record.checkOutAt ? new Date(record.checkOutAt) : now) : "—"}
          </Text>
        </View>
      </View>

      {record === undefined ? null : !record ? (
        <Button
          title="Check in"
          loading={busy}
          onPress={() => run(() => api.checkIn("OFFICE"), "Checked in. Have a productive day!")}
          style={styles.action}
        />
      ) : !record.checkOutAt ? (
        <Button
          title="Check out"
          variant="outline"
          loading={busy}
          onPress={() => run(api.checkOut, "Checked out. Good work today!")}
          style={styles.action}
        />
      ) : (
        <View style={styles.doneRow}>
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.doneText}>See you tomorrow</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  timeRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeCell: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  timeLabel: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
  },
  timeValue: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
    marginTop: 2,
  },
  action: {
    width: "100%",
  },
  doneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  doneText: {
    fontFamily: fontFamily.medium,
    fontSize: 14,
    color: colors.textSecondary,
  },
});
