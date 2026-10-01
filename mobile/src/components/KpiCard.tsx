import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Card } from "./Card";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

interface KpiCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  tone?: "default" | "success" | "warning" | "danger";
}

const TONE_COLORS: Record<NonNullable<KpiCardProps["tone"]>, { icon: string; background: string }> = {
  default: { icon: colors.primary, background: colors.primaryMuted },
  success: { icon: colors.success, background: colors.successMuted },
  warning: { icon: colors.warning, background: colors.warningMuted },
  danger: { icon: colors.danger, background: colors.dangerMuted },
};

export function KpiCard({ icon, label, value, tone = "default" }: KpiCardProps) {
  const toneColors = TONE_COLORS[tone];

  return (
    <Card style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: toneColors.background }]}>
        <Ionicons name={icon} size={18} color={toneColors.icon} />
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "47%",
    flexGrow: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
