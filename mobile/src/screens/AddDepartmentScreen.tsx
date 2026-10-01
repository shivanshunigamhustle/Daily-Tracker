import React, { useState } from "react";
import { ScrollView, StyleSheet, Text } from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as departmentsApi from "../api/departments";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Screen } from "../components/Screen";
import { ScreenHeader } from "../components/ScreenHeader";
import { ConfirmationDialog } from "../components/ConfirmationDialog";
import { useToast } from "../components/Toast";
import { useUnsavedChangesGuard } from "../hooks/useUnsavedChangesGuard";
import { getErrorMessage } from "../utils/errorMessage";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

export function AddDepartmentScreen() {
  const navigation = useNavigation();
  const toast = useToast();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const guard = useUnsavedChangesGuard({ navigation, isDirty: name.trim().length > 0 });

  async function handleCreate() {
    const trimmed = name.trim();
    if (!trimmed) {
      setNameError("Department name is required");
      return;
    }
    setNameError(null);
    setFormError(null);
    setSubmitting(true);
    try {
      await departmentsApi.createDepartment({ name: trimmed });
      toast.show("success", "Department created successfully");
      guard.allowNextNavigation();
      navigation.goBack();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not create department"));
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="New Department" onBack={() => navigation.goBack()} />
        <Input
          label="Department Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (nameError) setNameError(null);
          }}
          placeholder="e.g. Technology"
          error={nameError ?? undefined}
          autoFocus
        />
        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <Button title="Create Department" onPress={handleCreate} loading={submitting} />
      </ScrollView>

      <ConfirmationDialog
        visible={guard.dialogVisible}
        title="Discard changes?"
        message="You have an unsaved department. Are you sure you want to discard it?"
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
  error: {
    color: colors.danger,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
