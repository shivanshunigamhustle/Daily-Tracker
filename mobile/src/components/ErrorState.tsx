import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "./Button";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textMuted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && <Button title="Try Again" variant="outline" onPress={onRetry} style={styles.retryButton} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xxl,
    alignItems: "center",
    paddingHorizontal: spacing.xl,
  },
  title: {
    marginTop: spacing.md,
    fontFamily: fontFamily.bold,
    fontSize: 15,
    color: colors.textPrimary,
  },
  message: {
    marginTop: spacing.xs,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: "center",
  },
  retryButton: {
    marginTop: spacing.lg,
    minWidth: 140,
  },
});
