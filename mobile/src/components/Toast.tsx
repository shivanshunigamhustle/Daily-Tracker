import React, { createContext, useCallback, useContext, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";
import { radius, shadow, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { duration, useReducedMotion } from "../theme/animation";

type ToastVariant = "success" | "error" | "warning" | "info";

interface ToastState {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  show: (variant: ToastVariant, message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const VARIANT_META: Record<ToastVariant, { icon: keyof typeof Ionicons.glyphMap; color: string; background: string }> = {
  success: { icon: "checkmark-circle", color: colors.success, background: colors.successMuted },
  error: { icon: "close-circle", color: colors.danger, background: colors.dangerMuted },
  warning: { icon: "warning", color: colors.warning, background: colors.warningMuted },
  info: { icon: "information-circle", color: colors.info, background: colors.infoMuted },
};

const DISMISS_AFTER_MS = 2500;
let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-12)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reducedMotion = useReducedMotion();

  const hide = useCallback(() => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: reducedMotion ? 0 : duration.small,
      useNativeDriver: true,
    }).start(() => setToast(null));
  }, [opacity, reducedMotion]);

  const show = useCallback(
    (variant: ToastVariant, message: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const id = nextId++;
      setToast({ id, message, variant });
      opacity.setValue(0);
      translateY.setValue(reducedMotion ? 0 : -12);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: reducedMotion ? 0 : duration.standard, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: reducedMotion ? 0 : duration.standard, useNativeDriver: true }),
      ]).start();
      timerRef.current = setTimeout(hide, DISMISS_AFTER_MS);
    },
    [opacity, translateY, reducedMotion, hide]
  );

  const meta = toast ? VARIANT_META[toast.variant] : null;

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {toast && meta && (
        <Animated.View
          pointerEvents="none"
          style={[styles.container, { top: insets.top + spacing.md, opacity, transform: [{ translateY }] }]}
        >
          <View style={[styles.toast, { backgroundColor: meta.background }]}>
            <Ionicons name={meta.icon} size={20} color={meta.color} />
            <Text style={[styles.message, { color: meta.color }]} numberOfLines={2}>
              {toast.message}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    alignItems: "center",
    zIndex: 1000,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    maxWidth: 480,
    width: "100%",
    ...shadow.elevation2,
  },
  message: {
    flex: 1,
    fontFamily: fontFamily.semibold,
    fontSize: 14,
  },
});
