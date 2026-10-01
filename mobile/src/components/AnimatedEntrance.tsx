import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle } from "react-native";
import { duration, staggerDelay, useReducedMotion } from "../theme/animation";

interface AnimatedEntranceProps {
  index?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Subtle fade + rise entrance, staggered by list index. Used for Dashboard
 * KPI cards and the first screenful of admin list rows. */
export function AnimatedEntrance({ index = 0, children, style }: AnimatedEntranceProps) {
  const reducedMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(reducedMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reducedMotion ? 0 : 10)).current;

  useEffect(() => {
    const delay = staggerDelay(index, reducedMotion);
    const anim = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: reducedMotion ? 0 : duration.standard, delay, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: reducedMotion ? 0 : duration.standard, delay, useNativeDriver: true }),
    ]);
    anim.start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>{children}</Animated.View>;
}
