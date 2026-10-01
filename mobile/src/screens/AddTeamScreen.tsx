import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as teamsApi from "../api/teams";
import * as departmentsApi from "../api/departments";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Chip } from "../components/Chip";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { useToast } from "../components/Toast";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { getErrorMessage } from "../utils/errorMessage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { Department } from "../types";

export function AddTeamScreen() {
  const navigation = useNavigation();
  const toast = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [departmentError, setDepartmentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      departmentsApi.listDepartments().then(setDepartments).catch(() => {});
    }, [])
  );

  const guard = useUnsavedChangesGuard({ navigation, isDirty: name.trim().length > 0 || !!departmentId });

  async function handleCreate() {
    const trimmed = name.trim();
    let valid = true;
    if (!trimmed) {
      setNameError("Team name is required");
      valid = false;
    }
    if (!departmentId) {
      setDepartmentError("Select a department");
      valid = false;
    }
    if (!valid) return;

    setFormError(null);
    setSubmitting(true);
    try {
      await teamsApi.createTeam({ name: trimmed, departmentId: departmentId! });
      toast.show("success", "Team created successfully");
      guard.allowNextNavigation();
      navigation.goBack();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not create team"));
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="New Team" onBack={() => navigation.goBack()} />
        <Input
          label="Team Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) setNameError(null);
          }}
          placeholder="e.g. Team A"
          error={nameError ?? undefined}
          autoFocus
        />
        <Text style={styles.label}>Department</Text>
        <View style={styles.chipRow}>
          {departments.map((dept) => (
            <Chip
              key={dept.id}
              label={dept.name}
              selected={departmentId === dept.id}
              onPress={() => {
                setDepartmentId(dept.id);
                setDepartmentError(null);
              }}
            />
          ))}
        </View>
        {departmentError ? <Text style={styles.error}>{departmentError}</Text> : null}
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <Button title="Create Team" onPress={handleCreate} loading={submitting} />
      </ScrollView>

      <ConfirmationDialog
        visible={guard.dialogVisible}
        title="Discard changes?"
        message="You have an unsaved team. Are you sure you want to discard it?"
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
    marginBottom: spacing.sm,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
