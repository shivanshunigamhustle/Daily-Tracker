import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";
import { fontFamily } from "../theme/typography";

const TINTS = [
  { bg: colors.primaryMuted, fg: colors.primary },
  { bg: colors.successMuted, fg: colors.success },
  { bg: colors.warningMuted, fg: colors.warning },
  { bg: colors.infoMuted, fg: colors.info },
  { bg: colors.dangerMuted, fg: colors.danger },
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function tintFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const tint = tintFor(name);
  return (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: tint.bg }]}>
      <Text style={[styles.text, { color: tint.fg, fontSize: size * 0.38 }]}>{initialsOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontFamily: fontFamily.bold,
  },
});
