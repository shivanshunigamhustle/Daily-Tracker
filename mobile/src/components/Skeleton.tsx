import React, { useEffect, useRef } from "react";
import { Animated, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { useReducedMotion } from "../theme/animation";

interface SkeletonBlockProps {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBlock({ width = "100%", height = 14, radius: r = radius.sm, style }: SkeletonBlockProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    if (reducedMotion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity, reducedMotion]);

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: r, backgroundColor: colors.border },
        reducedMotion ? { opacity: 0.6 } : { opacity },
        style,
      ]}
    />
  );
}

export function SkeletonCard() {
  return (
    <View style={styles.card}>
      <SkeletonBlock width="50%" height={16} style={styles.gap} />
      <SkeletonBlock width="80%" height={12} style={styles.gap} />
      <SkeletonBlock width="60%" height={12} />
    </View>
  );
}

export function SkeletonListRow() {
  return (
    <View style={styles.card}>
      <SkeletonBlock width="60%" height={15} style={styles.gap} />
      <SkeletonBlock width="40%" height={12} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  gap: {
    marginBottom: spacing.sm,
  },
});
