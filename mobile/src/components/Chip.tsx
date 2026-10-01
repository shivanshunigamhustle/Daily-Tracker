import React from "react";
import { StyleSheet, Text } from "react-native";
import { PressableScale } from "./PressableScale";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

type ChipVariant = "default" | "success" | "warning" | "danger" | "info";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  variant?: ChipVariant;
}

const VARIANT_COLORS: Record<ChipVariant, { background: string; text: string }> = {
  default: { background: colors.primary, text: colors.white },
  success: { background: colors.success, text: colors.white },
  warning: { background: colors.warning, text: colors.white },
  danger: { background: colors.danger, text: colors.white },
  info: { background: colors.info, text: colors.white },
};

export function Chip({ label, selected, onPress, variant = "default" }: ChipProps) {
  const selectedColors = VARIANT_COLORS[variant];
  const isInteractive = !!onPress;

  return (
    <PressableScale
      onPress={onPress}
      disabled={!isInteractive}
      accessibilityRole={isInteractive ? "button" : "text"}
      accessibilityState={isInteractive ? { selected: !!selected } : undefined}
      style={[
        styles.chip,
        selected ? { backgroundColor: selectedColors.background, borderColor: selectedColors.background } : styles.unselected,
      ]}
    >
      <Text style={[styles.text, selected ? { color: selectedColors.text, fontFamily: fontFamily.semibold } : styles.unselectedText]}>
        {label}
      </Text>
    </PressableScale>
  );
}

// Fixed semantic mapping for known status/role values — falls back to
// "default" styling for anything unrecognized.
const STATUS_VARIANT: Record<string, ChipVariant> = {
  ACTIVE: "success",
  ON_LEAVE: "warning",
  SUSPENDED: "danger",
  TERMINATED: "danger",
  SUPER_ADMIN: "info",
  ADMIN: "info",
  MANAGER: "default",
  EMPLOYEE: "default",
};

export function StatusChip({ status }: { status: string }) {
  const variant = STATUS_VARIANT[status] ?? "default";
  const label = status.replace(/_/g, " ");
  return <Chip label={label} selected variant={variant} />;
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    minHeight: 32,
    justifyContent: "center",
  },
  unselected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  text: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
  },
  unselectedText: {
    color: colors.textSecondary,
  },
});
