import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import * as employeesApi from "../api/employees";
import * as departmentsApi from "../api/departments";
import * as teamsApi from "../api/teams";
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
import { Department, RoleName, Team } from "../types";

const ROLE_OPTIONS: RoleName[] = ["EMPLOYEE", "MANAGER", "ADMIN", "SUPER_ADMIN"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AddEmployeeScreen() {
  const navigation = useNavigation();
  const toast = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [roleName, setRoleName] = useState<RoleName>("EMPLOYEE");
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([departmentsApi.listDepartments(), teamsApi.listTeams()])
        .then(([d, t]) => {
          setDepartments(d);
          setTeams(t);
        })
        .catch(() => {});
    }, [])
  );

  const guard = useUnsavedChangesGuard({
    navigation,
    isDirty: !!(fullName.trim() || email.trim() || password),
  });

  function validate(): boolean {
    let valid = true;
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setFullNameError("Full name is required");
      valid = false;
    } else {
      setFullNameError(null);
    }

    if (!trimmedEmail) {
      setEmailError("Email is required");
      valid = false;
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError("Enter a valid email address");
      valid = false;
    } else {
      setEmailError(null);
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      valid = false;
    } else {
      setPasswordError(null);
    }

    return valid;
  }

  async function handleCreate() {
    setFormError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await employeesApi.createEmployee({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        roleName,
        departmentId: departmentId ?? undefined,
        teamId: teamId ?? undefined,
      });
      toast.show("success", "Employee created successfully");
      guard.allowNextNavigation();
      navigation.goBack();
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not create employee"));
      setSubmitting(false);
    }
  }

  const teamsInDepartment = teams.filter((t) => t.departmentId === departmentId);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <ScreenHeader title="New Employee" onBack={() => navigation.goBack()} />

        <Input
          label="Full Name"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (fullNameError) setFullNameError(null);
          }}
          placeholder="Jane Doe"
          error={fullNameError ?? undefined}
          autoFocus
        />
        <Input
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (emailError) setEmailError(null);
          }}
          keyboardType="email-address"
          placeholder="jane@company.com"
          error={emailError ?? undefined}
        />
        <Input
          label="Temporary Password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (passwordError) setPasswordError(null);
          }}
          isPassword
          placeholder="At least 8 characters"
          error={passwordError ?? undefined}
        />

        <Text style={styles.label}>Role</Text>
        <View style={styles.chipRow}>
          {ROLE_OPTIONS.map((role) => (
            <Chip key={role} label={role.replace(/_/g, " ")} selected={roleName === role} onPress={() => setRoleName(role)} />
          ))}
        </View>

        <Text style={styles.label}>Department</Text>
        <View style={styles.chipRow}>
          {departments.map((dept) => (
            <Chip
              key={dept.id}
              label={dept.name}
              selected={departmentId === dept.id}
              onPress={() => {
                setDepartmentId(dept.id);
                setTeamId(null);
              }}
            />
          ))}
        </View>

        {departmentId && teamsInDepartment.length > 0 && (
          <>
            <Text style={styles.label}>Team</Text>
            <View style={styles.chipRow}>
              {teamsInDepartment.map((team) => (
                <Chip key={team.id} label={team.name} selected={teamId === team.id} onPress={() => setTeamId(team.id)} />
              ))}
            </View>
          </>
        )}

        {formError ? <Text style={styles.error}>{formError}</Text> : null}
        <Button title="Create Employee" onPress={handleCreate} loading={submitting} />
      </ScrollView>

      <ConfirmationDialog
        visible={guard.dialogVisible}
        title="Discard changes?"
        message="You have an unsaved employee. Are you sure you want to discard it?"
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
    marginBottom: spacing.md,
  },
  error: {
    color: colors.danger,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
});
