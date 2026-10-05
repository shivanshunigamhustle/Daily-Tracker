import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as api from "../api/workTracking";
import * as employeesApi from "../api/employees";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Chip } from "../components/Chip";
import { SkeletonBlock } from "../components/Skeleton";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { useToast } from "../components/Toast";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { getErrorMessage } from "../utils/errorMessage";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { Employee, TaskPriority } from "../types";

const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function AddTaskScreen() {
  const navigation = useNavigation();
  const toast = useToast();

  const [people, setPeople] = useState<Employee[] | null>(null);
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [assigneeError, setAssigneeError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      employeesApi.listEmployees().then(setPeople).catch(() => setPeople([]));
    }, [])
  );

  const guard = useUnsavedChangesGuard({
    navigation,
    isDirty: !!(title.trim() || description.trim() || assigneeId),
  });

  async function handleCreate() {
    let valid = true;
    if (!title.trim()) {
      setTitleError("Give the task a short title");
      valid = false;
    }
    if (!assigneeId) {
      setAssigneeError("Choose who this task is for");
      valid = false;
    }
    if (!valid) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await api.createTask({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        assigneeId: assigneeId!,
      });
      toast.show("success", "Task assigned");
      guard.allowNextNavigation();
      navigation.goBack();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not assign the task"));
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ScreenHeader title="Assign task" onBack={() => navigation.goBack()} />

        <Input
          label="Title"
          value={title}
          onChangeText={(t) => {
            setTitle(t);
            if (titleError) setTitleError(null);
          }}
          placeholder="e.g. Finish the login API"
          error={titleError ?? undefined}
          autoFocus
        />
        <Input
          label="Details (optional)"
          value={description}
          onChangeText={setDescription}
          placeholder="Acceptance criteria, links, context"
          multiline
          style={styles.multiline}
        />

        <Text style={styles.label}>Priority</Text>
        <View style={styles.chipRow}>
          {PRIORITIES.map((p) => (
            <Chip key={p} label={p} selected={priority === p} onPress={() => setPriority(p)} />
          ))}
        </View>

        <Text style={styles.label}>Assign to</Text>
        {people === null ? (
          <View style={styles.chipRow}>
            <SkeletonBlock width={96} height={32} radius={radius.full} />
            <SkeletonBlock width={120} height={32} radius={radius.full} />
            <SkeletonBlock width={84} height={32} radius={radius.full} />
          </View>
        ) : people.length === 0 ? (
          <Text style={styles.hint}>No team members found. Ask an admin to add people to your team first.</Text>
        ) : (
          <View style={styles.chipRow}>
            {people.map((p) => (
              <Chip
                key={p.id}
                label={p.fullName}
                selected={assigneeId === p.id}
                onPress={() => {
                  setAssigneeId(p.id);
                  setAssigneeError(null);
                }}
              />
            ))}
          </View>
        )}
        {assigneeError ? <Text style={styles.error}>{assigneeError}</Text> : null}
        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Button title="Assign task" onPress={handleCreate} loading={submitting} />
      </ScrollView>

      <ConfirmationDialog
        visible={guard.dialogVisible}
        title="Discard this task?"
        message="You have unsaved changes to this task."
        confirmLabel="Discard"
        destructive
        onConfirm={guard.confirmDiscard}
        onCancel={guard.cancelDiscard}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
  },
  multiline: {
    height: 96,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
