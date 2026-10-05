import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as api from "../api/workTracking";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { StatusChip } from "../components/Chip";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { SkeletonListRow } from "../components/Skeleton";
import { useToast } from "../components/Toast";
import { getErrorMessage } from "../utils/errorMessage";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { DailyUpdate } from "../types";

const MIN_SUMMARY = 10;

export function DailyUpdateScreen() {
  const toast = useToast();
  const [today, setToday] = useState<DailyUpdate | null | undefined>(undefined);
  const [summary, setSummary] = useState("");
  const [blockers, setBlockers] = useState("");
  const [tomorrowPlan, setTomorrowPlan] = useState("");
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      api
        .getMyTodayUpdate()
        .then((u) => {
          setToday(u);
          // Prefill the form only when the employee must revise it.
          if (u?.status === "NEEDS_CHANGES") {
            setSummary(u.summary);
            setBlockers(u.blockers ?? "");
            setTomorrowPlan(u.tomorrowPlan ?? "");
          }
        })
        .catch(() => setToday(null));
    }, [])
  );

  const canEdit = today === null || today?.status === "NEEDS_CHANGES";
  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });

  async function submit() {
    if (summary.trim().length < MIN_SUMMARY) {
      setSummaryError(`Describe today's work in at least ${MIN_SUMMARY} characters`);
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const saved = await api.submitDailyUpdate({
        summary: summary.trim(),
        blockers: blockers.trim() || undefined,
        tomorrowPlan: tomorrowPlan.trim() || undefined,
      });
      setToday(saved);
      toast.show("success", "Daily update submitted");
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not submit your update"));
    } finally {
      setSubmitting(false);
    }
  }

  if (today === undefined) {
    return (
      <Screen>
        <View style={styles.pad}>
          <ScreenHeader title="Daily update" />
          <SkeletonListRow />
          <SkeletonListRow />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Daily update" subtitle={todayLabel} icon="document-text-outline" />

        {today && today.status !== "NEEDS_CHANGES" ? (
          <Card style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Ionicons
                name={today.status === "APPROVED" ? "checkmark-circle" : "time-outline"}
                size={22}
                color={today.status === "APPROVED" ? colors.success : colors.warning}
              />
              <Text style={styles.statusTitle}>
                {today.status === "APPROVED" ? "Approved by your manager" : "Submitted — awaiting review"}
              </Text>
              <StatusChip status={today.status} />
            </View>
            <Text style={styles.label}>Today's work</Text>
            <Text style={styles.body}>{today.summary}</Text>
            {today.blockers ? (
              <>
                <Text style={styles.label}>Blockers</Text>
                <Text style={styles.body}>{today.blockers}</Text>
              </>
            ) : null}
            {today.tomorrowPlan ? (
              <>
                <Text style={styles.label}>Tomorrow</Text>
                <Text style={styles.body}>{today.tomorrowPlan}</Text>
              </>
            ) : null}
          </Card>
        ) : null}

        {today?.status === "NEEDS_CHANGES" && today.reviewComment ? (
          <View style={styles.feedback}>
            <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.warningDark} />
            <View style={{ flex: 1 }}>
              <Text style={styles.feedbackTitle}>Your manager asked for changes</Text>
              <Text style={styles.feedbackBody}>{today.reviewComment}</Text>
            </View>
          </View>
        ) : null}

        {canEdit ? (
          <Card>
            <Input
              label="What did you work on today?"
              value={summary}
              onChangeText={(t) => {
                setSummary(t);
                if (summaryError) setSummaryError(null);
              }}
              placeholder="Summarise your progress in a few sentences"
              error={summaryError ?? undefined}
              multiline
              style={styles.multiline}
            />
            <Input
              label="Blockers (optional)"
              value={blockers}
              onChangeText={setBlockers}
              placeholder="Anything holding you back?"
              multiline
              style={styles.multilineSmall}
            />
            <Input
              label="Plan for tomorrow (optional)"
              value={tomorrowPlan}
              onChangeText={setTomorrowPlan}
              placeholder="What's next?"
              multiline
              style={styles.multilineSmall}
            />
            {formError ? <Text style={styles.error}>{formError}</Text> : null}
            <Button
              title={today?.status === "NEEDS_CHANGES" ? "Resubmit update" : "Submit update"}
              onPress={submit}
              loading={submitting}
              disabled={summary.trim().length < MIN_SUMMARY}
            />
            <Text style={styles.hint}>Submitting takes under a minute. Your manager reviews it after.</Text>
          </Card>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pad: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statusTitle: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  body: {
    fontFamily: fontFamily.regular,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textPrimary,
  },
  feedback: {
    flexDirection: "row",
    gap: spacing.sm,
    backgroundColor: colors.warningMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  feedbackTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 14,
    color: colors.warningDark,
  },
  feedbackBody: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 2,
  },
  multiline: {
    height: 120,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  multilineSmall: {
    height: 80,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    marginTop: spacing.md,
  },
});
