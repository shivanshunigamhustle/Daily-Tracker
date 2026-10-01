import React, { useRef } from "react";
import { Animated, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native";

interface PressableScaleProps extends Omit<PressableProps, "style" | "children"> {
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
}

/**
 * Thin wrapper around Pressable adding a consistent, subtle press-down
 * scale used across Button/Chip/tappable Card so micro-interactions feel
 * uniform throughout the app.
 *
 * `style` (background, size, flex, etc.) is applied to the outer Pressable
 * — not just the inner animated layer — so this participates correctly in
 * a parent's flex layout (e.g. two buttons with flex: 1 side by side).
 * Only the scale transform lives on the inner Animated.View.
 */
export function PressableScale({ scaleTo = 0.97, style, children, onPressIn, onPressOut, ...props }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn(e: Parameters<NonNullable<PressableProps["onPressIn"]>>[0]) {
    Animated.spring(scale, { toValue: scaleTo, useNativeDriver: true, speed: 50, bounciness: 0 }).start();
    onPressIn?.(e);
  }

  function handlePressOut(e: Parameters<NonNullable<PressableProps["onPressOut"]>>[0]) {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
    onPressOut?.(e);
  }

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={style} {...props}>
      <Animated.View style={[styles.inner, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
