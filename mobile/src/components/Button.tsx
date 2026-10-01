import React from "react";
import { ActivityIndicator, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { PressableScale } from "./PressableScale";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

interface ButtonProps {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const VARIANT_STYLES: Record<ButtonVariant, { container: ViewStyle; text: { color: string } }> = {
  primary: { container: { backgroundColor: colors.primary }, text: { color: colors.white } },
  secondary: { container: { backgroundColor: colors.primaryMuted }, text: { color: colors.primary } },
  outline: {
    container: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
    text: { color: colors.textPrimary },
  },
  ghost: { container: { backgroundColor: "transparent" }, text: { color: colors.textSecondary } },
  danger: { container: { backgroundColor: colors.danger }, text: { color: colors.white } },
};

export function Button({ title, variant = "primary", loading, disabled, style, onPress, accessibilityLabel }: ButtonProps) {
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={[styles.base, variantStyle.container, disabled && styles.disabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.text.color} />
      ) : (
        <Text style={[styles.text, variantStyle.text]}>{title}</Text>
      )}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 48,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
  },
});
