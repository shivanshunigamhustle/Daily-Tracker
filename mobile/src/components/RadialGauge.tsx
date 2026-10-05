import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fontFamily } from "../theme/typography";

interface RadialGaugeProps {
  value: number;
  label: string;
  caption?: string;
  color?: string;
  size?: number;
}

export function RadialGauge({ value, label, caption, color = colors.primary, size = 104 }: RadialGaugeProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = (clamped / 100) * circumference;

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.background} strokeWidth={stroke} fill="none" />
          {clamped > 0 ? (
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              fill="none"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          ) : null}
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={[styles.value, { color }]}>{clamped}%</Text>
        </View>
      </View>
      <Text style={styles.label}>{label}</Text>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    flex: 1,
    paddingVertical: spacing.sm,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontFamily: fontFamily.bold,
    fontSize: 20,
  },
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  caption: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: "center",
  },
});
