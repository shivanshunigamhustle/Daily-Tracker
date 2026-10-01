import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { Card } from "./Card";
import { colors } from "../theme/colors";
import { radius, spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";
import { duration, useReducedMotion } from "../theme/animation";

export interface BarChartDatum {
  label: string;
  value: number;
  color: string;
}

interface BarChartProps {
  title: string;
  data: BarChartDatum[];
}

function Bar({ label, value, color, max, index }: BarChartDatum & { max: number; index: number }) {
  const reducedMotion = useReducedMotion();
  const widthAnim = useRef(new Animated.Value(0)).current;
  const pct = max > 0 ? value / max : 0;

  useEffect(() => {
    Animated.timing(widthAnim, {
      toValue: pct,
      duration: reducedMotion ? 0 : duration.large,
      delay: reducedMotion ? 0 : index * 80,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pct]);

  return (
    <View style={styles.row}>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color,
              width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
            },
          ]}
        />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

/** Simple horizontal bar chart — hand-rolled with Views, no charting
 * dependency needed for comparing a handful of counts. */
export function BarChart({ title, data }: BarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <Card>
      <Text style={styles.title}>{title}</Text>
      {data.map((d, i) => (
        <Bar key={d.label} {...d} max={max} index={i} />
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: fontFamily.semibold,
    fontSize: 15,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    width: 88,
  },
  track: {
    flex: 1,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    overflow: "hidden",
    marginHorizontal: spacing.sm,
  },
  fill: {
    height: "100%",
    borderRadius: radius.full,
  },
  value: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    color: colors.textPrimary,
    width: 24,
    textAlign: "right",
  },
});
