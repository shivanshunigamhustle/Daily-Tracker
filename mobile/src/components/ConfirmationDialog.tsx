import React, { useEffect, useRef } from "react";
import { Animated, Modal, StyleSheet, Text, View } from "react-native";
import { Button } from "./Button";
import { colors } from "../theme/colors";
import { radius, shadow, spacing } from "../theme/spacing";
import { typography } from "../theme/typography";
import { duration, useReducedMotion } from "../theme/animation";

interface ConfirmationDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmationDialog({
  visible,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    scale.setValue(reducedMotion ? 1 : 0.95);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: reducedMotion ? 0 : duration.small, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: reducedMotion ? 0 : duration.small, useNativeDriver: true }),
    ]).start();
  }, [visible, opacity, scale, reducedMotion]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[styles.overlay, { opacity }]}>
        <Animated.View
          style={[styles.dialog, { transform: [{ scale }] }]}
          accessibilityRole="alert"
          accessibilityLabel={title}
        >
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button title={cancelLabel} variant="ghost" onPress={onCancel} disabled={loading} style={styles.actionButton} />
            <Button
              title={confirmLabel}
              variant={destructive ? "danger" : "primary"}
              onPress={onConfirm}
              loading={loading}
              style={styles.actionButton}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
  },
  dialog: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadow.elevation3,
  },
  title: { ...typography.h3, marginBottom: spacing.xs },
  message: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
