import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import * as api from "../api/workTracking";
import { Avatar } from "../components/Avatar";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Chip, StatusChip } from "../components/Chip";
import { EmptyState } from "../components/EmptyState";
import { ErrorState } from "../components/ErrorState";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { AnimatedEntrance } from "../components/AnimatedEntrance";
import { SkeletonListRow } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../utils/errorMessage";
import { colors } from "../theme/colors";
import { radius, shadow, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { DailyUpdate, DailyUpdateStatus } from "../types";

type Filter = "PENDING" | "ALL" | "APPROVED" | "NEEDS_CHANGES";

export function ReviewsScreen() {
  const toast = useToast();
  const [updates, setUpdates] = useState<DailyUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("PENDING");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [commenting, setCommenting] = useState<DailyUpdate | null>(null);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoadError(null);
      setUpdates(await api.getTeamUpdatesToday());
    } catch (err) {
      setLoadError(getErrorMessage(err, "We couldn't load today's updates."));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const visible = useMemo(() => {
    if (filter === "ALL") return updates;
    if (filter === "PENDING") return updates.filter((u) => u.status === "SUBMITTED");
    return updates.filter((u) => u.status === filter);
  }, [updates, filter]);

  async function review(update: DailyUpdate, decision: "APPROVED" | "NEEDS_CHANGES", note?: string) {
    setBusyId(update.id);
    try {
      const saved = await api.reviewDailyUpdate(update.id, { decision, comment: note });
      setUpdates((prev) => prev.map((u) => (u.id === saved.id ? { ...u, ...saved } : u)));
      toast.show("success", decision === "APPROVED" ? "Update approved" : "Feedback sent");
      setCommenting(null);
      setComment("");
    } catch (err) {
      toast.show("error", getErrorMessage(err, "Could not save your review"));
    } finally {
      setBusyId(null);
    }
  }

  function submitComment() {
    if (!commenting) return;
    if (comment.trim().length < 3) {
      setCommentError("Add a short note so they know what to change");
      return;
    }
    review(commenting, "NEEDS_CHANGES", comment.trim());
  }

  const counts = {
    PENDING: updates.filter((u) => u.status === "SUBMITTED").length,
    ALL: updates.length,
    APPROVED: updates.filter((u) => u.status === "APPROVED").length,
    NEEDS_CHANGES: updates.filter((u) => u.status === "NEEDS_CHANGES").length,
  };
  const FILTERS: { key: Filter; label: string }[] = [
    { key: "PENDING", label: "Awaiting" },
    { key: "APPROVED", label: "Approved" },
    { key: "NEEDS_CHANGES", label: "Changes" },
    { key: "ALL", label: "All" },
  ];

  const header = (
    <View style={styles.header}>
      <ScreenHeader
        title="Reviews"
        subtitle={`${counts.PENDING} waiting for your review today`}
        icon="shield-checkmark-outline"
      />
      <View style={styles.chipRow}>
        {FILTERS.map((f) => (
          <Chip key={f.key} label={`${f.label} · ${counts[f.key]}`} selected={filter === f.key} onPress={() => setFilter(f.key)} />
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <Screen>
        <View style={styles.list}>
          <ScreenHeader title="Reviews" />
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
        keyExtractor={(u) => u.id}
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
              title={updates.length === 0 ? "No updates yet today" : "Nothing in this view"}
              subtitle={
                updates.length === 0
                  ? "Your team hasn't submitted today's updates yet."
                  : "Try another filter."
              }
            />
          )
        }
        renderItem={({ item, index }) => {
          const name = item.employee?.fullName ?? "Team member";
          const pending = item.status === "SUBMITTED";
          return (
            <AnimatedEntrance index={index}>
              <Card style={styles.card}>
                <View style={styles.personRow}>
                  <Avatar name={name} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{name}</Text>
                    <Text style={styles.designation}>{item.employee?.designation ?? "Team member"}</Text>
                  </View>
                  <StatusChip status={item.status} />
                </View>

                <Text style={styles.sectionLabel}>Today's work</Text>
                <Text style={styles.body}>{item.summary}</Text>
                {item.blockers ? (
                  <View style={styles.blockerBox}>
                    <Text style={styles.blockerText}>Blocker: {item.blockers}</Text>
                  </View>
                ) : null}
                {item.reviewComment ? (
                  <Text style={styles.feedback}>Your note: {item.reviewComment}</Text>
                ) : null}

                {pending ? (
                  <View style={styles.actions}>
                    <Button
                      title="Approve"
                      loading={busyId === item.id}
                      onPress={() => review(item, "APPROVED")}
                      style={styles.actionBtn}
                    />
                    <Button
                      title="Request changes"
                      variant="outline"
                      disabled={busyId === item.id}
                      onPress={() => {
                        setCommenting(item);
                        setComment("");
                        setCommentError(null);
                      }}
                      style={styles.actionBtn}
                    />
                  </View>
                ) : null}
              </Card>
            </AnimatedEntrance>
          );
        }}
      />

      <Modal visible={!!commenting} transparent animationType="fade" onRequestClose={() => setCommenting(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Request changes</Text>
            <Text style={styles.sheetSub}>
              {commenting?.employee?.fullName ?? "They"} will see this note and resubmit their update.
            </Text>
            <TextInput
              value={comment}
              onChangeText={(t) => {
                setComment(t);
                if (commentError) setCommentError(null);
              }}
              placeholder="e.g. Add the status of the login bug"
              placeholderTextColor={colors.textMuted}
              multiline
              style={styles.commentInput}
              autoFocus
            />
            {commentError ? <Text style={styles.error}>{commentError}</Text> : null}
            <View style={styles.sheetActions}>
              <Button title="Cancel" variant="ghost" onPress={() => setCommenting(null)} style={styles.actionBtn} />
              <Button title="Send" onPress={submitComment} loading={busyId === commenting?.id} style={styles.actionBtn} />
            </View>
          </View>
        </View>
      </Modal>
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
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  name: {
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  designation: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: spacing.xs,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  blockerBox: {
    marginTop: spacing.sm,
    backgroundColor: colors.dangerMuted,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  blockerText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.dangerDark,
  },
  feedback: {
    marginTop: spacing.sm,
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 42,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    ...shadow.elevation3,
  },
  sheetTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 18,
    color: colors.textPrimary,
  },
  sheetSub: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  commentInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginTop: spacing.sm,
  },
  sheetActions: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
