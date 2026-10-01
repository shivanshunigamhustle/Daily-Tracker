import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "./PressableScale";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  /** Small icon badge shown to the left of the title — ignored when `onBack` is set. */
  icon?: keyof typeof Ionicons.glyphMap;
  rightElement?: React.ReactNode;
  onBack?: () => void;
}

export function ScreenHeader({ title, subtitle, icon, rightElement, onBack }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      {onBack && (
        <PressableScale
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </PressableScale>
      )}
      {icon && !onBack && (
        <View style={styles.iconBadge}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
      )}
      <View style={styles.textColumn}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.xs,
    marginLeft: -spacing.xs,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  textColumn: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
